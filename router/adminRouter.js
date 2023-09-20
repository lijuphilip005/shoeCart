const express = require("express");
const config = require("../config/config");
const session = require("express-session");
const bodyparser = require("body-parser");
const adminController = require("../controller/adminController");
const auth = require("../middleware/adminAuth");
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


admin_route.get("/", adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);
admin_route.get("/adminHome", auth.isLogin, adminController.loadDashboard);
admin_route.get("/logout", auth.isLogin, adminController.logout)
admin_route.get("/productList", adminController.productList);
admin_route.get("/productgrid", adminController.productGrid1);
admin_route.get("/productgrid2", adminController.productGrid2);
//
//  admin_route.get("/categories",adminController.categories);
admin_route.get("/order1", adminController.order1);

//route categories

admin_route.get('/category', categoryController.category)
admin_route.post('/add-category', categoryUpload.single('image'), categoryController.addCategory)
admin_route.get('/delete-category/:id', categoryController.delete)


//route product
admin_route.get('/all-products', productController.allProduct);
admin_route.get('/add-product', productController.showAddProduct);
admin_route.post('/add-product', productUpload.array('image', 4), productController.addProduct)
admin_route.get('/delete-product/:id', productController.deleteProduct)

admin_route.get('/page-products-list', productController.showAddProduct)
admin_route.get("/userslist", adminController.userslist)
admin_route.get("/unblock-user", adminController.unblockUser)
admin_route.get("/block-user", adminController.blockUser)
admin_route.get("/dashboard", adminController.dashBoard)


// admin_route.get("/catgories",adminController.catgories)
admin_route.get("/edit/:id", adminController.editProductPage)
admin_route.post("/edit/:id", productUpload.array('image', 4), adminController.editProduct)
admin_route.get("/order", adminController.ShowOrders)
admin_route.get("/order-detail/:id", adminController.orderDetail)


admin_route.get('/couponlist', adminController.couponlist);
admin_route.get('/addcoupon', adminController.addcoupon);
admin_route.post('/addcoupon', adminController.addcouponpost);
admin_route.get('/coupon/edit', adminController.editcoupon);
admin_route.post('/editcoupon', adminController.editcouponpost);
admin_route.post("/change-order-status", adminController.changeStatus)
admin_route.post("/searchCat", categoryController.categorySearch)

admin_route.get("/salesToday", adminController.salesToday)
admin_route.get("/salesWeekly", adminController.salesWeekly)
admin_route.get("/salesMonthly", adminController.salesMonthly)
admin_route.get("/salesYearly", adminController.salesYearly)
admin_route.get("/salesReport", adminController.salesReport)
admin_route.get("/monthly-report", adminController.monthlyreport)

//banner

admin_route.get('/bannerManagement', bannerController.bannerPage)

admin_route.get('/addBanner', bannerController.addBanner)

admin_route.post('/add-banner', banner.single('image'), bannerController.bannerAdded)

admin_route.get('/editBanner/:id', bannerController.editBanner)

admin_route.post('/editBanner', banner.single('image'), bannerController.bannerEdited);

admin_route.get('/deleteBanner/:id', bannerController.deleteBanner)



















module.exports = admin_route;