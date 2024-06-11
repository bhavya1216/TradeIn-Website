//const  mongoose = require('mongoose'); 
const model = require('../models/item');
const User = require('../models/user');
const Offer = require('../models/offer');

exports.index = (req, res, next) => {
    model.find()
    .then(items=>{
       // model.distinct("category")
        //.then(categories=>{
            console.log(items)
            let categories = [...new Set(items.map(trade => trade.category))];
            res.render('./trade/index',{items,categories});

        })
        .catch(err=>next(err));
    };

exports.newTrade = (req, res) => {
    res.render('./trade/newTrade')
};

exports.create = (req, res, next)=>{
    let item = new model(req.body);//create a new story document
    item.author = req.session.user;
    item.offered = false;
    item.initiated = false;
    item.save()//insert the document to the database
    .then(item=> {
        req.flash('success', 'Item has been created successfully');
        res.redirect('/trades')
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);
            return res.redirect('/back');
            //err.status = 400;
        }
        next(err);
    });
    
};

exports.trade = (req, res, next)=>{
    let id = req.params.id;
    model.findById(id).populate('author', 'firstName lastName')
    .then(item=>{
        if(item) {  
            //console.log(item)  
            User.findById(req.session.user)
            .then(user => {
                let watchListed = false;
                if(user){
                    console.log(req.session.user+ " " +user);
                    if(user.watchlist.length > 0){
                        if(user.watchlist.indexOf(item._id) !== -1)
                            watchListed = true;
                    }  
                }    
            return res.render('./trade/trade', {item, watchListed});
            })
            .catch(err => next(err));
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next)=>{
    let id = req.params.id;
    model.findById(id).populate('author', 'author')
    .then(item=>{
        if(item) {
            return res.render('./trade/edit', {item});
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};


exports.update = (req, res, next)=>{
    let item = req.body;
    let id = req.params.id;
    model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
    .then(item=>{
        if(item) {
            res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError')
        {
            req.flash('error', err.message);
            return res.redirect('/back');
         }
           //err.status = 400;
        next(err);
    });
};

exports.delete = (req, res, next)=>{
    let id = req.params.id;
    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(item => {
        if(item && (item.status == "Available")){
            res.redirect('/trades');
        }
        else if(item && (item.status != "Traded")){
            if(item.offerto == id){
                console.log(item.offerto," ",id);
                Offer.find({offer_to: id})
                .then(offer => {
                    console.log(offer);
                    model.findByIdAndUpdate(offer[0].item_to_trade, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
                    .then(updt_trade => {
                        Offer.findOneAndDelete({offer_to: id}, {useFindAndModify: false})
                        .then(updt_offer => {
                            res.redirect('/trades');
                        })
                        .catch(err => next(err));
                    })
                    .catch(err => next(err));
                })
                .catch(err => next(err));
            }
            else if(item.offerby == id){
                console.log(item.offerby," ",id);
                Offer.find({item_to_trade: id})
                .then(offer => {
                    console.log(offer);
                    model.findByIdAndUpdate(offer[0].offer_to, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
                    .then(trade => {
                        Offer.findOneAndDelete({item_to_trade: id}, {useFindAndModify: false})
                        .then(offer => {
                            res.redirect('/trades');
                        })
                        .catch(err => next(err));
                    })
                    .catch(err => next(err));
                })
                .catch(err => next(err));
            }
        }
        else if(item && (item.status == "Traded")){
            if(item.offerby == id){
                model.findByIdAndUpdate(item.offerto, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
                .then(updt_trade => {
                    res.redirect('/trades');
                })
                .catch(err => next(err));
            }
            else if(item.offerto == id){
                model.findByIdAndUpdate(item.offerby, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
                .then(trade => {
                    res.redirect('/trades');
                })
                .catch(err => next(err));
            }
        }
        else{
            res.redirect('/trades');
        }
    })
    .catch(err => next(err));
};

exports.additemstowatchlist = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    User.findByIdAndUpdate(user, {$push: {watchlist: id}}, {useFindAndModify: false, runValidators: true})
    .then(user => {
        if(user)
           return res.redirect('../../users/profile');
        else
            return res.redirect('/users/login');
    })
    .catch(err => next(err));
};

exports.deleteitemsfromwatchlist = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    User.findByIdAndUpdate(user, {$pull: {watchlist: id}}, {useFindAndModify: false, runValidators: true})
    .then(user => {
        if(user)
            res.redirect('back');
    })
    .catch(err => next(err));
};





