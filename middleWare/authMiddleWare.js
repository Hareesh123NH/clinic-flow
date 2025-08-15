const jwt = require('jsonwebtoken');
const JWT_SECRET =process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) return res.status(403).json({ message: "Token required" });

    const token = authHeader.split(' ')[1]; // Expecting: Bearer <token>
    if (!token) return res.status(403).json({ message: "Invalid token format" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid or expired token" });

        req.user = decoded; // { id, role }
        next();
    });
};

module.exports = verifyToken;
