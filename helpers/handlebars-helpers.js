const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
const localeData = require('dayjs/plugin/localeData')
const zhTW = require('dayjs/locale/zh-tw')


dayjs.extend(relativeTime)
dayjs.extend(localeData)
// 語言配置
dayjs.locale(zhTW)


module.exports = {
  relativeTimeFromNow: a => {
    const time = dayjs(a).fromNow()
    const timeWithoutSuffix = time.replace('前', '').trim()
    return timeWithoutSuffix
  },
  ifCond: function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  formatDateTime: a => {
    const time = dayjs(a).format('A h:mm')
    const date = dayjs(a).format('YYYY年M月D日')
    return `${date}·${time}`
  }
}