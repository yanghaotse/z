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





