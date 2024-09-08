var express = require('express');
const { register, login } = require('../controllers/AuthController');
var router = express.Router();

/* GET users listing. */
router.post('/sign-up', register);
router.post('/sign-in', login);

module.exports = router;
