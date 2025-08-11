const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getDoctorAvailability,
  requestAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  addAvailability,
  acceptAppointment,
  rejectAppointment
} = require('../controllers/appointmentController');

router.get('/availability/:doctorId', verifyToken, getDoctorAvailability);
router.post('/request', verifyToken, requestAppointment); // <-- for patient appointment requests
router.get('/patient', verifyToken, getPatientAppointments);
router.get('/mydoctorappointments', verifyToken, getDoctorAppointments);
router.post('/addavailability', verifyToken, addAvailability);
router.post('/accept', verifyToken, acceptAppointment);
router.post('/reject', verifyToken, rejectAppointment);

module.exports = router;
