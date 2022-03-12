const Users = require("../models/userMdel");

const authTeacher = async (req, res, next) => {
  try {
    const user = await Users.findOne({ _id: req.user.id });
    if (user.role !== 1) {
      return res.status(500).json({ msg: "Teeacher resources access denied" });
    }
    next()
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = authTeacher;
