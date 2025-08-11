const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { getDoctors } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/doctors', verifyToken, getDoctors);
router.post('/login', login);
router.post('/register', register);

module.exports = router;
