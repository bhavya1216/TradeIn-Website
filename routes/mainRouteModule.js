const express = require('express');
const controller = require('../controllers/mainControllerModule')

const router = express.Router();

router.get('/', controller.index)

router.get('/about', controller.aboutus)

router.get('/contact', controller.contactus)

module.exports = router;