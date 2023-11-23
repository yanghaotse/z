const { Sequelize, Op } = require('sequelize')
const { User } = require('../models')
const { getUser } = require('../helpers/auth-helpers')

// 使用者推薦追蹤名單
const getRecommendedFollowings = async(userId) => {
  try {
    const recommendedFollowings = await User.findAll({
      where: {
        role: 'user',
        id: { [Op.not]: userId }
      },
      include: [
        { model: User, as: 'Followers'}
      ],
      // 計算追蹤數量並降冪排序
      attributes: {
        include: [
          [Sequelize.literal('(SELECT COUNT(*) FROM Followships WHERE Followships.following_id = User.id)'), 'followersCount']
        ]
      },
      order: [
        [Sequelize.literal('followersCount'), 'DESC']
      ],
      limit: 10
    })

    const recommendedFollowingsData = recommendedFollowings.map(r => ({
      ...r.toJSON(),
      isFollowed: r.Followers.some(f=> f.id === userId),
      isNotUser: r.id !== userId
    }))

    return recommendedFollowingsData
  } catch(err) {
    console.error(err)
    throw err
  }
}

module.exports = { 
  getRecommendedFollowings
}