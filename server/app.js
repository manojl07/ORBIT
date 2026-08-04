const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const authRouter = require('./src/routes/auth.route')
const postRouter = require('./src/routes/post.route')

const app = express();
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({
  extended: true,
}))


// ROUTES
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)




app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "API running!"
  })
})


module.exports = app;