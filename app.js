const express = require('express')
const app = express()
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const port = 3000

app.engine('hbs', exhbs({ defaultLayout: 'main', extname: '.hbs'}))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(port, () => {
  console.log(`app is running on http://localhost:${port}`)
})