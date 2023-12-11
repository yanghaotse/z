// const { PrivateMsg } = require('../models')


// module.exports = (io) => {
//   io.on('connection', async(socket) => {
//     console.log('a user connected')
//     try {
//       socket.on('join room', (roomName) => {
//       socket.join(roomName)
//       console.log('===================================')
//       console.log(`User joined room: ${roomName}`)
//     })

//     socket.on('private message', async({ data }, selectedChatRoom) => {
//       try {
//         console.log('===================================')
//         console.log('severReceivedData:', data)
//         const { text, senderId, receiverId } = data

//         socket.to(selectedChatRoom).emit('private message', data)
//         const createMsg = await PrivateMsg.create({
//           text,
//           senderId,
//           receiverId
//         })
//         console.log('==========================')
//         console.log('createdMsg:', createMsg)

//       } catch(err) {
//         console.error(err)
//       }
//     })

//     socket.on('disconnect', () => {
//       console.log('user disconnected')
//     })
//     } catch(err) {
//       console.log(err)
//     }
    
//   })
// }