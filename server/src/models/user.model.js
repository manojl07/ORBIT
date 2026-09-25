const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true,"Username is required",],
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 30,
      index: true,
    },

    email: {
      type: String,
      required: [true,"Email is required",],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: false,
      minLength: 8,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      select: false,
    },

    bio: {
      type: String,
      default: "",
      maxLength: 150,
    },

    profileImg: {
      type: String,
      default:"https://ik.imagekit.io/8r9z7lciy/profileImg.webp?updatedAt=1781324968498",
    },

    profileImgField: {
      type: String,
      default: null,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  if (!this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password,12);
});

userSchema.methods.comparePassword =async function (password) {
    if (!this.password) {
      return false;
    }

    return bcrypt.compare(password,this.password);
  };

module.exports = mongoose.model("User",userSchema);