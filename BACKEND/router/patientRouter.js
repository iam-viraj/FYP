import express from "express";
import { isPatientAuthenticated } from "../middlewares/auth.js";
import { updatePassword } from "../controllers/patientController.js";

const router = express.Router();

// ... other routes ...
router.put("/updatepassword", isPatientAuthenticated, updatePassword);

export default router; 