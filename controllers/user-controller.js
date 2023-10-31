const bcrypt = require('bcryptjs')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  }
}


module.exports = userController