import express from "express"
import { deleteAppointment, getAllAppointments, postAppointments, updateAppointmentStatus, checkPendingAppointments } from "../controller/appointmentController.js";
import { isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();


router.post("/post", isPatientAuthenticated, postAppointments);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);
router.get("/doctor/:doctorId/pending", isAdminAuthenticated, checkPendingAppointments);

export default router;