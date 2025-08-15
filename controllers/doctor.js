
const db=require('../config/db');

const getAppointments= (req, res) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can view their appointments" });
    }

    db.query(
        `SELECT a.id, p.name AS patient_name, p.email AS patient_email, 
                a.appointment_date, a.reason, a.status
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC`,
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(results);
        }
    );
};


const approveAppointment=(req, res) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can approve appointments" });
    }

    db.query(
        "UPDATE appointments SET status = 'approved' WHERE id = ? AND doctor_id = ? AND appointment_date >= NOW() ",
        [req.params.id, req.user.id],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found" });
            res.json({ message: "Appointment approved" });
        }
    );
};

const rejectAppointment=(req, res) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: "Only doctors can reject appointments" });
    }

    db.query(
        "UPDATE appointments SET status = 'rejected' WHERE id = ? AND doctor_id = ? AND appointment_date >= NOW()",
        [req.params.id, req.user.id],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Appointment not found" });
            res.json({ message: "Appointment rejected" });
        }
    );
};



module.exports={getAppointments,approveAppointment,rejectAppointment};