const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const authRouter = require('./src/routes/auth.route')
const postRouter = require('./src/routes/post.route')
const commentRoutes = require('./src/routes/comment.route')
const userRouter = require('./src/routes/user.route')

const app = express();
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({
  extended: true,
}))


// ROUTES
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/comments', commentRoutes)
app.use('/api/users', userRouter)




app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "API running!"
  })
})


module.exports = app;