const express=require('express');
const router=express.Router();

const doctor =require('../controllers/doctor');

router.get('/',doctor.getDoctors);

router.post('/add',doctor.addDoctor);

module.exports=router;