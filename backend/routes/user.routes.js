const express = require("express");
const { UserModel } = require("../models/User.model");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

userRouter.post("/register", async (req, res) => {
  const { email, pass, name, age } = req.body;
  try {
    bcrypt.hash(pass, 5, async (err, secure_pass) => {
      if (err) {
        console.log(err);
      } else {
        const user = new UserModel({ email, pass: secure_pass, name, age });
        await user.save();
        res.send("Registered");
      }
    });
  } catch (error) {
    res.send("Error in registering user");
    console.log(error);
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, pass } = req.body;
  try {
    const user = await UserModel.find({ email });

    if (user.length > 0) {
      bcrypt.compare(pass, user[0].pass, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              // exp: Math.floor(Date.now() / 1000) + 60 * 60,
              userID: user[0]._id,
            },
            "masai"
          );
          // let storedToken = localStorage.setItem("token", JSON.stringify(token))
          res.send({ msg: "login successful", token: token });
        } else {
          res.send("wrong credentials");
        }
      });
    } else {
      res.send("wrong credentials");
    }
  } catch (error) {
    res.send("error");
    console.log(error);
  }
});

userRouter.get("/cart", async (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, "masai", (err, decoded) => {
    if (err) {
      res.send("invallid token");
      console.log(err);
    } else {
      res.send("Cart Page....");
    }
  });
});

userRouter.get("/data", async (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, "masai", (err, decoded) => {
    if (err) {
      res.send("invallid token");
      console.log(err);
    } else {
      res.send("Data....");
    }
  });
});

module.exports = {
  userRouter,
};
