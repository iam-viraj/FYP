import express from "express";
import {
  doctorLogin,
  doctorLogout,
  getDoctorStats,
  updatePassword,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAllDoctors
} from "../controllers/doctorController.js";
import { isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", doctorLogin);
router.get("/logout", isDoctorAuthenticated, doctorLogout);
router.get("/stats", isDoctorAuthenticated, getDoctorStats);
router.put("/updatepassword", isDoctorAuthenticated, updatePassword);
router.get("/appointments", getDoctorAppointments);
router.get("/getalldoctor", getAllDoctors);
router.put("/appointment/:id", isDoctorAuthenticated, updateAppointmentStatus);

export default router; 