const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
const tweetController = require('../../controllers/apis/tweet-controller')
const userController = require('../../controllers/apis/user-controller')

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.get('/tweets', tweetController.getTweets)

router.use('/', apiErrorHandler)


module.exports = router