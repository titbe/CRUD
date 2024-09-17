import express from "express";
import User from "./model/User.mjs";
import { hashPassword } from "./help.mjs";
import { validationResult, checkSchema } from "express-validator"; // Import checkSchema
import { UserValidationSchema } from "./UserValidationSchema.mjs";

const routerUser = express.Router();

routerUser.post(
  "/user",
  checkSchema(UserValidationSchema),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;
    const newUser = new User({
      email,
      username,
      password: hashPassword(password),
    });

    try {
      const savedUser = await newUser.save();
      res.status(201).json({ message: "Created new User", savedUser });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
);

routerUser.delete("/deleteUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const newUser = await User.findByIdAndDelete(id);
    if (!newUser) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Deleted successfully", newUser });
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default routerUser;
