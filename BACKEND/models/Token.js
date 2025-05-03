import mongoose from "mongoose";
const Schema = mongoose.Schema;
const tokenSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "1h",
    },
});
const Token = mongoose.models.Token || mongoose.model("token", tokenSchema);
export default Token;