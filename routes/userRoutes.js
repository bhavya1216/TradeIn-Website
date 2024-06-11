const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn} = require('../middlewares/auth'); 
//const {validateId} = require('../middlewares/validator');
const{logInLimiter} = require('../middlewares/rateLimiter');
const {validateId,validateLogin,validateSignup,validationresult} = require('../middlewares/validator');

const router = express.Router();

//GET /users/new: send html form for creating a new user account

router.get('/new', isGuest, controller.new);

//POST /users: create a new user account

router.post('/', isGuest, validateSignup, validationresult, controller.create);

//GET /users/login: send html for logging in
router.get('/login', isGuest, controller.getUserLogin);

//GET /users/item/:id : Select items to create an offer/ trade 
router.get('/item/:id', validateId, controller.selectitem);

//POST /users/trade/offer/:id: create an offer for the item with your items
router.post('/item/offer/:id', validateId, controller.createoffer);

//POST /users/login: authenticate user's login
router.post('/login', logInLimiter, isGuest, validateLogin, validationresult, controller.login);

//GET /users/profile: send user's profile page
router.get('/profile', isLoggedIn, controller.profile);

//POST /users/canceloffer/:id : cancel offers for that user
router.post('/canceloffer/:id', isLoggedIn, controller.canceloffer);

//POST /users/manageoffer/:id : manage offers for that user
router.post('/manageoffer/:id', isLoggedIn, controller.manageoffer);

//POST /users/acceptoffer/:id : accept offer for that user
router.post('/acceptoffer/:id', isLoggedIn, controller.acceptoffer);

//GET /users/logout: logout a user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;