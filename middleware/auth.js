const userModel = require("../model/userModel")


const isLogin = async (req, res, next) => {
    try {
        if (req.session.user) {

            // User is logged in
            next();
        } else {
            // User is not logged in
            res.redirect("/login"); // Redirect to login page or any other appropriate route
        }
    } catch (error) {
        console.log(error.message);
        // You might want to add more specific error handling here if needed
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect("/");
        } else {
            // User is already logged out
            next();
        }
    } catch (error) {
        console.log(error.message);
        // You might want to add more specific error handling here if needed
    }
};


// Middleware to check if the user is blocked
const checkBlocked = async (req, res, next) => {
    var blocked = await userModel.find({ _id: req.session.user }, { isVerified: 0 })
    console.log(blocked, "bk");
    if (blocked) {
        console.log("entered");
        // User is blocked, prevent access
        res.status(403).send('Access denied. Your account has been blocked.');
    } else {
        console.log("next");
        next();
    }

};



module.exports = {
    isLogin,
    isLogout,
    checkBlocked
};
