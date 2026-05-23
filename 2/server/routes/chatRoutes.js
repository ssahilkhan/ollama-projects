const express = require('express');
const router = express.Router();
const { chat, getChatHistory, testChat } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.get('/history', auth, getChatHistory);
router.post('/', auth, chat);
router.get('/test', testChat);

module.exports = router;