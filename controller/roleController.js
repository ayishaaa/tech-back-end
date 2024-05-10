var jwt = require('jsonwebtoken');
const roleForm = require('../models/roleModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

exports.addRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!role) {
        res.status(400).send('All values are required');
    } else {
        const existingUser = await roleForm.findOne({ role: role });

        if (existingUser) {
            res.status(400).json({ message: "Role already exists" });
        } else {
            var asyncform = await roleForm.create({
                role,
            });
            if (asyncform) {
                res.send('Successfully added data');
            } else {
                res.send('Failed to add data');
            }
        }
    }
});

exports.getDetailRole = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const role = await roleForm.findById(id);

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.listRole = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * pageSize;

    try {

        const totalProductCount = await roleForm.aggregate([
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalElements = totalProductCount.length > 0 ? totalProductCount[0].count : 0;
        const totalPages = Math.ceil(totalElements / pageSize);


        const elements = await roleForm
            .find()
            .skip(skip)
            .limit(pageSize)
            .exec();

        res.json({ elements, totalPages });
    } catch (error) {
        console.log(error, "jjjjjjjj");
        res.status(500).json({ error: 'Internal server error' });
    }
});


exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const role = req.body.role;

    try {
        if ( req.body.role === '') {
            res.status(400).send('All values are required');
        } else {

            let updatedProduct = null;
            let updateFields = {
                role: role
            };
            updatedProduct = await roleForm.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { new: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json(updatedProduct);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteRole = async (req, res) => {
    const { id } = req.params;

    try {
        await roleForm.findByIdAndRemove(id);
        res.sendStatus(204); // Success, no content
    } catch (error) {
        console.error(error);
        res.sendStatus(500); // Internal server error
    }
};

// 