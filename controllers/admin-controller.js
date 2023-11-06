const adminController = {
  getTweets: (req, res) => {
    res.render('admin/tweets')
  },
  signInPage: (req, res, next) => {
    res.render('admin/signin')
  }
}


module.exports = adminController