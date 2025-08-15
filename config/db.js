const mysql=require('mysql2');

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:process.env.PASSWORD,
    database:'Nodejs'
});

connection.connect((err)=>{
    if(err){
        console.error(err);
        return;
    }
    console.log("Database Connected....");
})

module.exports=connection;