import express from "express";
import { getChatsBetweenUsers } from "../controllers/chatController.js";


const chatRoutes = express.Router();

// Route: GET /api/chats/:fromId/:toId
chatRoutes.get("/:fromId/:toId", getChatsBetweenUsers);

export default chatRoutes;
