const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')
const upload = require('../../middleware/multer')
const { authenticated, authenticateAdmin } = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler')

const tweetController = require('../../controllers/apis/tweet-controller')
const userController = require('../../controllers/apis/user-controller')
const adminController = require('../../controllers/apis/admin-controller')
const admin = require('./modules/admin')


router.post('/admin/signin', passport.authenticate('local', { session: false }), adminController.adminSignIn)
router.use('/admin', authenticateAdmin, admin)

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/signup', userController.signUp)
router.get('/users/:id/tweets', authenticated, userController.getUserTweets)
router.get('/users/:id/followers', authenticated, userController.getUserFollowers)
router.get('/users/:id/followings', authenticated, userController.getUserFollowings)
router.get('/users/:id/replies', authenticated, userController.getUserReplies)
router.get('/users/:id/likes', authenticated, userController.getUserLikes)
router.get('/users/:id/setting', authenticated, userController.getUserSetting)
router.put('/users/:id/setting', authenticated, userController.putUserSetting)
router.put('/users/:id/edit', authenticated, upload.fields([{ name:'cover', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), userController.putUserProfile)
router.delete('/users/tweets', authenticated, userController.deleteTweet)
router.delete('/users/replies', authenticated, userController.deleteReply)
router.delete('/followships/:id', authenticated, userController.removeFollowing)
router.post('/followships', authenticated, userController.addFollowing)

router.post('/tweets/:id/like', authenticated, tweetController.addLike)
router.post('/tweets/:id/unlike', authenticated, tweetController.removeLike)
router.post('/tweets/:id/replies', authenticated, tweetController.postReply)
router.get('/tweets/:id/replies', authenticated, tweetController.getTweet)
router.get('/tweets', authenticated, tweetController.getTweets)
router.post('/tweets', authenticated, tweetController.postTweet)

router.use('/', apiErrorHandler)


module.exports = router