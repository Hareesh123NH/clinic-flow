const db=require('../config/db');


const getDoctors=(req, res) => {
    // Only allow if patient
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: "Only patients can view doctors" });
    }

    db.query("SELECT id, name, specialization FROM doctors", (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
    });
};

const searchDoctors= (req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: "Only patients can search doctors" });
    }

    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Search query required" });

    const searchTerm = `%${q}%`;
    db.query(
        "SELECT id, name, specialization FROM doctors WHERE name LIKE ? OR specialization LIKE ?",
        [searchTerm, searchTerm],
        (err, results) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(results);
        }
    );
}


const requestAppoint=(req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: "Only patients can request appointments" });
    }

    const { doctor_id, appointment_date, reason } = req.body;
    if (!doctor_id || !appointment_date) {
        return res.status(400).json({ message: "Doctor ID and appointment date are required" });
    }

    const dateObj = new Date(appointment_date);
    if (isNaN(dateObj)) {
        return res.status(400).json({ message: "Invalid appointment date format" });
    }
    const mysqlDate = dateObj.toISOString().slice(0, 19).replace('T', ' ');

    db.query(
        "INSERT INTO appointments (doctor_id, patient_id, appointment_date, reason) VALUES (?, ?, ?, ?)",
        [doctor_id, req.user.id, mysqlDate, reason || null],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: "Appointment request sent", id: result.insertId });
        }
    );
}

const getMyAppointments= (req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: "Only patients can view their appointments" });
    }

    db.query(
        `SELECT a.id, d.name AS doctor_name, d.specialization, d.email AS doctor_email,
                a.appointment_date, a.reason, a.status
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         WHERE a.patient_id = ?
         ORDER BY a.appointment_date DESC`,
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(results);
        }
    );
}

module.exports={getDoctors,searchDoctors,requestAppoint,getMyAppointments};