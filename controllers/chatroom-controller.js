const chatroomController = {
  getChatroom: async(req, res, next) => {
    res.render('chatroom/chat-private')
  }
}


module.exports = chatroomController