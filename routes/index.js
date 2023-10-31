const express = require('express')
const router = express.Router()
const tweetController = require('../controllers/tweet-controller')
const userController = require('../controllers/user-controller')
const admin = require('./modules/admin')

router.use('/admin', admin)

router.get('/signup', userController.signUpPage)
router.get('/tweets', tweetController.getTweets)
router.use('/', (req, res) => res.redirect('/tweets'))

module.exports = router