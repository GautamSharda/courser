if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const { asyncMiddleware, isLoggedIn } = require("../middleware");
const Auth = express.Router();
const User = require("../models/user");
const { randomStringToHash24Bits } = require("../middleware");
const jwt = require("jsonwebtoken");

const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { initializeApp } = require('firebase/app');

const firebaseConfig = {
    apiKey: "AIzaSyCDb_G5CP1lIbKP2LzQ19CZOV58bYJk3vY",
    authDomain: "courser-adffb.firebaseapp.com",
    projectId: "courser-adffb",
    storageBucket: "courser-adffb.appspot.com",
    messagingSenderId: "310691903301",
    appId: "1:310691903301:web:a0bbf2d48c8dee165d302c",
    measurementId: "G-35YG5PKPH9",
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);


Auth.post('/google', asyncMiddleware(async (req, res) => {
    const { idToken, email, name } = req.body;
    const uid = randomStringToHash24Bits(idToken);
    const foundUser = await User.findById(uid);
    if (!foundUser) {
        const newUser = new User({ _id: uid, email: email, name: name })
        await newUser.save();
    }
    const token = jwt.sign({ _id: uid, }, process.env.JWT_PRIVATE_KEY, { expiresIn: "1000d" });
    res.status(200).send({ token: token, message: 'Login successful' });
}));

Auth.get("/isloggedin", isLoggedIn, asyncMiddleware(async (req, res) => {res.json({ user: res.userProfile });}));

Auth.post('/signup-email', asyncMiddleware(async (req, res, next) => {
    const { email, password, name } = req.body;
    console.log('here');
    console.log(email);
    createUserWithEmailAndPassword(firebaseAuth, email, password)
        .then((fireBaseUser) => {
            const uid = randomStringToHash24Bits(fireBaseUser.user.uid);
            const newUser = new User({ _id: uid, email, name })
            newUser.save().then(() => {
                const token = jwt.sign({ _id: uid, }, process.env.JWT_PRIVATE_KEY, { expiresIn: "1000d" });
                res.status(200).send({ token: token, message: 'Login successful' });
            }).catch((error) => {
                //TODO: delete the user from firebase
                res.status(500).send({ message: error.message });
            })
        })
        .catch(error => {
            console.log(error);
            const errorMessage = error.message;
            res.status(500).send({ message: error.message });
        });
}));

Auth.post('/login-email', asyncMiddleware(async (req, res, next) => {
    const { email, password } = req.body;
    signInWithEmailAndPassword(firebaseAuth, email, password)
        .then((fireBaseUser) => {
            const uid = randomStringToHash24Bits(fireBaseUser.user.uid);
            const token = jwt.sign({ _id: uid, }, process.env.JWT_PRIVATE_KEY, { expiresIn: "1000d" });
            res.status(200).send({ token: token, message: 'Login successful' });
        })
        .catch(error => {
            res.status(401).send({ message: 'Incorrect email or password' });
        });
}));


module.exports = Auth;