
const {body} = require('express-validator');
const {validationResult} = require('express-validator');

//checking if the id is valid or not
exports.validateId = (req, res, next) => {
    let id = req.params.id;
    console.log(id);
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    } else {
        next();
    }
}

exports.validateSignup = [body('firstName', 'First Name cannot be empty').notEmpty().trim().escape(),
body('lastName', 'Last Name cannot be empty').notEmpty().trim().escape(),
body('email', 'Email must be a valid mail address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'password must be atleast 8 char and atmost 64').isLength({min:8, max:64})];

exports.validateLogin = [body('email', 'Email must be a valid mail address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'password must be atleast 8 char and atmost 64').isLength({min:8, max:64})];

exports.validationresult= (req,res,next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    }
    else{
        return next();
    }  
}

exports.validateitem = [body('title', 'Title cannot be empty').notEmpty().trim().escape(),
body('content', 'content must be atleast 10 characters long').isLength({min:10}).trim().escape()];