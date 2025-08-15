const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const db=require('../config/db');
const JWT_SECRET=process.env.JWT_SECRET;


const login=(req,res)=>{
    const {email,password,role}=req.body || {};

    if (!email || !password || !role) {
        return res.status(400).json({ message: `${(!email)? `email,`:``}${(!password)? `password,`:``}${(!role)? `role`:``} fields is required` });
    }

    if(role!=='doctor' && role!=='patient'){
        return res.status(400).json({message:"Invalid Role"});
    }

    const table = role === 'doctor' ? 'doctors' : 'patients';

    db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: err.message });

        if (results.length === 0) return res.status(401).json({ message: "Invalid email" });

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password" });

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, role: role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token:token });
    });

};

const signUp= async (req,res)=>{
    const { name, email, password, specialization, age, gender, role } = req.body || {};

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Required fields are missing" });
    }

    if(role!=='doctor' && role!=='patient'){
        return res.status(400).json({message:"Invalid Role"});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const table = role === 'doctor' ? 'doctors' : 'patients';

        let query, values;
        if (role === 'doctor') {
            query = "INSERT INTO doctors (name, email, password, specialization) VALUES (?, ?, ?, ?)";
            values = [name, email, hashedPassword, specialization || 'General'];
        } else {
            query = "INSERT INTO patients (name, email, password, age, gender) VALUES (?, ?, ?, ?, ?)";
            values = [name, email, hashedPassword, age || null, gender || 'Other'];
        }

        db.query(query, values, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: "Signup successful", id: result.insertId });
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports={login,signUp};