import mongoose from "mongoose";

const SPSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  details: {
    type: String,
  }
});

const SP = mongoose.model("SP", SPSchema);

export default SP;
