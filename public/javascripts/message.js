// messages 自動消失
const alertElement = document.getElementById('alert')
if(alertElement) {
  if (alertElement.style.display !== 'none') {
    setTimeout(() => {
      alertElement.style.display = 'none'
    }, 3000)
  }
}