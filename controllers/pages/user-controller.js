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
    try {
      const currentUser = getUser(req)
      const { account, name, email, password, passwordCheck } = req.body

      if (!account || !name || !email) throw new Error ('帳戶、名稱、Email 為必填欄位')
      if (password !== passwordCheck) throw new Error('密碼與確認密碼不相符')
      if (name > 50) throw new Error('字數超出上限')

      // 查詢是否有已存在的 account 或 email(不包含當前使用者account、email)
      const existingUserData = await User.findOne({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { account: account },
                { account: { [Op.notLike]: currentUser.account }}
              ]
            },
            {
              [Op.and]: [
                { email: email },
                { email: { [Op.notLike]: currentUser.email }}
              ]
            }
          ]
        }
      })
      if (existingUserData) {
        if (existingUserData.toJSON().account === account) throw new Error('帳號已經被使用')
        if (existingUserData.toJSON().email === email) throw new Error('Email 已經被使用')
      }
      // 若使用者有修改密碼
      if (password) {
        const hashPassword = await hash.bcrypt(password, 10)
        await User.update({
          account,
          name,
          email,
          password: hashPassword
        }, {
          where: {
            id: currentUser.id
          }
        })
      } else {
        await User.update({
          account,
          name,
          email
        }, {
          where: {
            id: currentUser.id
          }
        })
      }

      req.flash('success_messages', '編輯成功!')
      return res.redirect(`/users/${currentUser.id}/setting`)
    } catch(err) {
      next(err)
    }
  },
  putUserProfile: async(req, res, next) => {
    try {
      const currentUser = getUser(req)
      const { name, introduction } = req.body
      const avatar = req.files.avatar ? req.files.avatar[0] : null
      const cover = req.files.cover ? req.files.cover[0] : null
      const user = await User.findByPk(currentUser.id, { raw: true, nest: true })

      if (!name) throw new Error('名稱不可空白')
      if (name.length > 50 ) throw new Error('字數不可超過50字')
      if (introduction.length > 160) throw new Error('字數不可超過160字')
      if (!user) throw new Error('使用者不存在')

      const imgurAvatar = await imgurFileHandler(avatar)
      const imgurCover = await imgurFileHandler(cover)

      await User.update(
        {
          name,
          introduction,
          avatar: imgurAvatar || currentUser.avatar,
          cover: imgurCover || currentUser.cover
        },
        {
          where: {
            id: currentUser.id
          }
        })

      req.flash('success_messages', '使用者資料更新成功')
      return res.redirect('back')
    } catch(err) {
      next(err)
    }
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