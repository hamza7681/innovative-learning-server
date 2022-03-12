require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));

// Rooutes
app.use("/user", require("./routes/userRouter"));
app.use("/api", require("./routes/upload"));

// Mongodb connection
const URL = process.env.DB_URL;
mongoose
  .connect(URL)
  .then(() => console.log("Connection is Successfull"))
  .catch((e) => console.log("Connection is Unsuccessful", e));

app.use("/", (req, res, next) => {
  res.json({ msg: "Hello Everyone...!!!" });
});

// server listener
const PORT = process.env.PORT;
app.listen(PORT, () => console.log("Server is running on port", PORT));
