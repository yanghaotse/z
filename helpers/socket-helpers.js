const { PrivateMsg } = require('../models')


module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected')
    
    socket.on('join room', (roomName) => {
      socket.join(roomName)
      console.log(`User joined room: ${roomName}`)
    })

    socket.on('private message', async({ data }, selectedChatRoom) => {
      try {
        console.log('sever data:', data)
        await PrivateMsg.create({
          text: data.text,
          senderId: data.senderId,
          receiverId: data.receiverId
        })
        socket.to(selectedChatRoom).emit('private message', data)
      } catch(err) {
        console.error(err)
      }
    })

    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}