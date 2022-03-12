const Users = require("../models/userMdel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("./sendMail");
const { CLIENT_URL } = process.env;

const userCtrl = {
  register: async (req, res) => {
    try {
      // console.log(req.body)
      const {
        firstName,
        lastName,
        email,
        username,
        password,
        contact,
        gender,
      } = req.body;
      if (
        !firstName ||
        !lastName ||
        !email ||
        !username ||
        !password ||
        !contact ||
        !gender
      ) {
        return res.status(400).json({ msg: "Please enter all fields" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ msg: "Invalid Email" });
      }

      const user = await Users.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "Email is already registered" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be atleast 6 characters long" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      //   console.log(password, passwordHash);

      const newUser = {
        email,
        password: passwordHash,
        username,
        contact,
        firstName,
        lastName,
        gender,
      };

      const activation_token = createActivationToken(newUser);
      const url = `${CLIENT_URL}/user/activate/${activation_token}`;
      sendEmail(email, url, "Verify your email address");

      res.json({
        msg: "Registered Successfully. Please verify your email to start.",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      );
      //   console.log(user)
      const {
        email,
        password,
        username,
        contact,
        firstName,
        lastName,
        gender,
      } = user;
      //   console.log(contact,firstName,lastName,gender)
      const check = await Users.findOne({ email });
      if (check) {
        return res.status(400).json({ msg: "Email is already registered" });
      }
      const newUser = new Users({
        username,
        email,
        password,
        contact,
        firstName,
        lastName,
        gender,
      });
      await newUser.save();
      res.json({ msg: "Account has been activated!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "This email does'nt exist" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect Password" });
      }
      const refresh_token = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/user/refresh-token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.json({ msg: "Login Successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getAccessToken: async (req, res) => {
    try {
      const ref_token = req.cookies.refreshtoken;
      //   console.log(ref_token)
      if (!ref_token) {
        return res.status(400).json({ msg: "Please login now!" });
      }
      jwt.verify(ref_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.status(400).json({ msg: "Please login now!" });
        }
        // console.log(user);
        const access_token = createAccessToken({ id: user.id });
        res.json({ access_token });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(500).json({ msg: "This email does'nt exist" });
      }
      const access_token = createAccessToken({ id: user._id });
      const url = `${CLIENT_URL}/user/reset/${access_token}`;
      sendEmail(email, url, "Reset your password");
      res.json({ msg: "Please check your email" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      // console.log(password);
      const passwordHash = await bcrypt.hash(password, 12);
      // console.log(req.user)
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        { password: passwordHash }
      );
      res.json({ msg: "Password is changed successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserInfor: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserAllinfor: async (req, res) => {
    try {
      const users = await Users.find().select("-password");
      res.json(users);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh-token" });
      return res.json({ msg: "Logged Out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { firstName, lastName, avatar, qualification, description } =
        req.body;
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        { firstName, lastName, avatar, qualification, description }
      );
      res.json({ msg: "Profile Updated Successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateUserRole: async (req, res) => {
    try {
      const { role } = req.body;
      await Users.findOneAndUpdate({ _id: req.params.id }, { role });
      res.json({ msg: "Role Updated Successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      await Users.findByIdAndDelete(req.params.id);
      res.json({ msg: "Profile has been deleted successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const validateEmail = (email) => {
  const emailReg =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return emailReg.test(email);
};

module.exports = userCtrl;
