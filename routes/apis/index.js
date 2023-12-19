const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')
const tweetController = require('../../controllers/apis/tweet-controller')
const userController = require('../../controllers/apis/user-controller')
const adminController = require('../../controllers/apis/admin-controller')
const admin = require('./modules/admin')
const { authenticated, authenticateAdmin } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.post('/admin/signin', passport.authenticate('local', { session: false }), adminController.adminSignIn)
router.use('/admin', authenticateAdmin, admin)

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/signup', userController.signUp)
router.get('/users/:id/tweets', authenticated, userController.getUserTweets)
router.get('/users/:id/followers', authenticated, userController.getUserFollowers)
router.get('/users/:id/followings', authenticated, userController.getUserFollowings)
router.get('/users/:id/replies', authenticated, userController.getUserReplies)

router.post('/tweets/:id/like', authenticated, tweetController.addLike)
router.post('/tweets/:id/unlike', authenticated, tweetController.removeLike)
router.post('/tweets/:id/replies', authenticated, tweetController.postReply)
router.get('/tweets/:id/replies', authenticated, tweetController.getTweet)
router.get('/users/:id/likes', authenticated, userController.getUserLikes)
router.get('/users/:id/setting', authenticated, userController.getUserSetting)

router.get('/tweets', authenticated, tweetController.getTweets)
router.post('/tweets', authenticated, tweetController.postTweet)

router.use('/', apiErrorHandler)


module.exports = router