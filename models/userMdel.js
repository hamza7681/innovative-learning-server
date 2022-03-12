const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: [true, "Please enter your first name"],
      trim: true,
    },
    lastName: {
      type: String,
      // required: [true, "Please enter your last name"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Please enter your username"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      trim: true,
    },
    gender: {
      type: String,
      // required: [true, "Please select your gender"],
    },
    contact: {
      type: Number,
      // required: [true, "Please enter your contact number"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    role: {
      type: Number,
      default: 0, //0=>student , 1 => teacher
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/hamza7681/image/upload/v1646975450/Avatar/z_bjfrlw.png",
    },
    qualification:{
      type:String,
    },
    description:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", userSchema);
