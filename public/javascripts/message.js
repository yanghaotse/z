// messages 自動消失
const alertElement = document.getElementById('alert')
if(alertElement) {
  if (alertElement.style.display !== 'none') {
    setTimeout(() => {
      alertElement.style.display = 'none'
    }, 3000)
  }
}


// 表單驗證
const forms = document.querySelectorAll('.needs-validation')
Array.from(forms).forEach(form => {
  form.addEventListener('submit', function formSubmitted(event) {
    if (!form.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
    }
    form.classList.add('was-validated')
  }, false)
})

// post-modal 字數驗證
const description = document.getElementById('description')
const postFeedback = document.getElementById('postFeedback')
description.addEventListener('input', function postTextCount(event) {
  const textCount = description.value.length
  if (textCount >= 140) {
    postFeedback.innerText = '字數不可超過140字'
  } else {
    postFeedback.innerText=''
  }
})

// reply-modal 字數驗證
const comment = document.getElementById('comment')
const replyFeedback = document.getElementById('replyFeedback')
comment.addEventListener('input', function replyTextCount(event) {
  const textCount = comment.value.length
  if (textCount >= 140) {
    replyFeedback.innerText = '字數不可超過140字'
  } else {
    replyFeedback.innerText = ''
  }
})




