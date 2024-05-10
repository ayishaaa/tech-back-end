const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // await mongoose.connect('mongodb://127.0.0.1:27017/techoriz', {
      await mongoose.connect('mongodb+srv://techorizwebacademy:techoriz123@atlascluster.0cerg7n.mongodb.net/', {

      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
