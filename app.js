const express = require("express");
const app = express();
const port = 5000;
const session = require('express-session')
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/shoe_cart");
app.set("view engine","ejs");
app.set('public',__dirname+'public/')
const errorHandler=require("./middleware/errorhandler")




//user route;
app.use(session({
    secret: 'keyboard cat',
    resave:false,
    saveUninitialized:false,
    cookie: { secure: false },
 
  }));

  

const userRoute=require("./router/userRouter");
app.use('/',userRoute);

const admin_route=require("./router/adminRouter");
app.use("/admin",admin_route);

app.use(errorHandler);





app.listen(port, () => {
    console.log("server is running on localhost" ,"${port}")
});
