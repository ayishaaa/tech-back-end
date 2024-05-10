var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const adminForm = require('../models/adminModel');
const asyncHandler = require('express-async-handler');

exports.addAdmin = asyncHandler(async (req, res) => {
  const { name, username, email, password, address, country, state, phone, role, status } = req.body;

  if (!name || !username || !email || !password || !phone || !role || !status || !req.file.filename) {
    res.status(400).send('All values are required');
  } else {
    const existingUser = await adminForm.findOne({ $or: [{ username: username }, { email: email }] });

    if (existingUser) {
      if (existingUser.username === username) {
        res.status(400).json({ message: "Username already exists" });
      }
      if (existingUser.email === email) {
        res.status(400).json({ message: "Email already exists" });
      }
    } else {
      const imageFilePath = req.file.filename;
      var asyncform = await adminForm.create({
        name,
        username,
        password,
        email,
        address,
        country,
        state,
        phone,
        role,
        status,
        image: imageFilePath,
      });
      if (asyncform) {
        res.send('Successfully collected data');
      } else {
        res.send('Failed to collect data');
      }
    }
  }
});

exports.adminLogin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    return res.status(400).json({ message: 'Username or email is required' });
  }

  const condition = username
    ? { $or: [{ username: username }, { email: username }] }
    : { email: email };

  const admin = await adminForm.findOne(condition);


  if (!admin) {
    return res.status(401).json({ message: 'Invalid username or email' });
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);

  if (isPasswordMatch) {
    if (admin.status !== 'Active') {
      return res.status(401).json({ message: 'You are not a super admin' });
    } else {
      const token = jwt.sign({ username: admin.username }, 'myjwtsecretkey');

      const adminProfile = {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        address: admin.address,
        state: admin.state,
        country: admin.country,
        phone: admin.phone,
        role: admin.role,
        description: admin.description,
        image: admin.image,
      };

      res.status(200).json({ token: token, adminProfile: adminProfile });

    }

  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

exports.getDetailAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await adminForm.findById(id);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

exports.listAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.limit) || 2;

  // Calculate the skip value based on page and page size
  const skip = (page - 1) * pageSize;

  try {
    const totalProductCount = await adminForm.countDocuments(); // Count all documents
    const totalPages = Math.ceil(totalProductCount / pageSize);

    const elements = await adminForm
      .find()
      .skip(skip)
      .limit(pageSize)
      .exec();

    res.json({ elements, totalPages });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, username, email, address, country, state, phone, role, status } = req.body;

  try {
    // Retrieve the existing admin data
    const existingAdmin = await adminForm.findById(id);

    if (!existingAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if the updated email or username already exist
    if (
      (email && email !== existingAdmin.email) ||
      (username && username !== existingAdmin.username)
    ) {
      const existingUser = await adminForm.findOne({
        $or: [{ username }, { email }],
        _id: { $ne: id }, // Exclude the current admin being updated
      });

      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }
    }

    let updatedAdmin = null;
    let updateFields = {
      _id: id,
      name,
      username,
      address,
      email,
      country,
      state,
      phone,
      role,
      status,
    };

    const imageFilePath = req.file ? req.file.filename : undefined;
    if (imageFilePath) {
      updateFields.image = imageFilePath;
    }

    updatedAdmin = await adminForm.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProfileAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, username, email, address, country, state, phone, role, description, status } = req.body;
  try {
    if (req.body.name === '' || req.body.username === '' || req.body.password === '' || req.body.email === '' || req.body.address === '' || req.body.country === '' || req.body.state === '' || req.body.phone === '' || req.body.role === '') {
      res.status(400).send('All values are required');
    } else {

      let updatedProduct = null;
      let updateFields = {
        _id: id,
        name: name,
        username: username,
        address: address,
        email: email,
        country: country,
        state: state,
        phone: phone,
        role: role,
        status: status,
        description: description,
      };
      const imageFilePath = req.file ? req.file.filename : undefined;
      if (imageFilePath) {
        updateFields.image = imageFilePath;
      }

      updatedProduct = await adminForm.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const adminProfile = {
        id: updatedProduct._id,
        name: updatedProduct.name,
        username: updatedProduct.username,
        email: updatedProduct.email,
        address: updatedProduct.address,
        state: updatedProduct.state,
        country: updatedProduct.country,
        phone: updatedProduct.phone,
        role: updatedProduct.role,
        description: updatedProduct.description,
        image: updatedProduct.image,
      }
      res.json({ adminProfile: adminProfile });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    await adminForm.findByIdAndRemove(id);
    res.sendStatus(204); // Success, no content
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Internal server error
  }
};

exports.
changePasswordAdmin = asyncHandler(async (req, res) => {
  const adminId = req.params.id;
  const { curpass, newpass, conpass } = req.body;

  try {
    if (!curpass || !newpass || !conpass) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newpass !== conpass) {
      return res.status(400).json({ message: 'New password and confirmation password do not match' });
    }

    const admin = await adminForm.findById(adminId);

    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    const isPasswordMatch = await bcrypt.compare(curpass, admin.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const newHashedPassword = await bcrypt.hash(newpass, 10);
    admin.password = newHashedPassword;

    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

exports.adminOnly = asyncHandler(async (req, res) => {
  try {
    var data = await adminForm.create({
      name: "Ayisha",
      username: "Malee",
      password: "malee@9999",
      email: "malee@gmail.com",
      country: "India",
      state: "Kerala",
      phone: "9845712635",
      role: "admin",
    });
    const result = await data.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

exports.getAdminProfile = asyncHandler(async (req, res) => {
  const adminUsername = req.user.username; // Assuming username is stored in the token payload

  try {
    const adminProfile = await adminForm.findOne({ username: adminUsername });
    if (adminProfile) {
      res.json(adminProfile);
    } else {
      res.status(404).json({ error: 'Admin profile not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
exports.updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const admin = await adminForm.findById(id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.status = status;

    await admin.save();

    res.status(200).json({ message: 'Admin status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};