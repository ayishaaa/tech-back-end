var jwt = require('jsonwebtoken');
const courseForm = require('../models/courseModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

exports.addCourse = asyncHandler(async (req, res) => {
    const iconFilePath = req.files.icon[0].path;
    const bannerFilePath = req.files.banner[0].path;
    const { name, description, duration, syllabus, resource, price, offerprice, status } = req.body;

    if (!name || !description || !duration || !syllabus || !resource || !price || !offerprice || !status) {
        res.status(400).send('All values are required');
    } else {
        


        var asyncform = await courseForm.create({
            name,
            description,
            duration,
            syllabus,
            price,
            offerprice,
            status,
            resource: resource.split(','),
            banner: bannerFilePath,
            icon: iconFilePath,
        });
        
        if (asyncform) {
            res.send('Successfully collected data');
        } else {
            res.send('Failed to collect data');
        }
    }
});


exports.getDetailCourse = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const course = await courseForm.findById(id);

        if (!course) {
            return res.status(404).json({ error: 'course not found' });
        }
        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.listCourse = asyncHandler(async (req, res) => {
    // const page = parseInt(req.query.page)|| 1;
    // const pageSize = parseInt(req.query.limit)|| 20;

    // const skip = (page - 1) * pageSize;

    try {
        // const totalProductCount = await courseForm.countDocuments();
        // const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await courseForm
            .find({status: "Active"})
            // .skip(skip)
            // .limit(pageSize)
            .exec();

        res.json({ elements });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.listAllCourse = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page)|| 1;
    const pageSize = parseInt(req.query.limit)|| 20;

    const skip = (page - 1) * pageSize;

    try {
        const totalProductCount = await courseForm.countDocuments();
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await courseForm
            .find()
            .skip(skip)
            .limit(pageSize)
            .exec();

        res.json({ elements, totalPages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.updateCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, duration, syllabus, resource, price, offerprice, status } = req.body;

    try {
        if (!name || !description || !duration || !syllabus || !resource || !price || !offerprice || !status) {
            return res.status(400).json({ message: 'All values are required' });
        }

        let updatedFields = {
            name,
            description,
            duration,
            syllabus,
            price,
            offerprice,
            status,
            resource: resource.split(','),
        };

        const iconFilePath = req.files.icon ? req.files.icon[0].path : null;
        const bannerFilePath = req.files.banner ? req.files.banner[0].path : null;

        if (iconFilePath) {
            updatedFields.icon = iconFilePath;
        }
        if (bannerFilePath) {
            updatedFields.banner = bannerFilePath;
        }

        const updatedCourse = await courseForm.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

exports.deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        await courseForm.findByIdAndRemove(id);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500); 
    }
};

exports.updateCourseStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
  
      // Find the course by ID in your database (you might have a different model and method)
      const course = await courseForm.findById(id);
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Update the status of the course
      course.status = status;
  
      // Save the updated course in your database
      await course.save();
  
      // Respond with a success message
      res.status(200).json({ message: 'Course status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };