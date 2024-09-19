import express from "express";
import User from "./model/User.mjs";
import { comparePassword } from "./help.mjs";
import passport from "./passport.mjs";
import jwt from "jsonwebtoken";

import * as dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";

const routerLogin = express.Router();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.user,
//     pass: process.env.pass,
//   },
// });

// async function sendOtpEmail(user, req) {
//   const otpCode = crypto.randomBytes(3).toString("hex");
//   const otpExpiration = Date.now() + 10 * 60 * 1000;

//   req.session.otp = { code: otpCode, expiresAt: otpExpiration };

//   req.session.otpTimeout = setTimeout(() => {
//     delete req.session.otp;
//   }, 10 * 60 * 1000);

//   const mailOptions = {
//     from: "your-email@gmail.com",
//     to: user.email,
//     subject: "Your OTP Code",
//     text: `Your OTP code is ${otpCode}`,
//   };

//   await transporter.sendMail(mailOptions);
// }

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.sendStatus(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(403).json({ message: "Invalid or expired token" });
  }
};

routerLogin.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.cookie("x-auth-cookie", token);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// routerLogin.post("/verify-otp", (req, res) => {
//   const { otp } = req.body;
//   const sessionOtp = req.session.otp;

//   if (!sessionOtp) {
//     return res.status(400).json({ message: "OTP not found or expired" });
//   }

//   const { code, expiresAt } = sessionOtp;

//   if (Date.now() > expiresAt) {
//     clearTimeout(req.session.otpTimeout);
//     delete req.session.otp;
//     return res.status(400).json({ message: "OTP has expired" });
//   }

//   if (otp !== code) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   clearTimeout(req.session.otpTimeout);
//   delete req.session.otp;
//   res.status(200).json({ message: "OTP verified" });
// });

routerLogin.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

routerLogin.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/login/success",
    failureRedirect: "/login/failure",
    session: false,
  }),
  (req, res) => {
    if (req.user) {
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      res.cookie("x-auth-cookie", token);

      res.json({ token });
    }
  }
);

routerLogin.get("/login/success", authenticateToken, (req, res) => {
  console.log("res", req.user);
  try {
    if (req.user) {
      res.status(200).json({
        message: "Login successfully!",
        user: req.user,
      });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error handling login success:", error);
    res.status(500).json({
      message: `Internal Server Error: ${error}`,
    });
  }
});

routerLogin.get("/login/failure", (req, res) => {
  res.status(401).json({
    message: "Login failure!",
  });
});

routerLogin.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Logout failure!");
    }
  });
  res.clearCookie("x-auth-cookie");

  res.redirect(process.env.CLIENT_URL);
});

export default routerLogin;
