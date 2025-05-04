// chats.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Chats = mongoose.model("Chats", messageSchema);
export default Chats;
