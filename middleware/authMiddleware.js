const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), "secretkey");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
// In this middleware, we are verifying the token sent in the Authorization header. If the token is valid, we decode it and attach the decoded user object to the request object. If the token is invalid, we return a 401 status code with a message "Invalid Token".