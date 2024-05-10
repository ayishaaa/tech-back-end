var jwt = require('jsonwebtoken');
const adminForm = require('../models/adminModel');
const bannerForm = require('../models/bannerModel');
const courseForm = require('../models/courseModel');
const batchForm = require('../models/batchModel');
const studentForm = require('../models/studentModel');
const paymentForm = require('../models/paymentModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');


exports.homeScreen = asyncHandler(async (req, res) => {
    const {token, deviceId} = req.query;
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * pageSize;

    try {
    if (!token || !deviceId){
        res.status(400).send('All values are required');
    } else {
        const totalProductCount = await adminForm.countDocuments();
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const userProfile = await adminForm
            .find({ token: token})
            .select('-password -token')
            .skip(skip)
            .limit(pageSize)
            .populate({
                path: 'role',
                model: 'Role',
                select: 'role'
            })
            .exec();

            if (!userProfile) {
                res.status(404).json({ error: 'User profile not found' });
                return;
            }
            userProfile.forEach((user) => {
                if (user.image) {
                    user.image = `public\\images\\${user.image}`;
                }
            });
           
        const bannerDetails = await bannerForm.find({ status: "Active"});
        const courseCountAll = await courseForm.countDocuments();
        const courseCountActive = await courseForm.countDocuments({ status: "Active"});
        const studentCount = await studentForm.countDocuments();
        const batchCount = await batchForm.countDocuments();
        const feePendingCount = await studentForm.countDocuments({
            // $or: [{ feestatus: "Paid" }, { feestatus: "Unpaid" }]
            feestatus: "Unpaid"
          });
          console.log(feePendingCount, "feePendingggggggggggg")
        const paymentPendingCount = await studentForm.countDocuments({
            // $or: [{ paymentstatus: "Completed" }, { paymentstatus: "Pending" }]
            paymentstatus: "Pending"
          });
        const paymentPendingDetails = await studentForm
          .find({
            $or: [{ feestatus: "Paid" }, { feestatus: "Unpaid" }]
          })
          .select('-dob -maritalstatus -guardianname -guardianmob -spousename -spousemob -address -postoffice -district -state -country -identity -highqual -institutename -mark -feestatus -paymentmethod -docimg -passimg')
          .limit(pageSize);
          paymentPendingDetails.forEach((user) => {
            if (user.image) {
                user.image = `public\\images\\${user.image}`;
            }
        });

        res.json({
            userProfile: userProfile.length > 0 ? userProfile[0] : null,
            bannerDetails: bannerDetails.length > 0 ? bannerDetails[0] : null,
            courseCountAll,
            courseCountActive,
            studentCount,
            batchCount,
            feePendingCount,
            paymentPendingCount,
            paymentPendingDetails
        });

    }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
