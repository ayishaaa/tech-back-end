const adminForm = require('../models/adminModel');

exports.pageAdmin = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    
    // Calculate the skip value based on page and page size
    const skip = (page - 1) * pageSize;
  
    // Query the database with skip and limit based on pagination parameters
    try {
      const products = await adminForm.find()
        .skip(skip)
        .limit(pageSize)
        .exec();
  
      // Return the paginated products as a JSON response
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching products.' });
    }
  }