const express=require('express');
const router=express.Router();
const verifyToken=require('../middleWare/authMiddleWare');
const doctor =require('../controllers/doctor');

router.get('/appointments',verifyToken,doctor.getAppointments);

router.put('/appointments/:id/reject',verifyToken,doctor.rejectAppointment);

router.put('/appointments/:id/approve',verifyToken,doctor.approveAppointment);

module.exports=router;