var jwt = require('jsonwebtoken');
const studentForm = require('../models/studentModel');
const paymentForm = require('../models/paymentModel');
const courseForm = require('../models/courseModel');
const batchForm = require('../models/batchModel');
const stateForm = require('../models/stateModel');
const countryForm = require('../models/countryModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

exports.addStudent = asyncHandler(async (req, res) => {
    const imageFilePath = req.files.image ? req.files.image[0].filename : '';
    const docimgFilePath = req.files.docimg ? req.files.docimg[0].filename : '';
    const passimgFilePath = req.files.passimg ? req.files.passimg[0].filename : '';
    const { fullname, mobile, dob, gender, maritalstatus,
        guardianname, guardianmob, spousename, spousemob,
        address, postoffice, district, state, country,
        email, identity, highqual, institutename, mark,
        course, coursefee, noofinst, billdate, batch,
        feestatus, paymentmethod, paymentstatus, amount, dates, comment } = req.body;

    if (!fullname || !mobile || !dob || !gender || !guardianname || !guardianmob || !email || !course || !batch || !feestatus) {
        res.status(400).send('All values are required');
    } else {
        try {
            var asyncform = await studentForm.create({
                fullname,
                mobile,
                dob,
                gender,
                maritalstatus,
                guardianname,
                guardianmob,
                spousename,
                spousemob,
                address,
                postoffice,
                district,
                state,
                country,
                email,
                identity,
                highqual,
                institutename,
                mark,
                course,
                coursefee,
                noofinst,
                billdate,
                batch,
                feestatus,
                paymentmethod,
                paymentstatus,
                image: imageFilePath,
                docimg: docimgFilePath,
                passimg: passimgFilePath,
            });
            if (amount !== "") {
                if (asyncform) {
                    const studentId = asyncform._id;
                    const parsedDate = new Date(dates);
                    if (isNaN(parsedDate)) {
                        res.status(400).send('Invalid date format. Please use dd-mm-yyyy.');
                    } else {
                        const formattedDate = parsedDate.toLocaleDateString('en-GB');
                        var payform = await paymentForm.create({
                            studentid: studentId,
                            date: formattedDate,
                            amount,
                            method: paymentmethod,
                            comment
                        });
                        res.send('Successfully payment data');
                    }
                }
            } else {
                res.send('Successfully collected data')
            }
        } catch (error) {
            console.error(error, "jjjjjjjjjjjjjjjjjj");
            res.status(500).send('Internal Server Error');
        }
    }
});

exports.listStudent = asyncHandler(async (req, res) => {
    const { token, deviceId } = req.query;
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.limit);
    const search = req.query.search || "";
    const courseFilter = req.query.courseFilter || "";
    const batchFilter = req.query.batchFilter || "";
    const feeFilter = req.query.feeFilter || "";
    const sortBy = req.query.sortBy || '';
    const sortOrder = req.query.sortOrder || '';
    const skip = (page - 1) * pageSize;
    console.log(courseFilter, batchFilter, "ggggggghhhhhhhhh")
    try {
        if (!token || !deviceId) {
            res.status(400).send('All values are required');
        }
        const query = {};

        if (search) {
            query.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                //{ gender: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { maritalstatus: { $regex: search, $options: 'i' } },
                { guardianname: { $regex: search, $options: 'i' } },
                { guardianmob: { $regex: search, $options: 'i' } },
                { spousename: { $regex: search, $options: 'i' } },
                { spousemob: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { postoffice: { $regex: search, $options: 'i' } },
                { district: { $regex: search, $options: 'i' } },
                { state: await getStateIdByName(search) },
                { country: await getCountryIdByName(search) },
                //{ feestatus: { $regex: search, $options: 'i' } },
                { course: await getCourseIdByName(search) },
                { batch: await getBatchIdByName(search) },

            ];
        }

        if (courseFilter) {
            query.course = courseFilter;
        }
        if (batchFilter) {
            query.batch = batchFilter;
        }
        if (feeFilter) {
            query.feestatus = feeFilter;
        }

        let sortOptions = {};
        if (sortBy) {
            sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        }

        const totalProductCount = await studentForm.countDocuments(); // Count all documents
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await studentForm
            .find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize)
            .populate({
                path: 'course',
                model: 'Course',
                select: 'name'
            })
            .populate({
                path: 'batch',
                model: 'Batch',
                select: 'batchname'
            })
            .exec();


        res.json({ elements, totalPages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function getCourseIdByName(courseName) {
    const course = await courseForm.findOne({ name: { $regex: courseName, $options: 'i' } });
    return course ? course._id : null;
}

async function getBatchIdByName(batchName) {
    const batch = await batchForm.findOne({ batchname: { $regex: batchName, $options: 'i' } });
    return batch ? batch._id : null;
}

async function getStateIdByName(stateName) {
    const state = await stateForm.findOne({ name: { $regex: stateName, $options: 'i' } });
    return state ? state._id : null;
}

async function getCountryIdByName(countryName) {
    const country = await countryForm.findOne({ name: { $regex: countryName, $options: 'i' } });
    return country ? country._id : null;
}

exports.getDetailStudent = asyncHandler(async (req, res) => {
    const { token, deviceId } = req.query;
    try {
        if (!token || !deviceId) {
            res.status(400).send('All values are required');
        }
        const { id } = req.params;

        const student = await studentForm
            .findById(id)
            .populate({
                path: 'course',
                model: 'Course',
                select: 'name'
            })
            .populate({
                path: 'batch',
                model: 'Batch',
                select: 'batchname'
            })
            .populate({
                path: 'country',
                model: 'Country',
                select: 'name'
            })
            .populate({
                path: 'state',
                model: 'State',
                select: 'name'
            });

        const courseFee = student.coursefee;
        const payments = await paymentForm.find({ studentid: id });
        const totalAmountPaid = payments.reduce((total, payment) => parseFloat(total) + parseFloat(payment.amount), 0);
        const balance = courseFee - totalAmountPaid;

        if (!student) {
            return res.status(404).json({ error: 'student not found' });
        }
        res.json({ student, balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullname, mobile, dob, gender, maritalstatus,
        guardianname, guardianmob, spousename, spousemob,
        address, postoffice, district, state, country, email,
        identity, highqual, institutename, mark, course, coursefee, noofinst, billdate, batch } = req.body;

    try {
        if (!fullname || !mobile || !dob || !gender || !guardianname || !guardianmob || !email || !course || !batch) {
            return res.status(400).json({ message: 'All values are required' });
        }

        let updatedFields = {
            fullname,
            mobile,
            dob,
            gender,
            maritalstatus,
            guardianname,
            guardianmob,
            spousename,
            spousemob,
            address,
            postoffice,
            district,
            state,
            country,
            email,
            identity,
            highqual,
            institutename,
            mark,
            course,
            coursefee,
            noofinst,
            billdate,
            batch,
        };

        const imageFilePath = req.files.image ? req.files.image[0].filename : null;
        const docimgFilePath = req.files.docimg ? req.files.docimg[0].filename : null;
        const passimgFilePath = req.files.passimg ? req.files.passimg[0].filename : null;

        if (imageFilePath) {
            updatedFields.image = imageFilePath;
        }
        if (docimgFilePath) {
            updatedFields.docimg = docimgFilePath;
        }
        if (passimgFilePath) {
            updatedFields.passimg = passimgFilePath;
        }

        const updatedStudent = await studentForm.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

exports.listAccount = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.limit);
    const { token, deviceId } = req.query;

    try {
        if (!token || !deviceId) {
            res.status(400).send('All values are required');
        }
        const totalProductCount = await studentForm.countDocuments();
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await studentForm
            .find()
            .limit(pageSize)
            .populate({
                path: 'course',
                model: 'Course',
                select: 'name'
            })
            .populate({
                path: 'batch',
                model: 'Batch',
                select: 'batchname'
            })
            .exec();

        const payments = await paymentForm.find()

        res.json({ elements, totalPages, payments });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});