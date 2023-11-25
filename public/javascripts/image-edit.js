const imageDiv = document.getElementById('post-img-div')
const imageInput = document.getElementById('image-add')

function previewUserImage(imgId, input) {
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

function previewTweetImage(imgId, input) {
  const imgElement = document.getElementById(imgId)

  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()

    reader.onerror = function (e) {
      console.error('圖片讀取錯誤', e.target.error)
    }
    
    reader.onload = function(e) {
      imgElement.src = e.target.result
      imageDiv.style.display = 'block'
    }

    reader.readAsDataURL(file)
  }
}

// cover-delete
const coverImg = document.getElementById('cover-img')
const coverDel = document.getElementById('cover-del')
if (coverImg && coverDel) {
  const originalCover = coverImg.src
  coverDel.addEventListener('click', function onCoverDelClicked(event) {
    coverImg.src = originalCover
  })
}


// image-delete
const imgDel = document.getElementById('image-del')
const tweetImg = document.getElementById('tweet-img')

if (imgDel) {
  imgDel.addEventListener('click', function onTweetDelClicked() {
    tweetImg.src = ''
    imageInput.files[0] = null
    imageDiv.style.display = 'none'
  })
}



