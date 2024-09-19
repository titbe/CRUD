import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  googleId: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // required: true,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
