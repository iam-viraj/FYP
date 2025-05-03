import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Message } from "../models/messageSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js"

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, message } = req.body;

    // console.log("Request Body:", req.body); // Log the incoming data for debugging
    // console.log("Validation Check:");
    // console.log({ firstName, lastName, email, phone, message });
    if (!firstName || !lastName || !email || !phone || !message) {
        return next(new ErrorHandler("Please fill in all fields", 400));
    }

     await Message.create({ firstName, lastName, email, phone, message });
        res.status(201).json({
            success: true,
            message: "Message sent successfully",
        
        });
    
});

export const getAllMessages = catchAsyncErrors(async(req,res,next)=>{
    const messages = await Message.find();
    res.status(200).json({
        success: true,
        messages,
    });
});

