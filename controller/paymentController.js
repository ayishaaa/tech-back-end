var jwt = require('jsonwebtoken');
const paymentForm = require('../models/paymentModel');
const studentForm = require('../models/studentModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

exports.addPayment = asyncHandler(async (req, res) => {
    const { studentid, date, amount, method, comment } = req.body;

    if (!studentid || !date || !amount || !method ) {
        res.status(400).send('All values are required');
    } else {
        try {
            const parsedDate = new Date(date);

            if (isNaN(parsedDate)) {
                res.status(400).send('Invalid date format. Please use dd-mm-yyyy.');
            } else {
                const formattedDate = parsedDate.toLocaleDateString('en-GB');

                const studentData = await studentForm.findById(studentid);

                if (!studentData) {
                    res.status(404).send('Student not found');
                    return;
                }

                const courseFee = studentData.coursefee;

                const payments = await paymentForm.find({ studentid });

                const totalAmountPaid = payments.reduce((total, payment) => parseFloat(total) + parseFloat(payment.amount), 0);

                const balance = courseFee - totalAmountPaid;

                const asyncform = await paymentForm.create({
                    studentid,
                    date: formattedDate,
                    amount,
                    method,
                    comment,
                });

                if (asyncform) {
                    res.send({
                        message: 'Successfully added data',
                        totalAmountPaid,
                        balance
                    });
                } else {
                    res.send('Failed to add data');
                }
            }
        } catch (error) {
            console.error('Error adding payment:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

exports.getDetailPayment = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await paymentForm.find({studentid: id});
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.json({payment});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.listStudentPayment = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page)|| 1;
    const pageSize = parseInt(req.query.limit)|| 10;

    const skip = (page - 1) * pageSize;

    try {
        const totalProductCount = await paymentForm.countDocuments(); 
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await paymentForm
            .find()
            .skip(skip)
            // .sort({ 
            //     date: 'asc' 
            // })
            .limit(pageSize)
            .exec();

        res.json({ elements, totalPages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.listPayment = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;

    try {
        const totalProductCount = await paymentForm.countDocuments(); 
        const totalPages = Math.ceil(totalProductCount / pageSize);

        // Fetch all payments
        let payments = await paymentForm
            .find()
            .populate({
                path: 'studentid', 
                model: 'Student',
                populate: {
                    path: 'course',
                    model: 'Course',
                    select: 'name'
                }
            })
            .exec();

        payments.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('/'));
            const dateB = new Date(b.date.split('/').reverse().join('/'));
            return dateB - dateA;
        });

        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const paginatedPayments = payments.slice(startIndex, endIndex);

        const elements = paginatedPayments.map(payment => ({
            ...payment.toObject(),
        }));

        res.json({ elements, totalPages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


exports.updatePayment = async (req, res) => {
    const { id } = req.params;
    const { studentid, date, amount, method, comment } = req.body;

    try {
        if ( !date || !amount || !method || !comment) {
            res.status(400).send('All values are required');
        } else {
            const parsedDate = new Date(date);

            if (isNaN(parsedDate)) {
                res.status(400).send('Invalid date format. Please use dd-mm-yyyy.');
            } else {
                const formattedDate = parsedDate.toLocaleDateString('en-GB');

                const studentData = await studentForm.findById( studentid );

                if (!studentData) {
                    res.status(404).send('Student not found');
                    return;
                }

                const courseFee = studentData.coursefee;

                const payments = await paymentForm.find({ studentid });

                const totalAmountPaid = payments.reduce((total, payment) => parseFloat(total) + parseFloat(payment.amount), 0);

                const balance = courseFee - totalAmountPaid;


            let updatedProduct = null;
            let updateFields = {
                studentid, 
                date: formattedDate,
                amount,
                method,
                comment,
            };
            updatedProduct = await paymentForm.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { new: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json(updatedProduct, totalAmountPaid, balance);
        }
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deletePayment = async (req, res) => {
    const { id } = req.params;

    try {
        await paymentForm.findByIdAndRemove(id);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};

exports.studentPayment = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.limit);

    const skip = (page - 1) * pageSize;

    try {
        const totalProductCount = await paymentForm.countDocuments(); 
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await paymentForm
            .find()
            .skip(skip)
            .sort({ 
                date: 'asc' 
            })
            .limit(pageSize)
            .exec();

        res.json({ elements, totalPages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.updateFeeStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { feestatus } = req.body;
  
      if (!feestatus) {
        return res.status(400).json({ message: 'Status is required' });
      }
  
      const student = await studentForm.findById(id);
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      student.feestatus = feestatus;
  
      await student.save();
  
      res.status(200).json({ message: 'Student status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.updatePaymentStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentstatus } = req.body;
      if (!paymentstatus) {
        return res.status(400).json({ message: 'Status is required' });
      }
  
      const student = await studentForm.findById(id);
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      student.paymentstatus = paymentstatus;
  
      await student.save();
  
      res.status(200).json({ message: 'Student status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.updateAllPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const paymentlist = await paymentForm.find({ studentid: id });
        const student = await studentForm.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const coursefee = parseInt(student.coursefee);
        const noofinst = parseInt(student.noofinst);
        const billdate = student.billdate;
        const currentPaymentStatus = student.paymentstatus;
        const installmentDates = billdate.split(',');
        const currentDate = new Date();
        
        const totalAmount = paymentlist.reduce((sum, payment) => sum + parseInt(payment.amount), 0);
        const installmentAmount = coursefee / noofinst;

        if (totalAmount === coursefee) {
                student.paymentstatus = "Completed";

        } else if (totalAmount <= coursefee) {
                student.paymentstatus = "Pending";
        }

        const billdatesBeforeCurrentDate = installmentDates
            .map(date => {
                const [day, month, year] = date.trim().split('/').map(Number);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const billdate = new Date(year, month - 1, day);
                    return billdate < currentDate ? billdate : null;
                }
                return null;
            })
            .filter(Boolean);

        const calculateInstallment = billdatesBeforeCurrentDate.length * installmentAmount;
        const currentFeeStatus = student.feestatus === "Paid";

        if (totalAmount >= calculateInstallment) {
            student.feestatus = "Paid";
        } else if (totalAmount < calculateInstallment) {
            student.feestatus = "Unpaid";
        }

        await student.save();
        console.log(student, "Student updated successfully");
        res.status(200).json({ message: 'Student status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



  
  