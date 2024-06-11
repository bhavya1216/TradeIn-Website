const model = require('../models/user');
const Item = require('../models/item');
const Offer = require('../models/offer');

exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new trade');
    let user = new model(req.body);//create a new trade document
    user.save()//insert the document to the database
    .then(user=> {
        req.flash('success', 'Registration succeeded!');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }
        if(err.code === 11000) {
            req.flash('error', 'Email address has already been used');  
            return res.redirect('back');
        }
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
   /* if(email)
    email = email.toLowerCase();*/
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('error','wrong email address');
            //req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                } else {
                    req.flash('error', 'wrong password');      
                    res.redirect('/users/login');
                }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), Item.find({author: id}), Offer.find({offer_initiated_by: id})])
    .then(results => {
        const [user, items, offers] = results;
        Item.find({'_id':{$in:user.watchlist}})
        .then(watchList => {
            return res.render('./user/profile', {user, items, watchList, offers});
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};

exports.selectitem = (req, res, next) => {
    let id = req.params.id;
    Item.find({author: req.session.user})
    .then(items => {
        if(items.length > 0 )
            res.render('./user/item', {items, id});
        else{
            req.flash('error', 'no items to trade');      
            res.redirect('/items/');
        }
    })
    .catch(err => next(err));
};

exports.createoffer = (req, res, next) => {
    let id = req.params.id; //item id that you are interested in
    let user_item = req.body.item; //user's item to trade
    Promise.all([
        Item.findByIdAndUpdate(id, {status: "Offer Pending", offerby: user_item, offerto: id, offered: true}, {useFindAndModify: false, runValidators: true}),
        Item.findByIdAndUpdate(user_item, {status: "Offer Pending",  offerto: id, offerby: user_item, initiated: true}, {useFindAndModify: false, runValidators: true})])
    .then(results => {
        let [item, user_item] = results;
        console.log(item, user_item);
        let offer = new Offer();
        offer.offer_initiated_by = req.session.user;
        offer.title = item.title;
        offer.category = item.category;
        offer.status = item.status;
        offer.item_to_trade = user_item;
        offer.offer_to = id;
        offer.save()
        .then(offer => {
            console.log("Offer:",offer);
            return res.redirect('/users/profile');
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.canceloffer = (req, res, next) => {
    let id = req.session.user;
    let item = req.params.id;
    Offer.findOneAndDelete({offer_to: item}, {useFindAndModify: false})
    .then(offer => {
        console.log(offer);
        Item.findByIdAndUpdate(item, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
        .then(updt_item => {
            Item.findByIdAndUpdate(updt_item.offerby, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
            .then(updtt_item => {
                console.log("item: ", updtt_item);
                return res.redirect('/users/profile');
            })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.manageoffer = (req, res, next) => {
    let id = req.params.id;
    Item.findById(id)
    .then(item => {
        if(!item.offered){
            Offer.find({item_to_trade: id})
            .then(offer => {
                if(offer.length > 0){
                    Promise.all([Item.findById(offer[0].offer_to), Item.findById(offer[0].item_to_trade)])
                    .then(results => {
                        let [trade, updt_item] = results;
                        console.log(trade, updt_item);
                        let initiated = updt_item.initiated;
                        res.render('./user/manageoffer', {trade, updt_item, initiated});
                    })
                    .catch(err => next(err));
                }
                else{
                    let err = new Error('Cannot find an offer');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        }
        else{
            Offer.find({offer_to: id})
            .then(offer => {
                if(offer.length > 0){
                    Promise.all([Item.findById(offer[0].offer_to), Item.findById(offer[0].item_to_trade)])
                    .then(results => {
                        let [trade, updt_item] = results;
                        console.log(trade, updt_item);
                        let initiated = trade.initiated;
                        res.render('./user/manageoffer', {trade, updt_item, initiated});
                    })
                    .catch(err => next(err));
                }
                else{
                    let err = new Error('Cannot find an offer');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));

    
};

exports.acceptoffer = (req, res, next) => {
    let id = req.session.user;
    let item = req.params.id;
    Offer.find({offer_to: item, offer_initiated_by: id}, {useFindAndModify: false})
    .then(offer => {
        Item.findByIdAndUpdate(item, {status: 'Traded', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
        .then(updt_item => {
            Item.findByIdAndUpdate(updt_item.offerby, {status: 'Traded', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
            .then(updt_item => {
                Offer.findOneAndDelete({offer_to: item}, {useFindAndModify: false})
                .then(offer => {
                    res.redirect('/users/profile');
                })
                .catch(err => next(err));
            })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};



exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };



