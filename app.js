const express = require("express");
const app = express();
const port = 5000;
const session = require('express-session')
const dotenv= require('dotenv').config()
const mongoose = require("mongoose");
mongoose.connect(process.env.CLUSTER);
app.set("view engine","ejs");
app.set('public',__dirname+'public/')
const errorHandler=require("./middleware/errorhandler")
const noCache=require("nocache")





//user route;
app.use(session({
    secret: 'keyboard cat',
    resave:false,
    saveUninitialized:true,
    cookie: { secure: false },
 
  }));

  app.use(noCache())


  

const userRoute=require("./router/userRouter");
app.use('/',userRoute);

const admin_route=require("./router/adminRouter");
app.use("/admin",admin_route);

app.use(errorHandler);





app.listen(port, () => {
    console.log(`server is running on localhost ,${port}`)
});
