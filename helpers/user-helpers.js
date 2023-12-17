const { Sequelize, Op } = require('sequelize')
const { User } = require('../models')

// 使用者推薦追蹤(依追蹤者數量)名單
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

    const recommendedFollowingsData = recommendedFollowings.map(r => {
      // right-bar 字元限制: 9
      const truncatedName = r.name.length > 8 ? `${r.name.slice(0, 8)}...` : r.name
      const truncatedAccount = r.account.length > 8 ? `${r.account.slice(0, 8)}...` : r.account
      return {
        ...r.toJSON(),
        name: truncatedName,
        account: truncatedAccount,
        isFollowed: r.Followers.some(f=> f.id === userId),
        isNotUser: r.id !== userId
      }
      
    })

    return recommendedFollowingsData
  } catch(err) {
    console.error(err)
    throw err
  }
}

module.exports = { 
  getRecommendedFollowings
}