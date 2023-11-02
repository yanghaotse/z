// messages 自動消失
const alertElement = document.getElementById('alert')
if (alertElement.style.display !== 'none') {
  setTimeout(() => {
    alertElement.style.display = 'none'
  }, 3000)
}

// 表單驗證
(() => {
  'use strict'
  const forms = document.querySelectorAll('.needs-validation')
  forms.forEach(form => {
    form.addEventListener('submit', function formSubmitted(event) {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
})()


