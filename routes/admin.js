var express = require('express');
var verifyToken = require('../middleware/verifyToken');
var adminController = require('../controller/adminController');
var roleController = require('../controller/roleController');
var resourceController = require('../controller/resourceController');
var bannerController = require('../controller/bannerController');
var courseController = require('../controller/courseController');
var countryController = require('../controller/countryController');
var stateController = require('../controller/stateController');
var batchController = require('../controller/batchController');
var studentController = require('../controller/studentController');
var paymentController = require('../controller/paymentController')

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
router.post('/adminlogin', adminController.adminLogin);
// router.post('/addadmin', upload.single('image'), adminController.addAdmin);
router.post('/addadmin', verifyToken, upload.single('image'), adminController.addAdmin);
router.get('/listadmin', verifyToken, adminController.listAdmin);
router.get('/getadmindetail/:id', verifyToken, adminController.getDetailAdmin);
router.put('/updateadmin/:id', verifyToken, upload.single('image'), adminController.updateAdmin);
router.put('/updateadminprofile/:id', verifyToken, upload.single('image'), adminController.updateProfileAdmin);
router.put('/updateadminstatus/:id', adminController.updateAdminStatus);
router.post('/changepassword/:id',verifyToken, adminController.changePasswordAdmin);
router.delete('/removeadmin/:id', verifyToken, adminController.deleteAdmin);

//roleController
router.post('/addrole', verifyToken, roleController.addRole);
router.get('/listrole', verifyToken, roleController.listRole);
router.get('/getroledetail/:id', verifyToken, roleController.getDetailRole);
router.put('/updaterole/:id', verifyToken, roleController.updateRole);
router.delete('/removerole/:id', verifyToken, roleController.deleteRole);

//resourceController
router.post('/addresource', verifyToken, upload.single('image'), resourceController.addResource);
router.get('/listallresource', verifyToken, resourceController.listAllResource);
router.get('/listresource', verifyToken, resourceController.listResource);
router.get('/getresourcedetail/:id', verifyToken, resourceController.getDetailResource);
router.put('/updateresource/:id', verifyToken, upload.single('image'), resourceController.updateResource);
router.delete('/removeresource/:id', verifyToken, resourceController.deleteResource);

//bannerController
router.post('/addbanner', verifyToken, upload.single('image'), bannerController.addBanner);
router.get('/listbanner', verifyToken, bannerController.listBanner);
router.get('/getbannerdetail/:id', verifyToken, bannerController.getDetailBanner);
router.put('/updatebanner/:id', verifyToken, upload.single('image'), bannerController.updateBanner);
router.delete('/removebanner/:id', verifyToken, bannerController.deleteBanner);
router.put('/updatebannerstatus/:id', bannerController.updateBannerStatus);

//courseContBanner
router.post('/addcourse', verifyToken, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), courseController.addCourse);
router.get('/listallcourse', verifyToken, courseController.listAllCourse);
router.get('/listcourse', verifyToken, courseController.listCourse);
router.get('/getcoursedetail/:id', verifyToken, courseController.getDetailCourse);
router.put('/updatecourse/:id', verifyToken, upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), courseController.updateCourse);
router.delete('/removecourse/:id', verifyToken, courseController.deleteCourse);
router.put('/updatestatus/:id', courseController.updateCourseStatus);

//studentController
router.post('/addstudent', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'passimg', maxCount: 1 }, { name: 'docimg', maxCount: 1 }]), studentController.addStudent);
router.get('/liststudent', verifyToken, studentController.listStudent);

router.get('/getstudentdetail/:id', verifyToken, studentController.getDetailStudent);
router.put('/updatestudent/:id', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'passimg', maxCount: 1 }, { name: 'docimg', maxCount: 1 }]), studentController.updateStudent);
router.delete('/removestudent/:id', verifyToken, studentController.deleteStudent);
// router.put('/updatestatus/:id', courseController.updateCourseStatus);
router.get('/listaccount', verifyToken, studentController.listAccount);

// countryController
router.post('/addcountry', verifyToken, countryController.addCountries);
router.get('/listcountry', verifyToken, countryController.listCountries);

// stateController
router.post('/addstate', verifyToken, stateController.addStates);
router.get('/liststate/:id', verifyToken, stateController.listStates);

//batchController
router.post('/addbatch', verifyToken, batchController.addBatch);
router.get('/listbatch', verifyToken, batchController.listBatch);
router.get('/getbatchdetail/:id', verifyToken, batchController.getDetailBatch);
router.put('/updatebatch/:id', verifyToken, batchController.updateBatch);
router.delete('/removebatch/:id', verifyToken, batchController.deleteBatch);

//paymentController
router.post('/addpayment', verifyToken, paymentController.addPayment);
router.get('/listpayment', verifyToken, paymentController.listPayment);
router.get('/getpaymentdetail/:id', verifyToken, paymentController.getDetailPayment);
router.put('/updatepayment/:id', verifyToken, paymentController.updatePayment);
router.put('/updateallpaymentstatus/:id', paymentController.updateAllPaymentStatus);
router.delete('/removepayment/:id', verifyToken, paymentController.deletePayment);
router.get('/studentpayment', verifyToken, paymentController.studentPayment);
router.put('/updatefeestatus/:id', paymentController.updateFeeStatus);
router.put('/updatepaymentstatus/:id', paymentController.updatePaymentStatus);

module.exports = router;
