import express from "express";
import { isAdminAuthenticated } from "../middlewares/auth.js";
import { deleteDoctor } from "../controller/adminController.js";
import { addNewDoctor } from "../controller/userController.js";

const router = express.Router();

// The path should match exactly with your frontend call
router.delete("/admin/doctor/delete/:id", isAdminAuthenticated, deleteDoctor);

router.post("/admin/doctor/addnew", isAdminAuthenticated, addNewDoctor);

export default router; 