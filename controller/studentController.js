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

exports.getDetailStudent = asyncHandler(async (req, res) => {
    try {
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

exports.listStudent = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const courseFilter = req.query.courseFilter || "";
    const batchFilter = req.query.batchFilter || "";
    const feeFilter = req.query.feeFilter || "";
    const sortBy = req.query.sortBy || '';
    const sortOrder = req.query.sortOrder || '';
    let skip = (page - 1) * pageSize;

    try {
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
            page = 1;
            skip = 0;
        }

        if (courseFilter) {
            query.course = courseFilter;
            page = 1;
            skip = 0;
        }
        if (batchFilter) {
            query.batch = batchFilter;
            page = 1;
            skip = 0;
        }
        if (feeFilter) {
            query.feestatus = feeFilter;
            page = 1;
            skip = 0;
        }

        let sortOptions = {};
        if (sortBy) {
            sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        }

        const totalProductCount = await studentForm.countDocuments(query); // Count all documents
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

exports.updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullname, mobile, dob, gender, maritalstatus,
        guardianname, guardianmob, spousename, spousemob,
        address, postoffice, district, state, country, email,
        identity, highqual, institutename, mark, course, coursefee, noofinst, billdate, batch,
        feestatus, paymentmethod } = req.body;
    console.log(req.body);
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
            feestatus,
            paymentmethod,
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

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        await studentForm.findByIdAndRemove(id);
        await paymentForm.deleteMany({ studentid: id });
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};

// exports.updateStudentStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;

//         // Validate the status (if needed)
//         if (!status) {
//             return res.status(400).json({ message: 'Status is required' });
//         }

//         // Find the course by ID in your database (you might have a different model and method)
//         const course = await courseForm.findById(id);

//         if (!course) {
//             return res.status(404).json({ message: 'Course not found' });
//         }

//         // Update the status of the course
//         course.status = status;

//         // Save the updated course in your database
//         await course.save();

//         // Respond with a success message
//         res.status(200).json({ message: 'Course status updated successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

exports.createStudent = asyncHandler(async (req, res) => {
    const imageFilePath = req.files && req.files.image ? req.files.image[0].filename : '';
    const docimgFilePath = req.files && req.files.docimg ? req.files.docimg[0].filename : '';
    const passimgFilePath = req.files && req.files.passimg ? req.files.passimg[0].filename : '';
    const { fullname, mobile, dob, gender, maritalstatus,
        guardianname, guardianmob, spousename, spousemob,
        address, postoffice, district, state, country,
        email, identity, highqual, institutename, mark,
        course, coursefee, noofinst, billdate, batch,
        feestatus, paymentmethod, paymentstatus } = req.body;

    if (!fullname || !mobile || !dob || !gender || !guardianname || !guardianmob || !email || !course || !batch || !feestatus) {
        res.status(400).send('All values are required');
    } else {

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

        if (asyncform) {
            res.send('Successfully collected data');
        } else {
            res.send('Failed to collect data');
        }
    }
});

exports.listAccount = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const courseFilter = req.query.courseFilter || "";
    const batchFilter = req.query.batchFilter || "";
    const feeFilter = req.query.feeFilter || "";
    const sortBy = req.query.sortBy || '';
    const sortOrder = req.query.sortOrder || '';
    let skip = (page - 1) * pageSize;

    try {
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
            page = 1;
            skip = 0;
        }

        if (courseFilter) {
            query.course = courseFilter;
            page = 1;
            skip = 0;
        }
        if (batchFilter) {
            query.batch = batchFilter;
            page = 1;
            skip = 0;
        }
        if (feeFilter) {
            query.feestatus = feeFilter;
            page = 1;
            skip = 0;
        }

        let sortOptions = {};
        if (sortBy) {
            sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        }

        const totalProductCount = await studentForm.countDocuments(query);
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

        const payments = await paymentForm.find()

        res.json({ elements, totalPages, payments });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});