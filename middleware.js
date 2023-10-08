const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const user = require("./models/user");


if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const randomStringToHash24Bits = (inputString) => {
    return crypto.createHash('sha256').update(inputString).digest('hex').substring(0, 24);
}

const isLoggedIn = async (req, res, next) => {
    const token = req.headers["x-access'courser-auth-token"];
    console.log(token);

    //check if token exists or is null in an if statement
    console.log('1')
    if (!token) return res.status(401).send(JSON.stringify("not-logged-in"));
    try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        console.log(decoded)
        const foundUser = await user.findById(decoded._id);
        if (!foundUser) {
            console.log('2')
            return res.status(401).send(JSON.stringify("no user found"));
        }
        res.userProfile = foundUser;
    } catch (er) {
        console.log('3')
        return res.status(401).send(JSON.stringify("ERROR"));
    }
    next();
};
const asyncMiddleware = fn => 
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { isLoggedIn, asyncMiddleware, randomStringToHash24Bits };