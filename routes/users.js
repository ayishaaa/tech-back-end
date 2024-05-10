var express = require('express');
var userToken = require('../middleware/userToken');
var userController = require('../controllerUser/userController');
var otpController = require('../controllerUser/otpController');
var homeController = require('../controllerUser/homeController');
var courseController = require('../controller/courseController');
var countryController = require('../controller/countryController');
var stateController = require('../controller/stateController');
var batchController = require('../controller/batchController');
var studentController = require('../controller/studentController');
var studentUserController = require('../controllerUser/studentUserController');
var paymentUserController = require('../controllerUser/paymentController');

var router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  var upload = multer({ storage: storage });

console.log('Backend connected');
//adminController
// router.post('/', adminController.adminOnly);
// router.post('/userlogin', userController.loginUser);
// // router.post('/addadmin', upload.single('image'), adminController.addAdmin);
router.post('/adduser', userToken, userController.addUser);
// router.get('/listuser', userController.listUser);
// router.get('/getuserdetail/:id', userController.getDetailUser);
// router.put('/updateuser/:id', userController.updateUser);
// router.put('/updateuserprofile/:id', userController.updateProfileUser);
// router.post('/changepassword/:id', userController.changePasswordUser);
// router.delete('/removeuser/:id', userController.deleteUser);
// // otpController
// router.post('/forgotpassword', otpController.forgotPassword);
// // router.post('/verifyotp', otpController.verifyOtp);
// router.post('/resetpassword', otpController.resetPassword);
router.post('/userlogin', userController.loginUser);
router.post('/forgotpassword', otpController.forgotPassword);
router.post('/resetpassword', otpController.resetPassword);
router.get('/homescreen', userToken, homeController.homeScreen);
router.post('/studentcreate', userToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'passimg', maxCount: 1 },
  { name: 'docimg', maxCount: 1 }
]), studentUserController.addStudent);
router.put('/updatestudent/:id', userToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'passimg', maxCount: 1 }, { name: 'docimg', maxCount: 1 }]), studentUserController.updateStudent);
router.get('/liststudent', userToken, studentUserController.listStudent);
router.get('/getstudentdetail/:id', userToken, studentUserController.getDetailStudent);
router.get('/listaccount', userToken, studentUserController.listAccount);
router.post('/addpayment', userToken, paymentUserController.addPayment);
router.get('/getpaymentdetail/:id', userToken, paymentUserController.getDetailPayment);
router.put('/updatepayment/:id', userToken, paymentUserController.updatePayment);
router.delete('/removepayment/:id', userToken, paymentUserController.deletePayment);
router.put('/updatepaymentstatus/:id', userToken, paymentUserController.updatePaymentStatus);
router.put('/updateallpaymentstatus/:id', paymentUserController.updateAllPaymentStatus);
router.get('/listcourse', userToken, courseController.listCourse);
router.get('/listaccount', userToken, studentController.listAccount);
router.get('/listcountry', userToken, countryController.listCountries);
router.get('/liststate/:id', userToken, stateController.listStates);
router.get('/listbatch', userToken, batchController.listBatch);
router.get('/listpayment', userToken, paymentUserController.listPayment);

module.exports = router;
