
const db=require('../config/db');


const getDoctors=(req,res)=>{
    db.query('select * from doctors',(err,result)=>{

        if(err){
            res.json(err);
            return ;
        }
        res.json(result);
    });
}

const addDoctor=(req,res)=>{

    const { id, name, specialization } = req.body || {};

    if( !id || !name || !specialization){
       return res.status(400).json("Filds missing");

    }

    db.query('insert into doctors (id,name,specialization) values (?,?,?)',[id, name, specialization],(err,r)=>{

        if(err) throw err;
        res.status(201).json({
            statusCode:201,
            Message:r
        });
    });
}



module.exports={getDoctors,addDoctor};