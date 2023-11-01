const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: async(req, res) => {
    const { account, name, email, password, checkPassword } = req.body
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      account,
      name,
      password: hashPassword
    })
    res.render('signin')
  }
}


module.exports = userController