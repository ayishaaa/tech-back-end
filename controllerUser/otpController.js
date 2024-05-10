const userForm = require('../models/userModel');
const adminForm = require('../models/adminModel');
const otpForm = require('../models/otpModel');
const asyncHandler = require('express-async-handler');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {

        let user;

        if (email) {
            user = await adminForm.findOne({ email: email });
        } else {
            return res.status(400).json({ status: 'fail', messages: 'Enter username or email' });
        }

        if (!user) {
            return res.status(400).json({ status: 'fail', messages: 'User not found' });
        }
        const OTP = Math.floor((Math.random() * 9000 + 1000))

        const otpDocument = await otpForm.create({
            email: email,
            otp: OTP,
        });
        await otpDocument.save();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'malefashionum@gmail.com',
                pass: 'nonf ahey lszt nmra'
            }
        });

        const mailOptions = {
            from: 'malefashionum@gmail.com',
            to: email,
            subject: 'Reset your password',
            text: `Your OTP for resetting the password is: ${OTP}`,
        };

        transporter.sendMail(mailOptions);
        const data = {
            email: email,
        }
        res.status(200).json({ status: 'success', messages: 'OTP sent to email' });
    } catch (error) {
        console.error("Error sending OTP: ", error);
        res.status(500).json({ status: 'fail', messages: 'Error sending OTP' });
    }
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const { otp, email, newpass, conpass } = req.body;

    try {
        if (!otp) {
            return res.status(400).json({ status: 'fail', message: 'Enter your OTP' });
        }
        if (!email) {
            return res.status(400).json({ status: 'fail', message: 'Enter your Email' });
        }
        if (!newpass) {
            return res.status(400).json({ status: 'fail', message: 'Enter your new password' });
        }
        if (!conpass) {
            return res.status(400).json({ status: 'fail', message: 'Enter your confirm password' });
        }
        

        if (newpass !== conpass) {
            return res.status(400).json({ status: 'fail', message: 'New password and confirmation password do not match' });
        }

        const otpDocument = await otpForm.findOne({ otp });

        if (!otpDocument) {
            return res.status(400).json({ status: 'fail', message: 'Invalid OTP' });
        }

        const emailDocuments = await otpForm.find({ email }).sort({ createdAt: -1 });

        if (!emailDocuments || emailDocuments.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'No OTP found for the given email' });
        }

        const latestEmailDocument = emailDocuments[0];

        if (latestEmailDocument.otp !== otp) {
            return res.status(400).json({ status: 'fail', message: 'Incorrect OTP' });
        }

        const currentTime = new Date();
        const otpCreatedAt = new Date(latestEmailDocument.createdAt);
        const timeDifferenceInSeconds = (currentTime - otpCreatedAt) / 1000;

        if (timeDifferenceInSeconds > 60) {
            return res.status(400).json({ status: 'fail', message: 'OTP expired' });
        }

        const user = await adminForm.findOne({ email });

        if (!user) {
            return res.status(400).json({ status: 'fail', message: 'User not found' });
        }

        user.password = newpass;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Failed to change password' });
    }
});

