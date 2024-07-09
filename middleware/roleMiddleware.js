// middlewares/roleMiddleware.js

const checkRole = (roles) => (req, res, next) => {
    const userRole = req.user.role; // Assuming req.user is populated with user info
    if (roles.includes(userRole)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = { checkRole };
