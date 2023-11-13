const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const tweetController = require('../controllers/tweet-controller')
const userController = require('../controllers/user-controller')
const adminController = require('../controllers/admin-controller')
const admin = require('./modules/admin')
const { generalErrorHandler } = require('../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')

// 後臺登入 
router.get('/admin/signin', adminController.adminSignInPage)
router.post('/admin/signin', passport.authenticate('local', { failureRedirect: '/admin/signin', failureFlash: true }), adminController.adminSignIn)
router.use('/admin', authenticatedAdmin, admin)

// 前台登入
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/logout', userController.logout)

// 使用者功能
router.get('/users/:id/tweets', authenticated, userController.getUserTweets)
router.get('/users/:id/followers', authenticated, userController.getUserFollowers)
router.get('/users/:id/followings', authenticated, userController.getUserFollowings)
router.get('/users/:id/replies', authenticated, userController.getUserReplies)
router.get('/users/:id/likes', authenticated, userController.getUserLikes)
router.get('/users/:id/setting', authenticated, userController.getUserSetting)

// 首頁
router.get('/tweets', authenticated, tweetController.getTweets)
router.use('/', (req, res) => res.redirect('/tweets'))
router.use('/', generalErrorHandler)
module.exports = router