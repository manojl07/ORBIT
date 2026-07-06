const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')

const app = express();
app.use(express.json())
app.use(express.urlencoded({
  extended: true,
}))


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "API running!"
  })
})


module.exports = app;