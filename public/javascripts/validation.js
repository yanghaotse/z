// 表單驗證
const forms = document.querySelectorAll('.needs-validation')
Array.from(forms).forEach(form => {
  form.addEventListener('submit', function formSubmitted(event) {
    const email = document.querySelector('.email') || null
    const password = document.querySelector('.password') || null
    const emailInvalidFeedback = document.querySelector('.email-invalid-feedback') || null
    const passwordInvalidFeedback = document.querySelector('.password-invalid-feedback') || null

    if (email.value && !emailValidate(email.value)) {
      event.preventDefault()
      event.stopPropagation()
      emailInvalidFeedback.style.display = 'block'
      email.style = 'border: 1px solid red;'
    }

    if (password.value && !passwordValidate(password.value)) {
      event.preventDefault()
      event.stopPropagation()
      passwordInvalidFeedback.style.display = 'block'
      password.style = 'border: 1px solid red;'
    }

    if (!form.checkValidity() && !email.value && !password.value) {
      event.preventDefault()
      event.stopPropagation()
      form.classList.add('was-validated')
    }

  }, false)
})

// post-modal 字數驗證
const description = document.getElementById('description')
const postFeedback = document.getElementById('postFeedback')
if (description) {
  description.addEventListener('input', function postTextCount(event) {
  const textCount = description.value.length
  if (textCount >= 140) {
    postFeedback.innerText = '字數不可超過140字'
  } else {
    postFeedback.innerText=''
  }
})

}

// reply-modal 字數驗證
const comment = document.getElementById('comment')
const replyFeedback = document.getElementById('replyFeedback')
if (comment) {
  comment.addEventListener('input', function replyTextCount(event) {
    const textCount = comment.value.length
    if (textCount >= 140) {
      replyFeedback.innerText = '字數不可超過140字'
    } else {
      replyFeedback.innerText = ''
    }
  })
}


// user-name 字數計算
const profileName = document.getElementById('profile-name')
const nameCount = document.getElementById('name-count')
if (profileName) {
  profileName.addEventListener('input', function(event) {
    const textCount = profileName.value.length
    nameCount.innerText = `${textCount}/50`
  })
}


// user-introduction 字數計算
const profileIntro = document.getElementById('profile-intro')
const introCount = document.getElementById('intro-count')
if (profileIntro) {
  profileIntro.addEventListener('input', function(event) {
    const textCount = profileIntro.value.length
    introCount.innerText = `${textCount}/160`
  })
}


// email 格式驗證
function emailValidate(email) {
  const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
  if(email.search(emailRule) != -1){
    return true
  }else{
    return false
  }
}

// password 驗證: 至少8碼(需包含大小寫英文+數字)
function passwordValidate(password) {
  const minLength = 8
  if (password.match(/[a-z]/g) && password.match(/[A-Z]/g) && password.match(/[0-9]/g) && password.length >= minLength) {
    return true
  } else {
    return false
  }
}