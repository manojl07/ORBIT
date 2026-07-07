
const User = require('../models/user.model')
const generateToken = require('../utils/generateTokens')
const asyncHandler = require('../utils/asyncHandler')


const registerController = asyncHandler(async (req, res) => {
  const { username, email, password, bio, profileImg } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All required fields are required",
    })
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    })
  }


  const user = await User.create({
    username,
    email,
    password,
    bio,
    profileImg,
  })

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImg: user.profileImg,
    }
  })
})

const loginController = asyncHandler(async (req, res) => {
  const {email, password} = req.body;

  if(!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password is required",
    })
  }

  const user = await User.findOne({email}).select("+password")

  if(!user){
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  const isMatched = await user.comparePassword(password, user.password);

  if(!isMatched){
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    })
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: "login successfull",
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImg: user.profileImg,
    }
  })
})

module.exports = { registerController, loginController }