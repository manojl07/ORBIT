require('dotenv').config();

const app = require('./app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    })
  } catch (error) {
    console.log(error);
  }
}

startServer();











// right now ill copy paste all the code written for this project reading all files give the explation of all the files and their code in the flow how the data is flowing and these how they are woking from app.js, server.js to every controller, route, middleware, utils, validators, service, config, consonants etc,. 



// const AUTH_CONSTANTS = require('../constants/auth.constants')





// const accessCookieOptions = {

//   httpOnly: true,

//   secure: process.env.NODE_ENV === "production",

//   sameSite: "strict",

//   maxAge: 15 * 60 * 1000,

// }



// const refreshCookieOptions = {

//   httpOnly: true,

//   secure: process.env.NODE_ENV === "production",

//   sameSite: 'strict',

//   maxAge: 7 * 24 * 60 * 60 * 1000,

// }



// module.exports = { accessCookieOptions, refreshCookieOptions }





// const mongoose = require('mongoose')



// const connectDB = async () => {

//   try {

//     await mongoose.connect(process.env.MONGO_URI)

//     console.log("✅ MongoDB Connected");

//   } catch (error) {

//     console.log(error);

//    process.exit(1); 

//   }

// }



// module.exports = connectDB;







// const AUTH_CONSTANTS = {

//   ACCESS_TOKEN_COOKIE: "accessToken",

//   REFRESH_TOKEN_COOKIE: "refreshToken",



//   ACCESS_TOKEN_EXPIRY: '15m',

//   REFRESH_TOKEN_EXPIRY: '7d',



//   PASSWORD_SALT_ROUNDS: 12,

// }



// module.exports = AUTH_CONSTANTS;







// const User = require('../models/user.model')

// const generateToken = require('../utils/generateTokens')

// const asyncHandler = require('../utils/asyncHandler')





// const registerController = asyncHandler(async (req, res) => {

//   const { username, email, password, bio, profileImg } = req.body;



//   if (!username || !email || !password) {

//     return res.status(400).json({

//       success: false,

//       message: "All required fields are required",

//     })

//   }



//   const existingUser = await User.findOne({ $or: [{ email }, { username }] });



//   if (existingUser) {

//     return res.status(409).json({

//       success: false,

//       message: "User already exists",

//     })

//   }





//   const user = await User.create({

//     username,

//     email,

//     password,

//     bio,

//     profileImg,

//   })



//   const token = generateToken(user._id);



//   res.status(201).json({

//     success: true,

//     message: "User registered successfully",

//     token,

//     user: {

//       _id: user._id,

//       username: user.username,

//       email: user.email,

//       bio: user.bio,

//       profileImg: user.profileImg,

//     }

//   })

// })



// const loginController = asyncHandler(async (req, res) => {

//   const {email, password} = req.body;



//   if(!email || !password) {

//     return res.status(400).json({

//       success: false,

//       message: "Email and password is required",

//     })

//   }



//   const user = await User.findOne({email}).select("+password")



//   if(!user){

//     return res.status(401).json({

//       success: false,

//       message: "Invalid credentials",

//     })

//   }



//   const isMatched = await user.comparePassword(password, user.password);



//   if(!isMatched){

//     return res.status(401).json({

//       success: false,

//       message: "Invalid credentials"

//     })

//   }



//   const token = generateToken(user._id);



//   res.json({

//     success: true,

//     message: "login successfull",

//     token,

//     user: {

//       _id: user._id,

//       username: user.username,

//       email: user.email,

//       bio: user.bio,

//       profileImg: user.profileImg,

//     }

//   })

// })



// module.exports = { registerController, loginController }





// const jwt = require('jsonwebtoken')

// const asyncHandler = require('../utils/asyncHandler')



// const authMiddleware = asyncHandler(async (req, res, next) => {

//   const authHeader = req.headers.authorization;



//   if(!authHeader || !authHeader.startsWith("Bearer ")){

//     return res.status(401).json({

//       success: false,

//       message: "Unauthorized",

//     })

//   }



//   const token = authHeader.split(" ")[1];



//   const decoded = jwt.verify(token, process.env.JWT_SECRET);



//   req.user = decoded;



//   next();

// })



// module.exports = authMiddleware;





// const errorMiddleware = (err, req, res, next) => {

//   const statusCode = err.statusCode || 500;



//   return res.status(statusCode).json({

//     success: false,

//     message: "Internal Server Error"

//   })

// }



// module.exports = errorMiddleware;





// const ApiError = require('../utils/ApiError')



// const validate = (schema) => {

//   return (req, res, next) => {

//     const result = schema.safeParse(req.body);



//     if(!result.success){

//       return next(new ApiError(400, result.error.errors.map(e => e.message).join(', ')))

//     }



//     req.body = result.data;



//     next();

//   }

// }



// module.exports = validate;





// const mongoose = require('mongoose')





// const sessionSchema = new mongoose.Schema({

//   user: {

//     type: mongoose.Schema.Types.ObjectId,

//     ref: "User",

//     required: true,

//     index: true,

//   },



//   tokenHash: {

//     type: String,

//     required: true,

//   },



//   deviceId: {

//     type: String,

//     required: true,

//   },



//   userAgent: {

//     type: String,

//     required: true,

//   },



//   ipAddress: {

//     type: String,

//     default: "",

//   },



//   lastUsedAt: {

//     type: Date,

//     default: Date.now,

//   },



//   expiresAt: {

//     type: Date,

//     required: true,

//     index: true,

//   }

// }, {

//   expiresAt: {

//     type: Date,

//     required: true,

//     index: true,

//   }

// }, {timestamps: true})



// module.exports = mongoose.model("Session", sessionSchema)







// const mongoose = require('mongoose')

// const bcrypt = require('bcrypt')



// const userSchema = new mongoose.Schema({

//   username: {

//     type: String,

//     required: [true, 'Username is required'],

//     unique: true,

//     trim: true,

//     lowercase: true,

//     minLength: 3,

//     maxLength: 30,

//     index: true,

//   },



//   email: {

//     type: String,

//     required: [true, 'Email is required'],

//     unique: true,

//     trim: true,

//     lowercase: true,

//     index: true,

//   },



//   password: {

//     type: String,

//     required: [true, 'Password is mandatory'],

//     minLength: 4,

//     select: false,

//   },



//   bio: {

//     type: String,

//     default: "",

//     maxLength: 150,

//   },



//   profileImg: {

//     type: String,

//     default: 'https://ik.imagekit.io/8r9z7lciy/profileImg.webp?updatedAt=1781324968498',

//   },



//   profileImgField: {

//     type: String,

//     default: null,

//   },



//   followers: [{

//     type: mongoose.Schema.Types.ObjectId,

//     ref: "User",

//   }],



//   following: [{

//     type: mongoose.Schema.Types.ObjectId,

//     ref: "User",

//   }],



//   refreshTokens: [

//     {

//       token: { type: String, required: true },

//       createdAt: {type: Date, default: Date.now}

//     }

//   ],



//   isVerified: {

//     type: Boolean,

//     default: false,

//   }

  

// }, { timestamps: true })



// userSchema.pre('save', async function (next) {

//   if(!this.isModified("password")) return next();



//   this.password = await bcrypt.hash(this.password, 12);



//   next()

// })



// userSchema.methods.comparePassword = async function (password) {

//   return await bcrypt.compare(password, this.password);

// }



// module.exports = mongoose.model("User", userSchema)





// const express = require('express')

// const router = express.Router();



// const { registerController, loginController } = require('../controllers/auth.controller')

// const validate = require('../middlewares/validate.middleware')

// const { registerSchema, loginSchema } = require('../validators/auth.validator')







// router.post('/register', validate(registerSchema), registerController)

// router.post('/login', validate(loginSchema), loginController)



// module.exports = router;





// const crypto = require('crypto')



// const User = require('../models/user.model')

// const Session = require('../models/session.model')

// const ApiError = require('../utils/ApiError')

// const { createTokens } = require('./token.service')





// const hashToken = (token) => {

//   return crypto.createHash("sha256").update(token).digest("hex");

// }



// const findUser = async (identifier) => {



//   const user = await User.findOne({

//     $or: [

//       { email: identifier.toLowerCase() },

//       { username: identifier.toLowerCase(), },

//     ]

//   }).select("+password")



//   if (!user) {

//     throw new ApiError(401, "Invalid credentials")

//   }



//   return user;

// }



// const createSession = async ({ user, refreshToken, deviceId, userAgent, ipAddress }) => {



//   const tokenHash = hashToken(refreshToken);



//   const session = await Session.create({ user: user._id, tokenHash, deviceId, userAgent, ipAddress, expiresAt: new Date(date.now() + 7 * 24 * 60 * 60 * 1000) })



//   return session;

// }



// const register = async ({ username, email, password, bio, deviceId, userAgent, ipAddress }) => {



//   const existing = await User.findOne({ $or: [{ email }, { username }] })



//   if (existing) {

//     throw new ApiError(409, "User already exists")

//   }



//   const user = await User.create({ username, email, password, bio })



//   const { accessToken, refreshToken } = createTokens(user);



//   const session = await createSession({ user, refreshToken, deviceId, userAgent, ipAddress })



//   return {

//     user, accessToken, refreshToken, sessionId: session._id

//   }

// }



// const login = async ({ identifier, password, deviceId, userAgent, ipAddress }) => {



//   const user = await findUser(identifier)



//   const matched = await user.comparePassword(password)



//   if (!matched) {

//     throw new ApiError(401, "Invalid credentials")

//   }



//   const { accessToken, refreshToken } = createTokens(user);



//   const session = await createSession({ user, refreshToken, deviceId, userAgent, ipAddress })



//   return { user, accessToken, refreshToken, sessionId: session._id }

// }



// const logout = async (sessionId) => {

//   await Session.findByIdAndDelete(sessionId)



//   return true;

// }



// const logoutAll = async (userId) => {

//   await Session.deleteMany({ user: userId })



//   return true;

// }







// module.exports = { register, login, logout, logoutAll };





// // right now ill copy paste all the code written for this project reading all files give the explation of all the files and their code in the flow how the data is flowing and these how they are woking from app.js, server.js to every controller, route, middleware, utils, validators, service, config, consonants etc,.







// const { generateAccessToken, generateRefreshToken } = require('../utils/jwt')



// const createTokens = (user) => {

//   const payload = { id: user._id }



//   const accessToken = generateAccessToken(payload);



//   const refreshToken = generateRefreshToken(payload);



//   return { accessToken, refreshToken }

// }



// module.exports = { createTokens }







// class ApiError extends Error{

//   constructor(statusCode, message){

//     super(message);

//     this.statusCode = statusCode;

//     this.success = false;

//   }

// }



// module.exports = ApiError;





// class ApiResponse{

//   constructor(statusCode, message="success", data=null){

//     this.success = true;

//     this.statusCode = statusCode;

//     this.message = message;

//     this.data = data;

//   }

// }



// module.exports = ApiResponse;





// const asyncHandler = (fn) => {

//   return (req, res, next) => {

//     Promise.resolve(fn (req, res, next)).catch(next)

//   }

// }



// module.exports = asyncHandler;





// const jwt = require('jsonwebtoken')





// const generateAccessToken = (payload) => {

//   return jwt.sign(

//     payload,

//     process.env.JWT_ACCESS_SECRET,

//     { expiresIn: process.env.REFRESH_TOKEN_SECRET, }

//   )

// }



// const generateRefreshToken = (payload) => {

//   return jwt.sign(

//     payload,

//     process.env.JWT_REFRESH_SECRET,

//     { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }

//   )

// }



// const verifyAccessToken = (token) => {

//   return jwt.verify(token, process.env.JWT_ACCESS_SECRET)

// }



// const verifyRefreshToken = (token) => {

//   return jwt.verify(token, process.env.JWT_REFRESH_SECRET)

// }



// module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken }





// const { z } = require('zod')



// const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;



// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,64}$/;



// const registerSchema = z.object({



//   username: z.string().trim().min(3).max(30).regex(usernameRegex, "Invalid Username"),



//   email: z.string().trim().email(),



//   password: z.string().regex(passwordRegex, "Weak Password"),



//   bio: z.string().max(150).optional()

// })



// const loginSchema = z.object({

//   identifier: z.string().trim().min(3),

//   password: z.string().min(6)

// })



// module.exports = { registerSchema, loginSchema }



// const express = require('express')

// const helmet = require('helmet')

// const cors = require('cors')

// const morgan = require('morgan')



// const authRouter = require('./src/routes/auth.route')



// const app = express();

// app.use(express.json())

// app.use(express.urlencoded({

//   extended: true,

// }))





// // ROUTES

// app.use('/api/auth', authRouter)









// app.get('/', (req, res) => {

//   res.json({

//     success: true,

//     message: "API running!"

//   })

// })





// module.exports = app;





// require('dotenv').config();



// const app = require('./app')

// const connectDB = require('./src/config/db')



// const PORT = process.env.PORT || 5000;





// const startServer = async () => {

//   try {

//     await connectDB();



//     app.listen(PORT, () => {

//       console.log(`🚀 Server running on port ${PORT}`);

//     })

//   } catch (error) {

//     console.log(error);

//   }

// }



// startServer();

