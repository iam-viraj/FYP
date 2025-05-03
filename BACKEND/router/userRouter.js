// userRouter.js
import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  login,
  logoutAdmin,
  logoutDoctor,
  logoutPatient,
  patientRegister,
  verifyEmailToken
} from "../controller/userController.js";

import { isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Patient registration
router.post("/patient/register", patientRegister);
router.get("/verify/:token", verifyEmailToken);

// Login route
router.post("/login", login);

// Admin routes
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/admin/login", login);

// Doctor routes
router.get("/doctors", getAllDoctors);
router.get("/doctor/me", isDoctorAuthenticated, getUserDetails);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

// User details routes (Admin/Doctor/Patient)
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);

// Logout routes
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);
router.get("/doctor/logout", isDoctorAuthenticated, logoutDoctor);

export default router;
