const express = require("express");
const user_route = express();
const userController = require("../controller/userController");
const bodyparser = require("body-parser");
const session = require("express-session");
const config = require('../config/config')
const path = require('path')
const cartController = require("../controller/cartController")
const auth = require("../middleware/auth")
const userModel = require("../model/userModel");




user_route.use(express.static('public'))


user_route.use(session({ secret: config.sessionSecret }));












user_route.use(bodyparser.json());
user_route.use(bodyparser.urlencoded({ extended: true }));









user_route.set("view engine", "ejs");
user_route.set("views", "./view/users");



user_route.get("/register", userController.loadRegister);
user_route.post("/register", userController.insertUser);

user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.get("/", userController.loadHome);
user_route.get("/logout", auth.isLogin, userController.logOut)

user_route.post("/login", userController.verifyLogin)
user_route.post("/login", userController.loadHome)
user_route.get("/validate", userController.loadHome);
user_route.post("/validate", userController.validateOtp)
user_route.get('/resendOTP',userController.resendOTP)


user_route.get("/categories", userController.categories)
user_route.get('/product-list', userController.products)
user_route.get("/productDetail", userController.productDetail)

user_route.post("/check-out", userController.checkOut)
user_route.get("/sucess", userController.orderSuccess)
user_route.post("/confirmation", auth.isLogin, userController.confirmation)
user_route.get("/Account", auth.isLogin, userController.userProfile)
user_route.get("/cart", auth.isLogin, cartController.getCartPage);
user_route.post("/addCart", auth.isLogin, cartController.addToCart)
user_route.post("/removeFromCart", cartController.deleteCart)

user_route.get("/address", auth.isLogin, userController.profile)
user_route.get("/addAdress", userController.addressForm)
user_route.post("/addAdress", userController.confirmAddress)
user_route.post("/removeAdd", userController.removeAddres)
user_route.post("/change-quantity", cartController.changeQuantity)
user_route.post("/verifyPayment", userController.verifyRazorpayPayment)
user_route.get('/addcoupon', userController.addcoupon);
user_route.post('/addcoupon', userController.addcouponpost);
user_route.get("/orderlist", userController.ShowOrders)
user_route.get("/orderDetail", userController.orderDetails)
user_route.post("/change-order-status", userController.changeStatus)
user_route.get("/wallet-status", userController.walletTrans)
user_route.get("/view-coupon", userController.couponlist)
user_route.post("/coupon", userController.checkCoupon)
user_route.get("/filter", userController.subCategory)
user_route.post("/search", userController.searchProd)
user_route.get("/editAdress", userController.editAddress)
user_route.post("/editAdress", userController.confirmEdit)
user_route.post("/invoice", userController.downloadInvoice)
user_route.get('/priceFilter',userController.priceFilter)






















module.exports = user_route;