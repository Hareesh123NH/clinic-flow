const express=require('express');
const app=express();

require('dotenv').config();
const PORT=process.env.PORT;

const doctorRoutes=require('./routes/doctorRoutes');
const authRoutes=require('./routes/authRoutes');
const patientRoutes=require('./routes/patientRoutes');

//JSON parser
app.use(express.json());

// Tesing,,,,
// app.use('/',(req,res)=>{
//     res.status(200).json("Api Running");
// }); 

app.use('/auth',authRoutes);
app.use('/api/d',doctorRoutes);
app.use('/api/p',patientRoutes);


app.listen(PORT,(err)=>{

    if(err){
        console.log(err);
        return;
    }
    console.log(`Server running at http://localhost:${PORT}`);
});



