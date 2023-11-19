
function previewImage(imgId, input) {
  const imgElement = document.getElementById(imgId)

  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()

    reader.onerror = function (e) {
      console.error('圖片讀取錯誤', e.target.error)
    }
    
    reader.onload = function(e) {
      imgElement.src = e.target.result
    }

    reader.readAsDataURL(file)
  }
}

// image-delete
const coverImg = document.getElementById('cover-img')
const coverDel = document.getElementById('cover-del')
const originalCover = coverImg.src
coverDel.addEventListener('click', function onCoverDelClicked(event) {
  coverImg.src = originalCover
})

