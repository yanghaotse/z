const socket = io()

const userList = document.querySelector('.user-list')
const chatContent = document.getElementById('chat-content')
const currentUserId = parseInt(document.getElementById('current-user-id').innerHTML)

if (chatContent) {
  scrollChatToBottom()
}

// 接收訊息
socket.on('private message', async(data) => {
  try {
    const chatUserId = parseInt(document.getElementById('chat-user-id').innerHTML)
    const { text, senderId, receiverId } = data.data
    console.log('==============================')
    console.log('frontReceivedData:', data)
    scrollChatToBottom()
    // const currentTime = getCurrentTime()
    // 訊息渲染畫面
    if (parseInt(senderId) === chatUserId) {
      const templateMsg = document.querySelector('.chat-user').cloneNode(true)
      templateMsg.children[1].children[0].children[0].textContent = `${text}`
      // templateMsg.children[1].children[1].textContent = `${currentTime}`
      chatContent.appendChild(templateMsg)
    }
    
    if (parseInt(senderId) === currentUserId) {
      const templateMsg = document.createElement('div')
      // const currentTime = getCurrentTime()
      templateMsg.innerHTML = `
        <div class="current-user d-flex flex-column align-items-end m-1">
          <div class="content p-2" style="border-radius:25px 25px 0 25px; background:#222;">
            <p class="content-text m-0 light">${text}</p>
          </div>
          <div class="time top-100" style="font-size: 13px; color:#657786; text-align:end">

          </div>
        </div>
      `;
      chatContent.appendChild(templateMsg)
    }
    scrollChatToBottom()
  } catch (err) {
    console.error(err)
  }
})


const form = document.getElementById('chat-form')
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault()
    const chatUserId = parseInt(document.getElementById('chat-user-id').innerHTML)
    const msg = e.target.elements.msg.value
    // 訊息渲染畫面
    if(msg) {
      // 將訊息傳到 server
      const messageData = {
        text: msg,
        senderId: currentUserId,
        receiverId: chatUserId
      }
      socket.emit('chatroom', { data: messageData })
      e.target.elements.msg.value = ''
    }
  })
}

// 卷軸置底
function scrollChatToBottom() {
  chatContent.scrollTop = chatContent.scrollHeight
}
// message 時間戳記
// function getCurrentTime () {
//   const now = new Date()
//   const hours = now.getHours()
//   const minutes = now.getMinutes()
//   const ampm = hours >= 12 ? 'PM' : 'AM'
//   const formattedHours = hours % 12 === 0 ? 12 : hours % 12
//   return `${ampm}${formattedHours}:${String(minutes).padStart(2, '0')} `
// }