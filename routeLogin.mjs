import express from "express";
import User from "./model/User.mjs";
import { comparePassword } from "./help.mjs";
import passport from "./passport.mjs";

const routerLogin = express.Router();

function isLoggined(req, res, next) {
  req.user
    ? next()
    : res.status(401).json({ message: "Unauthorized: Please log in." });
}

routerLogin.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error });
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
    successRedirect: "/protected",
    failureRedirect: "/google/failure",
  })
);

routerLogin.get("/protected", isLoggined, (req, res) => {
  res.send(`Hello ${req.user.username}`);
});

routerLogin.get("/google/failure", isLoggined, (req, res) => {
  res.send("Something went wrong! ");
});

routerLogin.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logout! ");
});

export default routerLogin;
