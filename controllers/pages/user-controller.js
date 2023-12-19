const bcrypt = require('bcryptjs')
const { User, Tweet, Reply, Followship, Like } = require('../../models')
const { Op } = require('sequelize')
const { getUser } = require('../../helpers/auth-helpers') 
const { getRecommendedFollowings } = require('../../helpers/user-helpers')
const { imgurFileHandler } = require('../../helpers/file-helpers')
const userService = require('../../services/user-services')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: async(req, res, next) => {
    await userService.signup(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功註冊!')
      return res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    return res.redirect('/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    return res.redirect('/signin')
  },
  getUserTweets: async(req, res, next) => {
    await userService.getUserTweets(req, (err, data) => err ? next(err) : res.render('user/user-tweets', data))
  },
  getUserFollowers: async(req, res, next) => {
    await userService.getUserFollowers(req, (err, data) => err ? next(err) : res.render('user/user-followers', data))
  },
  getUserFollowings: async(req, res, next) => {
    await userService.getUserFollowings(req, (err, data) => err ? next(err) : res.render('user/user-followings', data))
  },
  getUserReplies: async(req, res, next) => {
    await userService.getUserReplies(req, (err, data) => err ? next(err) : res.render('user/user-replies', data))
  },
  getUserLikes: async(req, res, next) => {
    await userService.getUserLikes(req, (err, data) => err ? next(err) : res.render('user/user-likes', data))
  },
  getUserSetting: async(req, res, next) => {
    await userService.getUserSetting(req, (err, data) => err ? next(err) : res.render('user/user-setting', data))
  },
  addFollowing: async(req, res, next) => {
    await userService.addFollowing(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeFollowing: async(req, res, next) => {
    await userService.removeFollowing(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  putUserSetting: async(req, res, next) => {
    await userService.putUserSetting(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '編輯成功!')
      res.redirect(`/users/${currentUser.id}/setting`)
    })
  },
  putUserProfile: async(req, res, next) => {
    await userService.putUserProfile(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者資料更新成功')
      return res.redirect('back')
    })
  },
  deleteTweet: async(req, res, next) => {
    try {
      const currentUser = getUser(req)
      const tweetId = req.body.id
      const tweet = await Tweet.findByPk(tweetId, {
        include: [User],
        raw: true,
        nest: true 
      })

      if (tweet.User.id !== currentUser.id) {
        req.flash('error_messages', '無法刪除他人貼文')
        return redirect('back')
      } else {
        await Tweet.destroy({ where: { id: tweetId }})
        await Reply.destroy({ where: { TweetId: tweetId }})
        await Like.destroy({ where: { TweetId: tweetId }})
      }
      
      return res.redirect('back')
    } catch(err) {
      next(err)
    }
  },
  deleteReply: async(req, res, next) => {
    try {
      const currentUserId = getUser(req).id
      const replyId = req.body.id
      const reply = await Reply.findByPk(replyId, { raw: true, nest: true })
      if (!reply) throw new Error('回覆內容不存在')

      if (reply.userId !== currentUserId) {
        req.flash('error_messages', '無法刪除他人留言')
        return res.redirect('back')
      } else {
        await Reply.destroy({ where: { id: replyId }})
      }

      return res.redirect('back')
    } catch(err) {
      next(err)
    }
  }
}


module.exports = userController