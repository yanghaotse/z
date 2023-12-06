const socket = io()

const userList = document.querySelector('.user-list')
const chatContent = document.getElementById('chat-content')
const currentUserId = parseInt(document.getElementById('current-user-id').innerHTML)
const selectedChatRoom = localStorage.getItem('selectedChatRoom')

userList.addEventListener('click', (e) => {
  e.preventDefault()
  const button = e.target.closest('.user-button')

  if (button) {
    const chatUserId = parseInt(button.dataset.userId, 10)
    const sortedId = [currentUserId, chatUserId].sort((a, b) => a - b)
    const selectedChatRoom = `chatRoom${sortedId}`
    
    localStorage.setItem('selectedChatRoom', selectedChatRoom)
    window.location.href = `/chatroom/private/${chatUserId}`
    socket.emit('join room', selectedChatRoom)
  }
})

if (selectedChatRoom) {
  socket.emit('join room', selectedChatRoom)
  const form = document.getElementById('chat-form')
  const input = document.getElementById('chat-input')

  form.addEventListener('submit', function(e) {
    e.preventDefault()
    const chatUserId = parseInt(document.getElementById('chat-user-id').innerHTML)
    // 訊息渲染畫面
    if(input.value) {
      const templateMsg = document.createElement('div')
      const currentTime = getCurrentTime()
      templateMsg.innerHTML = `
        <div class="current-user d-flex flex-column align-items-end m-1">
          <div class="content p-2" style="border-radius:25px 25px 0 25px; background:#222;">
            <p class="content-text m-0 light">${input.value}</p>
          </div>
          <div class="time top-100" style="font-size: 13px; color:#657786; text-align:end">
            ${currentTime}
          </div>
        </div>
      `;
      const messageData = {
        text: input.value,
        senderId: currentUserId,
        receiverId: chatUserId
      }
      // 將訊息傳到 server
      socket.emit('private message', { data: messageData }, selectedChatRoom)
      chatContent.appendChild(templateMsg)
      scrollChatToBottom()
      input.value = ''
    }
  })

  // 接收訊息
  socket.on('private message', async(data, room) => {
    const currentTime = getCurrentTime()
    // 訊息渲染畫面
    if (parseInt(data.senderId) !== currentUserId) {
      const templateMsg = document.querySelector('.chat-user').cloneNode(true)
      templateMsg.children[1].children[0].children[0].textContent = `${data.text}`
      templateMsg.children[1].children[1].textContent = `${currentTime}`
      chatContent.appendChild(templateMsg)
      scrollChatToBottom()
    }
  })
}

// 卷軸置底
function scrollChatToBottom() {
  chatContent.scrollTop = chatContent.scrollHeight
}
// message 時間戳記
function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12
  return `${ampm}${formattedHours}:${String(minutes).padStart(2, '0')} `
}