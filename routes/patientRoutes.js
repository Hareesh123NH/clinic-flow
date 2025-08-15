const express=require('express');
const router=express.Router();
const verifyToken=require('../middleWare/authMiddleWare');
const patient=require('../controllers/patient');

router.get('/doctors',verifyToken,patient.getDoctors);

router.get('/doctors/search',verifyToken,patient.searchDoctors);

router.post('/appointment',verifyToken,patient.requestAppoint);

router.get('/my-appointments',verifyToken,patient.getMyAppointments);

module.exports=router;