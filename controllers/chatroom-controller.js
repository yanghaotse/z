const { User, PrivateMsg } = require('../models')
const { Op } = require('sequelize')
const { getUser } = require('../helpers/auth-helpers')

// 抓出聊天對象和其最新一筆聊天紀錄
const userChatList = async(req) => {
  try {
    const currentUser = getUser(req)

    const chats = await PrivateMsg.findAll({
      where: {
        [Op.or]: [{ senderId: currentUser.id }, { receiverId: currentUser.id }]
      },
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'receiver'}
      ],
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    })
    // chats 已排序
    const chatList = chats.reduce((result, chat) => {
      // 以聊天對象的 id 為 key 做查詢
      const key = chat.senderId === currentUser.id ? chat.receiverId : chat.senderId
      // 若查無結果則建立一空物件
      if (!result[key]) {
        result[key] = { user: null, chats: [] }
      }
      // 設 user 為聊天對象 id
      if (!result[key].user) {
        result[key].user = chat.senderId === currentUser.id ? chat.receiver : chat.sender
      }
      // 若 chats 內尚無聊天紀錄，則將最新一筆 chat 放入 
      if (result[key].chats.length === 0) {
        result[key].chats.push(chat)
      }

      return result
    }, {})
    // 將物件轉換陣列
    const chatListArray = Object.entries(chatList).map(([key, value]) => ({
      user: value.user,
      chats: value.chats
    }))
    return chatListArray
  } catch(err) {
    next (err)
  }
}

const chatroomController = {
  getChatList: async(req, res, next) => {
    try {
      const chatList = await userChatList(req)
      const currentUser = getUser(req)
      return res.render('chatroom/private-chat', { chatList, currentUser })
    } catch (err) {
      console.error(err)
      res.status(500).send('載入時發生錯誤')
    }
  },
  getChatRoom: async(req, res, next) => {
    try {
      console.log('============================enter chatroom')
      const currentUser = getUser(req)
      const [currentUserId, chatUserId] = [Number(currentUser.id), Number(req.params.id)]
      if(chatUserId === currentUserId) throw new Error('無法跟自己聊天')
      const chatList = await userChatList(req)
      const chats = await PrivateMsg.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { senderId: currentUserId },
                { receiverId: chatUserId }
              ]
            },
            {
              [Op.and]: [
                { senderId: chatUserId },
                { receiverId: currentUserId }
              ]
            }
          ]
        },
        include: [
          { model: User, as: 'sender' },
          { model: User, as: 'receiver' }
        ],
        order: [
          ["createdAt", 'ASC']
        ],
        raw: true,
        nest: true
      })
      const chatUser = await User.findByPk(chatUserId, { raw: true, nest: true })
      if (!chatUser) throw new Error('使用者不存在')

      console.log('=================chatUser:',chatUser)
      return res.render('chatroom/private-chat', { chatList, chats, currentUser, chatUser })
    } catch(err) {
      next(err)
    }
  }

}


module.exports = chatroomController