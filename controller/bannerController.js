const bannerForm = require('../models/bannerModel');
const asyncHandler = require('express-async-handler');

exports.addBanner = asyncHandler(async (req, res) => {
    const imageFilePath = req.file.filename;
    const { title, targeturl, status } = req.body;

    if (!title || !targeturl || !status ) {
        res.status(400).send('All values are required');
    } else {
        


        var asyncform = await bannerForm.create({
            title,
            targeturl,
            status,
            image: imageFilePath,
        });
        
        if (asyncform) {
            res.send('Successfully collected data');
        } else {
            res.send('Failed to collect data');
        }
    }
});

exports.getDetailBanner = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await bannerForm.findById(id);

        if (!banner) {
            return res.status(404).json({ error: 'banner not found' });
        }
        res.json(banner);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.listBanner = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page)|| 1;
    const pageSize = parseInt(req.query.limit)|| 10;

    const skip = (page - 1) * pageSize;

    try {
        const totalProductCount = await bannerForm.countDocuments(); // Count all documents
        const totalPages = Math.ceil(totalProductCount / pageSize);

        const elements = await bannerForm
            .find()
            .skip(skip)
            .limit(pageSize)
            .exec();

        res.json({ elements, totalPages });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

exports.updateBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, targeturl, status } = req.body;

    try {
        if ( !title || !targeturl || !status ) {
            return res.status(400).json({ message: 'All values are required' });
        }

        let updatedFields = {
            title,
            targeturl,
            status,
        };

        const imageFilePath = req.file ? req.file.filename : undefined;
        if (imageFilePath) {
            updatedFields.image = imageFilePath;
        }

        const updatedBanner = await bannerForm.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedBanner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        res.status(200).json(updatedBanner);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

exports.deleteBanner = async (req, res) => {
    const { id } = req.params;

    try {
        await bannerForm.findByIdAndRemove(id);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500); 
    }
};

exports.updateBannerStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
  
      const banner = await bannerForm.findById(id);
  
      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }
  
      banner.status = status;
  
      await banner.save();
  
      res.status(200).json({ message: 'Banner status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };