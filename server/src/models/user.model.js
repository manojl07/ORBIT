const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
    index: true,
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },

  password: {
    type: String,
    required: [true, 'Password is mandatory'],
    minLength: 4,
    select: false,
  },

  bio: {
    type: String,
    default: "",
    maxLength: 150,
  },

  profileImg: {
    type: String,
    default: 'https://ik.imagekit.io/8r9z7lciy/profileImg.webp?updatedAt=1781324968498',
  },

  profileImgField: {
    type: String,
    default: null,
  },

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  refreshTokens: [
    {
      token: { type: String, required: true },
      createdAt: {type: Date, default: Date.now}
    }
  ],

  isVerified: {
    type: Boolean,
    default: false,
  }
  
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
})

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("User", userSchema)