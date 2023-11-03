
module.exports = {
    generalErrorHandler (err, req, res, next) {
      if (err instanceof Error) {
        // err.message 為 throw new Error 內的訊息
        req.flash('error_messages', err.message)
      } else {
        req.flash('error_messages', err)
      }
      res.redirect('back')
      next(err)
    }
  }