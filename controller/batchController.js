var jwt = require('jsonwebtoken');
const batchForm = require('../models/batchModel');
const courseForm = require('../models/courseModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const { parseISO, format } = require('date-fns');

exports.addBatch = asyncHandler(async (req, res) => {
    const { batchname, startdate, enddate, timing, course } = req.body;

    if (!batchname || !startdate || !enddate || !timing || !course) {
        res.status(400).send('All values are required');
    } else {
        const existingUser = await batchForm.findOne({ batchname: batchname });

        if (existingUser) {
            res.status(400).json({ message: "Batch already exists" });
        } else {
            const parsedStartDate = parseISO(startdate);
            const parsedEndDate = parseISO(enddate);

            // Format the dates consistently
            const formattedStartDate = format(parsedStartDate, 'yyyy-MM-dd');
            const formattedEndDate = format(parsedEndDate, 'yyyy-MM-dd');

            var asyncform = await batchForm.create({
                batchname,
                startdate: formattedStartDate,
                enddate: formattedEndDate,
                timing,
                course,
            });

            if (asyncform) {
                res.send('Successfully added data');
            } else {
                res.send('Failed to add data');
            }
        }
    }
});

exports.getDetailBatch = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await batchForm.findById(id);

        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        res.json(batch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.listBatch = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const courseFilter = req.query.courseFilter || "";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";
    const sortByB = req.query.sortByB || '';
    const sortOrderB = req.query.sortOrderB || '';
    const sortByS = req.query.sortByS || '';
    const sortOrderS = req.query.sortOrderS || '';
    const sortByT = req.query.sortByT || '';
    const sortOrderT = req.query.sortOrderT || '';
    const sortByC = req.query.sortByC || '';
    const sortOrderC = req.query.sortOrderC || '';
    let skip = (page - 1) * pageSize;
    const parsedStartDate = startDate ? parseISO(startDate) : null;
    const parsedEndDate = endDate ? parseISO(endDate) : null;

    const isValidDate = (date) => !isNaN(new Date(date).valueOf());

    try {
        const query = {};

        if (search) {
            query.$or = [
                { batchname: { $regex: search, $options: 'i' } },
                { timing: { $regex: search, $options: 'i' } },
                { course: await getCourseIdByName(search) }
            ];
            page = 1;
            skip = 0;
        }

        if (courseFilter) {
            query.course = courseFilter;
            page = 1;
            skip = 0;
        }

        if (parsedStartDate && isValidDate(parsedStartDate) && parsedEndDate && isValidDate(parsedEndDate)) {
            query.startdate = { $lte: parsedEndDate, $gte: parsedStartDate };
            query.enddate = { $gte: parsedStartDate, $lte: parsedEndDate };
        }

        let sortOptions = 0;
        if (sortByB) {
            sortOptions = { [sortByB]: sortOrderB === 'asc' ? 1 : -1 };
        } else if (sortByS) {
            sortOptions = { [sortByS]: sortOrderS === 'asc' ? 1 : -1 };
        } else if (sortByT) {
            sortOptions = { [sortByT]: sortOrderT === 'asc' ? 1 : -1 };
        } else if (sortByC) {
            sortOptions = { [sortByC]: sortOrderC === 'asc' ? 1 : -1 };
        }

        const totalProductCount = await batchForm.countDocuments(query);
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await batchForm
            .find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize)
            .exec();

        // Format dates before sending the response
        const formattedElements = elements.map(element => ({
            ...element._doc,
            startdate: element.startdate.toLocaleDateString('en-GB'),
            enddate: element.enddate.toLocaleDateString('en-GB'),
        }));

        res.json({ elements: formattedElements, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  
async function getCourseIdByName(courseName) {
    const course = await courseForm.findOne({ name: { $regex: courseName, $options: 'i' } });
    return course ? course._id : null;
}

exports.updateBatch = async (req, res) => {
    const { id } = req.params;
    const { batchname, startdate, enddate, timing, course } = req.body;

    try {
        if (!batchname || !startdate || !enddate || !timing || !course) {
            res.status(400).send('All values are required');
        } else {
            const parsedStartDate = parseISO(startdate);
            const parsedEndDate = parseISO(enddate);

            if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
                res.status(400).send('Invalid date format. Please use dd-mm-yyyy.');
            } else {

                const formattedStartDate = format(parsedStartDate, 'yyyy-MM-dd');
                const formattedEndDate = format(parsedEndDate, 'yyyy-MM-dd');

                let updatedProduct = null;
                let updateFields = {
                    batchname,
                    startdate: formattedStartDate,
                    enddate: formattedEndDate,
                    timing,
                    course,
                };
                updatedProduct = await batchForm.findByIdAndUpdate(
                    id,
                    { $set: updateFields },
                    { new: true }
                );

                if (!updatedProduct) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                res.status(200).json(updatedProduct);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteBatch = async (req, res) => {
    const { id } = req.params;

    try {
        await batchForm.findByIdAndRemove(id);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};