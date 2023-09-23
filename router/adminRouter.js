const express = require("express");
const config = require("../config/config");
const session = require("express-session");
const bodyparser = require("body-parser");
const adminController = require("../controller/adminController");
const adminAuth = require("../middleware/adminAuth");
const categoryController = require("../controller/categoryControler");
const categoryUpload = require("../multer/category-multer");
const productController = require("../controller/productController")
const productUpload = require("../multer/product-upload")
const bannerController = require("../controller/bannerController")
const { banner } = require("../multer/banner-upload")



const admin_route = express();
admin_route.use(session({ secret: config.sessionSecret }));

admin_route.use(express.static('public'))



admin_route.use(bodyparser.json());
admin_route.use(bodyparser.urlencoded({ extended: true }));
admin_route.set("view engine", "ejs");
admin_route.set('views', "./view/admin")



admin_route.post('/', adminController.verifyLogin);
admin_route.get("/" ,adminAuth.isLogout,adminController.loadLogin);
admin_route.get("/adminHome", adminAuth.isLogin, adminController.loadDashboard);
admin_route.get("/logout", adminAuth.isLogin, adminController.logout)
admin_route.get("/productList",adminAuth.isLogin, adminController.productList);
admin_route.get("/productgrid",adminAuth.isLogin, adminController.productGrid1);
admin_route.get("/productgrid2",adminAuth.isLogin, adminController.productGrid2);
//
//  admin_route.get("/categories",adminController.categories);
admin_route.get("/order1",adminAuth.isLogin, adminController.order1);

//route categories

admin_route.get('/category', adminAuth.isLogin,categoryController.category)
admin_route.post('/add-category', categoryUpload.single('image'), categoryController.addCategory)
admin_route.get('/delete-category', categoryController.delete)


//route product
admin_route.get('/all-products', productController.allProduct);
admin_route.get('/add-product', productController.showAddProduct);
admin_route.post('/add-product', productUpload.array('image', 4), productController.addProduct)
admin_route.get('/delete-product/:id', productController.deleteProduct)

admin_route.get('/page-products-list', adminAuth.isLogin,productController.showAddProduct)
admin_route.get("/userslist", adminAuth.isLogin,adminController.userslist)
admin_route.get("/unblock-user",adminAuth.isLogin, adminController.unblockUser)
admin_route.get("/block-user", adminAuth.isLogin,adminController.blockUser)
admin_route.get("/dashboard",adminAuth.isLogin,adminController.dashBoard)


// admin_route.get("/catgories",adminController.catgories)
admin_route.get("/edit/:id", adminAuth.isLogin,adminController.editProductPage)
admin_route.post("/edit/:id", adminAuth.isLogin,productUpload.array('image', 4), adminController.editProduct)
admin_route.get("/order",adminAuth.isLogin, adminController.ShowOrders)
admin_route.get("/order-detail/:id", adminAuth.isLogin,adminController.orderDetail)


admin_route.get('/couponlist',adminAuth.isLogin, adminController.couponlist);
admin_route.get('/addcoupon', adminAuth.isLogin,adminController.addcoupon);
admin_route.post('/addcoupon', adminAuth.isLogin,adminController.addcouponpost);
admin_route.get('/coupon/edit',adminAuth.isLogin, adminController.editcoupon);
admin_route.post('/editcoupon', adminAuth.isLogin,adminController.editcouponpost);
admin_route.post("/change-order-status", adminAuth.isLogin,adminController.changeStatus)
admin_route.post("/searchCat",adminAuth.isLogin, categoryController.categorySearch)

admin_route.get("/salesToday", adminAuth.isLogin,adminController.salesToday)
admin_route.get("/salesWeekly", adminAuth.isLogin,adminController.salesWeekly)
admin_route.get("/salesMonthly",adminAuth.isLogin, adminController.salesMonthly)
admin_route.get("/salesYearly", adminAuth.isLogin,adminController.salesYearly)
admin_route.get("/salesReport",adminAuth.isLogin, adminController.salesReport)
admin_route.get("/monthly-report", adminAuth.isLogin,adminController.monthlyreport)

//banner

admin_route.get('/bannerManagement', adminAuth.isLogin,bannerController.bannerPage)

admin_route.get('/addBanner',adminAuth.isLogin, bannerController.addBanner)

admin_route.post('/add-banner',adminAuth.isLogin, banner.single('image'), bannerController.bannerAdded)

admin_route.get('/editBanner/:id', adminAuth.isLogin,bannerController.editBanner)

admin_route.post('/editBanner', adminAuth.isLogin,banner.single('image'), bannerController.bannerEdited);

admin_route.get('/deleteBanner/:id', adminAuth.isLogin,bannerController.deleteBanner)
admin_route.get("/deletecoupon" ,adminAuth.isLogin,adminController.deletecoupon)



















module.exports = admin_route;