const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')
const { apiErrorHandler } = require('../../middleware/error-handler')
const tweetController = require('../../controllers/apis/tweet-controller')
const userController = require('../../controllers/apis/user-controller')
const { authenticated } = require('../../middleware/api-auth')

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.get('/tweets', authenticated, tweetController.getTweets)

router.use('/', apiErrorHandler)


module.exports = router