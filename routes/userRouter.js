const router = require("express").Router();
const userCtrl = require("../controllers/userCtrl");
const auth = require("../middleware/auth");
const authTeacher = require("../middleware/authTeacher");

router.post("/register", userCtrl.register);
router.post("/activation", userCtrl.activateEmail);
router.post("/login", userCtrl.login);
router.post("/refresh-token", userCtrl.getAccessToken);
router.post("/forgot-password", userCtrl.forgotPassword);
router.post("/reset-password", auth, userCtrl.resetPassword);
router.get("/profile", auth, userCtrl.getUserInfor);
router.get("/all-profiles", auth, authTeacher, userCtrl.getUserAllinfor);
router.get("/logout", userCtrl.logout);
router.patch("/update-profile", auth, userCtrl.updateUser);
router.patch("/update-role/:id", auth, authTeacher, userCtrl.updateUserRole);
router.delete("/delete/:id", auth, authTeacher, userCtrl.deleteUser);

module.exports = router;
