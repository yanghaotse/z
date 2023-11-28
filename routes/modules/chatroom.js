const express = require('express')
const router = express.Router()
const { authenticated } = require('../../middleware/auth')
const chatroomController = require('../../controllers/chatroom-controller')


router.get('/private/:id', authenticated, chatroomController.getChatroom)

module.exports = router