const express = require('express')
const router = express.Router()
const { authenticated } = require('../../../middleware/auth')
const chatroomController = require('../../../controllers/pages/chatroom-controller')


router.get('/private', authenticated, chatroomController.getChatList)
router.get('/private/:id', authenticated, chatroomController.getChatRoom)

module.exports = router