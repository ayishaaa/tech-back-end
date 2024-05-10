var jwt = require('jsonwebtoken');
const resourceForm = require('../models/resourceModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

exports.addResource = asyncHandler(async (req, res) => {
    const { name, email, address, qualification, phone, role } = req.body;

    if (!name || !email || !address || !qualification || !phone || !role || !req.file.filename) {
        res.status(400).send('All values are required');
    } else {
        const imageFilePath = req.file.filename;
        var asyncform = await resourceForm.create({
            name,
            email,
            address,
            qualification,
            phone,
            role,
            image: imageFilePath,
        });
        if (asyncform) {
            res.send('Successfully collected data');
        } else {
            res.send('Failed to collect data');
        }

    }
});

exports.getDetailResource = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await resourceForm.findById(id);

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.listAllResource = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page)|| 1;
    const pageSize = parseInt(req.query.limit)|| 10;

    // Calculate the skip value based on page and page size
    const skip = (page - 1) * pageSize;

    try {
        const totalProductCount = await resourceForm.countDocuments(); // Count all documents
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await resourceForm
            .find()
            .skip(skip)
            .limit(pageSize)
            .exec();

        res.json({ elements, totalPages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.listResource = asyncHandler(async (req, res) => {


    try {
        
        const elements = await resourceForm
            .find()
            
            .exec();

        res.json({ elements });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.updateResource = async (req, res) => {
    const { id } = req.params;
    const { name, email, address, qualification, phone, role } = req.body;

    try {
        if (!name || !email || !address || !qualification || !phone || !role ) {
            res.status(400).send('All values are required');
        } else {

            let updatedResource = null;
            let updateFields = {
                _id: id,
                name,
                address,
                email,
                qualification,
                phone,
                role,
            };

            const imageFilePath = req.file ? req.file.filename : undefined;
            if (imageFilePath) {
                updateFields.image = imageFilePath;
            }

            updatedResource = await resourceForm.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { new: true }
            );

            if (!updatedResource) {
                return res.status(404).json({ message: 'Resource not found' });
            }

            res.status(200).json(updatedResource);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteResource = async (req, res) => {
    const { id } = req.params;

    try {
        await resourceForm.findByIdAndRemove(id);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500); 
    }
};
