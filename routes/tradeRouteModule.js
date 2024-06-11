const express = require('express');
const controller = require('../controllers/tradeControllerModule');
const {isLoggedIn, isAuthor} = require('../middlewares/auth'); 
const {validateId,validateLogin,validateSignup,validationresult} = require('../middlewares/validator');
const router = express.Router();

//GET /items: send all items to the user

router.get('/', controller.index);

//GET /items/new: send html form for creating a new item

router.get('/new', isLoggedIn, controller.newTrade);

//POST /items: create a new item

router.post('/', isLoggedIn, controller.create);

//GET /items/:id: send details of item identified by id
router.get('/:id', validateId, controller.trade);

//POST /items/:id/watch: Add the items/dresses to user's watchlist
router.post('/:id/watch', validateId,isLoggedIn, controller.additemstowatchlist);

//POST /items/:id/unwatch: delete the items/dresses from user's watchlist
router.post('/:id/unwatch', validateId,isLoggedIn, controller.deleteitemsfromwatchlist);

//GET /items/:id/edit: send html form for editing an exising item
router.get('/:id/edit', validateId, isLoggedIn, isAuthor, controller.edit);

//PUT /items/:id: update the item identified by id
router.put('/:id',  controller.update);

//DELETE /items/:id, delete the item identified by id
router.delete('/:id', isLoggedIn, isAuthor, validateId, controller.delete);

module.exports = router;