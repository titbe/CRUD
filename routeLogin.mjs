import express from "express";
import User from "./model/User.mjs";
import { comparePassword } from "./help.mjs";
import passport from "./passport.mjs";
import jwt from "jsonwebtoken";

import * as dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";

const routerLogin = express.Router();

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});

async function sendOtpEmail(user, otpCode) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otpCode}`,
  };

  await transporter.sendMail(mailOptions);

}

routerLogin.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;
  try {
    if (!req.session.otp || Date.now() > req.session.otp.expiration) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }
  
    if (otp !== req.session.otp.code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email: req.session.otp.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    delete req.session.otp;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.cookie("x-auth-cookie", token);
    
    res.status(200).json({ message: "OTP verified", token, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const authenticateToken = async (req, res, next) => {
  // const authHeader = req.headers.authorization;
  // const token = authHeader && authHeader.split(" ")[1];
  const token = req.cookies["x-auth-cookie"];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decode token", decoded.id);

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

routerLogin.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const otpCode = crypto.randomBytes(3).toString("hex");
    const otpExpiration = Date.now() + 10 * 60 * 1000; 

    req.session.otp = {
      code: otpCode,
      expiration: otpExpiration,
      email: user.email,
    };

    await sendOtpEmail(user, otpCode);

    res.status(200).json({ message: "OTP sent to your email" });
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "24h",
    // });
    // res.cookie("x-auth-cookie", token);
    // res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

routerLogin.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

routerLogin.get(
  "/google/callback",
  passport.authenticate("google", {
    // successRedirect: "/login/success",
    failureRedirect: "/login/failure",
    session: false,
  }),
  authenticateToken,
  (req, res) => {
    if (req.user) {
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      // res.cookie("x-auth-cookie", token);
      res.cookie("x-auth-cookie", token, {
        httpOnly: true,
        secure: true,  // Chỉ gửi cookie qua HTTPS
        sameSite: "strict",
      });
      return res.status(200).json({
        message: "Login successfully!",
        token,
        user: req.user,
      });
    } else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  }
);

// routerLogin.get("/login/success", authenticateToken, (req, res) => {
//   console.log("res", req.user);
//   try {
//     if (req.user) {
//       res.status(200).json({
//         message: "Login successfully!",
//         token: req.user.token,
//         user: req.user,
//       });
//     } else {
//       res.status(401).json({ message: "Unauthorized" });
//     }
//   } catch (error) {
//     console.error("Error handling login success:", error);
//     res.status(500).json({
//       message: `Internal Server Error: ${error}`,
//     });
//   }
// });

routerLogin.get("/login/failure", (req, res) => {
  res.status(401).json({
    message: "Login failure!",
  });
});

routerLogin.get("/logout", (req, res) => {
  res.clearCookie("x-auth-cookie");
  res.redirect(process.env.CLIENT_URL);
});

export default routerLogin;
