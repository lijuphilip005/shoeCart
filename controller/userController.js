const user = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config/config")
const otpGenerator = require('otp-generator')
const session = require("express-session");
const catMOdel = require("../model/category-model")
const productModel = require('../model/product-model')
//const adminCategories=require("../view/admin/page-categories");
const mongoose = require('mongoose')
const orderModel = require("../model/order-model");
const coupounModel = require("../model/coupon")
const mongodb = require('mongodb')
const easyinvoice = require("easyinvoice")
const { Readable } = require("stream");







const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        console.log(error.message)
    }
};


const loadRegister = async (req, res, next) => {

    try {
        console.log(req.query, "queryyyy")

        if (req.query.id) {
            req.session.referel = req.query.id
            console.log(req.session.referel, "sessionnnnn");
        }

        console.log("entereddddd")
        res.render("register")

    } catch (err) {
        next(err)
    }
};

const insertUser = async (req, res, next) => {


    try {
        const spassword = await securePassword(req.body.password);
        const newUser = new user({
            name: req.body.name,
            email: req.body.email,
            otp: req.body.otp,
            password: spassword,
            repeatPassword: spassword,
            is_admin: 0,

        });
        const userData = await newUser.save();
        if (userData) {
            req.session.otp = await sendVerifyMail(req.body.name, req.body.email, userData._id)

            res.render("otp", { message: "your registration is sucessfull,check your mail" ,email:req.body.email});

        } else {
            res.render("register", { message: "your registration is failed" });
        }

    } catch (err) {
        next(err)
    }
};



const resendOTP=async (req,res,next)=>{
    try {
        email=req.query.email
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTls: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword,

            }
        })

        let otp = generateOtp();
        const mailOptions = {
            from: "lijuphilip50@gmail.com",
            to: email,
            subject: "otp for verification",
            html: `<p> Hi ${email},your otp is ${otp}"verify</a> your mail</p>`,

        }
       transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error.message);
            } else {
                console.log("email has been sent:", info.response);

            }
        });
        
          await  res.render('otp',{ message: "your registration is sucessfull,check your mail" ,email})
       
        

       

        
    } catch (err) {
        next(err)
    }
}





const loginLoad = async (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/')

        } else {
            res.render("login")
        }
    } catch (err) {
        next(err)
    }


};


const verifyLogin = async (req, res, next) => {
    try {


        const email = req.body.email
        const password = req.body.password


        const userData = await user.findOne({ email: email, isVerified: 0 })


        if (userData) {
            console.log("ent");
            req.session.user = userData
            console.log(req.session.user);
            if (req.session.referel) {

                const refererId = req.session.referel;
                const userId = req.session.user;
                const walletUpdateAmount = 200;
                const historyUpdateAmount = 200;

                // Update the referer's wallet and push a new history record
                await userModel.findByIdAndUpdate(
                    refererId,
                    {
                        $push: {
                            wallet: {
                                amount: walletUpdateAmount,
                                paymentType: 'C',
                                timestamp: Date.now(),
                            },
                            history: {
                                amount: historyUpdateAmount,
                                paymentType: 'Credit',
                                timestamp: Date.now(),
                            },
                        },
                    },
                    { new: true }
                );
                await userModel.findByIdAndUpdate(
                    req.session.user,
                    {
                        $push: {
                            wallet: {
                                amount: walletUpdateAmount,
                                paymentType: 'C',
                                timestamp: Date.now(),
                            },
                            history: {
                                amount: historyUpdateAmount,
                                paymentType: 'Credit',
                                timestamp: Date.now(),
                            },
                        },
                    },
                    { new: true }
                );
            }
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch == 0) {
                res.render("login", { message: "email and password is incorrect" })


            } else {
                console.log(req.session.isLoggedIn + "Before");
                req.session.isLoggedIn = true
                res.redirect('/')

            }


        } else {
            res.render("login", { message: "email and password is incorrect" })
        }



    } catch (err) {
        next(err)
    }
};

const logOut = async (req, res, next) => {
    try {
        req.session.destroy()
        res.redirect("/")

    } catch (err) {
        next(err)
    }
}


const sendVerifyMail = async (name, email, user_id, next) => {
    try {

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTls: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword,

            }
        })

        let otp = generateOtp();
        const mailOptions = {
            from: "lijuphilip50@gmail.com",
            to: email,
            subject: "otp for verification",
            html: `<p> Hi ${name},your otp is ${otp}"verify</a> your mail</p>`,

        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error.message);
            } else {
                console.log("email has been sent:", info.response);

            }
        });

        return otp;

    } catch (err) {
        next(err)
    }



};

const verifyMail = async (req, res, next) => {
    try {
        const updateInfo = await user.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        console.log(updateInfo);
        res.render("emailVerified")
    } catch (err) {
        next(err)
    }
};

const generateOtp = () => {
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    return otp;
};




const loadHome = async (req, res, next) => {
    try {

        res.render("userHome", { log: req.session.isLoggedIn })

    } catch (err) {
        next(err)
    }
};


const validateOtp = async (req, res, next) => {
    try {
        otp = req.body.otp.join('');
        otp = otp.toLowerCase();
        if (req.session.otp == otp) {

            await user.findOneAndUpdate({ _id: req.params.id }, { verified: 1 }, { new: true }).then((updated) => {
                req.session.loggedIn = true;
                req.session.user = user;
                res.redirect('/')
            }).catch((err) => {
                console.log(err)
                res.redirect('/user')
            })
        } else {
            console.log("Not success");
            res.redirect('/register')
        }
    } catch (err) {
        next(err)
    }
};


const categories = async (req, res, next) => {
    try {
        const findcart = await catMOdel.find({})
        console.log(findcart)
        res.render("category", { log: req.session.isLoggedIn })
    } catch (err) {
        next(err)
    }
};
const products = async (req, res, next) => {
    try {
        productModel.find({}).sort({ created_on: -1 }).then((data) => {

            const itemsperpage = 8;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(data.length / 8);
            const currentproduct = data.slice(startindex, endindex);
            res.render("single-product", { data: currentproduct, log: req.session.isLoggedIn, totalpages, currentpage })
        })

    } catch (err) {
        next(err)
    }
}

const productDetail = async (req, res, next) => {
    try {
        const productId = req.query.id
        console.log(productId);
        productModel.findById(productId).then((data) => {
            console.log(data.name);
            res.render('productDetail', { data, log: req.session.isLoggedIn })
        })
    } catch (err) {
        next(err)
    }
};

const cart = async (req, res, next) => {
    try {
        const productId = req.query.id
        productModel.findById(productId).then((data) => {


            res.render("cart", { data, log: req.session.isLoggedIn })
        })

    } catch (err) {
        next(err)
    }
};




const checkOut = async (req, res, next) => {
    try {
        let coupons = await coupounModel.find({ minimumAmount: { $lte: req.body.total } })
        console.log(coupons);
        console.log(req.session.user._id, "oooo");
        user.find({ _id: req.session.user._id }).then((data) => {
            console.log(data, "dtaaa");
            res.render("checkout", { data: data, total: req.body.total, coupons, log: req.session.isLoggedIn })
            console.log(data, "checkoutooooooooooooo")



        })
    } catch (err) {
        next(err)
    }
};



const orderSuccess = async (req, res, next) => {
    try {
        let userId = req.session.user._id;
        console.log(userId);

        let order = await orderModel.findOne({ user: userId });
        console.log(order, "oooooooooooo");

        let users = await user.findOne({ _id: userId });
        console.log(users, "uuuuuuuuuuu");

        res.render("confirmation", { order, users, log: req.session.isLoggedIn });
    } catch (err) {
        next(err)
    }
}



const confirmation = async (req, res, next) => {
    try {
        console.log(req.body.payment);

        const status = req.body.payment;

        const userData = await user.findById(req.session.user._id);
        console.log(userData, "00000");
        const items = [];

        let canPlaceOrder = true; // Initialize a flag to check if the order can be placed

        for (let i = 0; i < userData.cart.length; i++) {
            const product = await productModel.findById(userData.cart[i].productId);

            if (product) {
                if (product.quantity < 1) {
                    canPlaceOrder = false; // Product quantity is below 1, cannot place the order
                    console.error(`Product with ID ${product._id} has quantity below 1.`);

                    break; // Exit the loop when a product quantity is below 1
                } else {
                    const temp = {
                        product: product._id,
                        quantity: userData.cart[i].quantity,
                        price: product.sale_price,
                    };
                    items.push(temp);

                    const updatedDetails = await productModel.findByIdAndUpdate(
                        temp.product,
                        { $inc: { quantity: -parseInt(temp.quantity, 10) } },
                        { new: true }
                    );

                    console.log(updatedDetails, "Updated Product Details");
                }
            } else {
                // Handle the case where the product doesn't exist
                console.error(`Product with ID ${userData.cart[i].productId} not found.`);
            }
        }

        if (!canPlaceOrder) {
            // Redirect back when a product quantity is below 1
            res.redirect('/your-redirection-path'); // Replace with your desired redirection path
            return; // Exit the function early
        }

        const order = await orderModel.create({
            user: req.session.user._id,
            items,
            address: userData.address[0],
            paymentMode: status,
            discount: req.body.discount,
            totalAmount: 0,
            finalAmount: 0,
        });

        console.log(order, "Order Created");

        if (order.paymentMode === 'cod') {
            console.log("COD: " + order.paymentMode);
            id = req.session.user._id
            await user.findByIdAndUpdate(id, { $set: { "cart": [] } })
                .then((data) => {
                    console.log("cart deleted");

                }).catch((err) => {
                    console.log("cart not deleted");

                })

            res.json({ payment: true, method: "cod", order: order });

        } else if (order.paymentMode === 'online') {
            const generatedOrder = await generateOrderRazorpay(order._id, order.finalAmount);
            res.json({ payment: false, method: "online", razorpayOrder: generatedOrder, order: order });
        }
        else if (order.paymentMode === 'wallet') {
            id = req.session.user._id
            await user.findByIdAndUpdate(id, { $set: { "cart": [] } })
                .then((data) => {
                    console.log("cart deleted");

                }).catch((err) => {
                    console.log("cart not deleted");

                })

            await user.findByIdAndUpdate(id, {
                $push: {
                    wallet: { amount: Number(-order.finalAmount), timestamp: Date.now(), paymentType: "D" }
                }
            })
                .then((data) => {
                    console.log(data?.wallet);
                })

            res.json({ payment: true, method: "cod", order: order });

        }
    } catch (err) {
        next(err)
        res.status(500).send("Internal Server Error");
    }
};

const Razorpay = require('razorpay');
const { Transaction } = require("mongodb");
const userModel = require("../model/userModel");
const { log } = require("console");
// const { default: items } = require("razorpay/dist/types/items");
const instance = new Razorpay({ key_id: 'rzp_test_80jNgNYgTgs47P', key_secret: 'Ag95tYV92s1TcaDaz0Ix79A8' });

const generateOrderRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("failed");
                console.log(err);
                reject(err);
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })
}
const verifyOrderPayment = (details) => {
    console.log("DETAILS : " + JSON.stringify(details));
    return new Promise((resolve, reject) => {
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'Ag95tYV92s1TcaDaz0Ix79A8')
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if (hmac == details.payment.razorpay_signature) {
            console.log("Verify SUCCESS");
            resolve();
        } else {
            console.log("Verify FAILED");
            reject();
        }
    })
};

const verifyRazorpayPayment = (req, res, next) => {
    try {
        verifyOrderPayment(req.body)
            .then(async () => {
                console.log("Payment SUCCESSFUL");


                res.json({ status: true });


            }).catch((err) => {
                console.log(err);
                res.json({ status: false, errMsg: 'Payment failed!' });
            });
    } catch (err) {
        next(err)
        res.json({ status: false, errMsg: 'Payment failed!' });
    }
};

//

const userProfile = async (req, res, next) => {

    try {
        var userdata = await req.session.user._id
        user.findById(userdata).then((data) => {
            res.render("user-profile", { data, userdata })
            console.log(data, 'mmmmmmmmmmmmm')

        })




    } catch (err) {
        next(err)
    }
};


const profile = async (req, res, next) => {
    try {

        const data = await user.findById(req.session.user._id).lean()
        console.log('Dataaaaaaaaaa', data.address.length);
        res.render("user-address", { data, log: req.session.isLoggedIn });
    } catch (err) {
        next(err)
    }
};

const addressForm = async (req, res, next) => {
    try {
        await user.find({}).then((data) => {
            res.render("add-address", { data });
        })

    } catch (err) {
        next(err)
    }
};


const confirmAddress = async (req, res, next) => {
    try {

        var id = req.session.user._id
        console.log(id)

        await user.findByIdAndUpdate({ _id: id }, {
            $push: {
                address: {
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    number: req.body.number,
                    altNumber: req.body.altNumber,
                    pinCode: req.body.pinCode,
                    house: req.body.house,
                    area: req.body.area,
                    landmark: req.body.landmark,
                    town: req.body.town,
                    state: req.body.state
                }
            }
        })
        res.redirect("/address")
    } catch (err) {
        next(err)
    }
};


const total = async (req, res, next) => {
    try {
        var totalPrice = 0
        var quantity = 0
        for (var i = 0; i < cartProducts.length; i++) {
            console.log("hi");
            quantity = cartProducts[i].quantity
            totalPrice = totalPrice + (quantity * cartProducts[i].ProductDetails[0].saleprice)
        }

        res.render('user/cart', { isLoggedIn: req.session.isLoggedIn, data: cartProducts, total: totalPrice })
    } catch (err) {
        next(err)
    }
};






// deleteProduct: async (req,res)=>{
//     id=req.params.id
//     console.log(id);
//     await productModel.findByIdAndDelete({_id:id})
//     .then((data)=>{
//         res.redirect('/admin/all-products')
//     }).catch((err)=>{
//         console.log(err);
// })
// }
// }

// const removeAddres = async (req, res) => {
//     console.log(req.body);

//     try {
//         const userId = req.body.userId; 
//         var addressId=parseInt(req.body.adressId)
//         console.log(addressId);

//         await user.findByIdAndDelete(userId,{addressId});

//         res.json({ message: 'Address removed successfully' });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };



const removeAddres = async (req, res, next) => {
    console.log("hellllllllllllllll")
    id = req.session.user._id
    console.log(id)


    const profile = await user.findById(id)
    profile.address.pull(req.body.addressId)
    await profile.save()
    res.json({ status: true })

}

//coupoun

const addcoupon = async (req, res, next) => {
    try {
        const totalAmountInCart = req.query.total;
        console.log(totalAmountInCart);
        const category = await catMOdel.find();
        const coupons = await coupounModel.find({
            minimumAmount: { $lt: totalAmountInCart },
        });
        console.log(coupons);
        res.render("coupon", { coupons, category });
    } catch (err) {
        next(err)
    }
};

const addcouponpost = async (req, res, next) => {
    const shouldRedirect = true;
    if (shouldRedirect) {
        res.json({ redirect: true });
    } else {
        res.json({ redirect: false });
    }
};
//order details
// const listOrder = async (req, res) => {
//     try {
//         orderModel.find({}).sort({ createdAt: -1 }).then((data) => {
//             res.render("orderlist", { data })
//         })

//     } catch (error) {
//         console.log(error.message)
//     }
// };


const ShowOrders = async (req, res, next) => {
    try {
        console.log(req.query.id)
        const oid = new mongodb.ObjectId(req.query.id)
        let orders = await orderModel.aggregate([
            { $match: { user: oid } },
            { $unwind: '$items' },
            {
                $project: {
                    proId: { '$toObjectId': '$items.product' },
                    quantity: '$items.quantity',
                    address: '$address',
                    items: '$items',
                    finalAmount: '$finalAmount',
                    createdAt: '$createdAt',
                    orderStatus: '$orderStatus',
                    paymentMode: '$paymentMode',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'proId',
                    foreignField: '_id',
                    as: 'ProductDetails',
                }
            }
        ])
        orders.reverse();
        const itemsperpage = 5;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 5);
        const currentproduct = orders.slice(startindex, endindex);
        let userData = req.session.user
        console.log("Current products", currentproduct)
        res.render('orderlist', { orders: currentproduct, totalpages, currentpage, userData, log: req.session.isLoggedIn })
        console.log(orders, "orrrrrrrrrrrr")

    } catch (err) {
        next(err)
        res.send("Error")
    }
};



const orderDetails = async (req, res, next) => {
    try {
        console.log(req.query.id)
        const oid = new mongodb.ObjectId(req.query.id)


        const user = req.session.user._id
        console.log(user)
        let orders = await orderModel.aggregate([
            { $match: { _id: oid } },
            { $unwind: '$items' },
            {
                $project: {
                    proId: { '$toObjectId': '$items.product' },
                    quantity: '$items.quantity',
                    address: '$address',
                    items: '$items',
                    finalAmount: '$finalAmount',
                    createdAt: '$createdAt',
                    discount: '$discount',
                    orderStatus: '$orderStatus',
                    paymentMode: '$paymentMode',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'proId',
                    foreignField: '_id',
                    as: 'ProductDetails',
                }
            }
        ])
        let userData = req.session.user

        res.render('orderDetails', { order: orders, userData, log: req.session.isLoggedIn })
        console.log(orders, "orrrrrrrrrrrr")

    } catch (err) {
        next(err)
    }

};

//order status
const changeStatus = (req, res, next) => {
    try {
        orderModel.findByIdAndUpdate(req.body.orderId, { orderStatus: req.body.status }).then((order) => {
            addToWallet(req, res, order.finalAmount, "c")
            console.log(order);
            res.json(true);
        }).catch((err) => {
            console.log(err);
            res.json(false);
        })
    } catch (err) {
        next(err)
        res.json(false);
    }
};

//wallet

const addToWallet = async (req, res, amount, transactionType) => {
    var id = req.session.user._id;
    console.log(id);

    await user.findByIdAndUpdate(id, {
        $push: {
            wallet: { amount: Number(amount), paymentType: transactionType }

        }
    })
        .then((data) => {
            console.log(data?.wallet);
        })

};


const walletTrans = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        console.log(userId);
        user.findById(userId)
            .then((data) => {
                data.wallet.reverse()

                const itemsperpage = 5;
                const currentpage = parseInt(req.query.page) || 1;
                const startindex = (currentpage - 1) * itemsperpage;
                const endindex = startindex + itemsperpage;
                const totalpages = Math.ceil(data.wallet.length / 5);
                const currentproduct = data.wallet.slice(startindex, endindex)
                console.log("Current products : ", currentproduct)

                console.log(totalpages);
                res.render("wallet", { data: currentproduct, totalpages, currentpage });

            })



    } catch (err) {
        next(err)
    }
};























const couponlist = async (req, res, next) => {
    try {
        coupounModel.find({}).then((data) => {
            res.render("viewcoupons", { data })
            console.log(data, "couuuuuuuuuuuu");

        })

    } catch (err) {
        next(err)
    }
};


const checkCoupon = async (req, res, next) => {
    try {
        const discountValue = req.body.discount

        const coupon = await coupounModel.findOne({
            code: discountValue.toLowerCase()
        })
        console.log(coupon);
        res.json({ coupon })

    } catch (err) {
        next(err)
    }
};

const subCategory = async (req, res, next) => {

    const category = await catMOdel.find().lean()
    console.log(req.query.cat);
    await productModel.find({ category: req.query.cat }).lean()
        .then((data) => {
            data.reverse()
            const itemsperpage = 5;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(data.length / 5);
            const currentproduct = data.slice(startindex, endindex);
            res.render('single-product', { data: data, isLoggedIn: req.session.user._id, subCategory: req.params.cat, cat: null, totalPages: false, totalpages, currentpage })
        }).catch((err) => {
            next(err)
        })
};

const priceFilter=async (req,res,next)=>{
    try {
        const maxPrice=req.query.maxPrice;
        const price=req.query.price
        await productModel.find({$and:[{sale_price:{$gte:price}},{sale_price:{$lte:maxPrice}}]  }).lean()
        .then((data) => {
            data.reverse()
            const itemsperpage = 5;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(data.length / 5);
            const currentproduct = data.slice(startindex, endindex);
            res.render('single-product', { data: currentproduct, isLoggedIn: req.session.user._id, subCategory: req.params.cat, cat: null, totalPages: false, totalpages, currentpage })


        
    })} catch (err) {
        next(err)
    }

}


const searchProd = async (req, res, next) => {
    try {
        let data = await productModel.find({
            name: { $regex: `${req.body.search}`, $options: 'i' }
        });
        console.log(data);
        res.render('single-product', { data, isLoggedIn: req.session.isLoggedIn, })
    } catch (err) {
        next(err)
    }
};


const editAddress = async (req, res, next) => {
    try {
        const ad = req.query.id
        const login = req.session.user._id
        let oid = new mongodb.ObjectId(login)

        console.log(ad, "lllllllllllllllll");
        const profile = await user.findById(login)
        console.log(profile, "prrrrrr");
        const userAddress = profile.address.id(ad)

        res.render("editaddress", { userAddress })
        console.log(userAddress, "adddddddd");


    } catch (err) {
        next(err)
    }

};


const confirmEdit = async (req, res, next) => {
    try {
        const quer = req.query.id
        console.log(quer,"helllllllllllll");

        var id = req.session.user._id
        console.log(id)
        const User= await user.findById(id)
         const address=User.address.id(quer)
         address.set( {
            name: req.body.name,
            number: req.body.number,
            altNumber: req.body.altNumber,
            pinCode: req.body.pinCode,
            house: req.body.house,
            area: req.body.area,
            landmark: req.body.landmark,
            town: req.body.town,
            state: req.body.state
        })
         await User.save()


        
        res.redirect("/address")
    } catch (err) {
        next(err)
    }
};

const downloadInvoice = async (req, res, next) => {
    try {
        const id = req.query.id;
        console.log(id, "helllllloooo");
        const userId = req.session.user._id;
        const result = await orderModel.findById(id);
        console.log(result.items[0].product);
        const product =await productModel.findById(result.items[0].product)

        console.log(product,"pd");

        const User = await user.findOne({ _id: userId });
        console.log("USER: ", User);
        console.log("RESULT: ", result)
        console.log('helele');
        //   const address = await User.address.find(
        //     (element) => {
        //         console.log(element._id,'plkmjujk')
        //         console.log(result.address[0]._id,'plkmjujk')
        //         element._id == result.address[0]._id
        //     }
        //   );

        const order = {
            _id: id,
            totalAmount: result.totalAmount,
            date: result.createdAt, // Use the formatted date
            paymentMethod: result.paymentMode,
            orderStatus: result.orderStatus,
            discount: result.discount,
            name: result.address[0].name,
            number: result.address[0].number,
            pincode: result.address[0].pinCode,
            area: result.address[0].area,
            landmark: result.address[0].landmark,
            state: result.address[0].state,
            house: result.address[0].house,
            items: result.items,
        };
        console.log(order, "orrrrder");
        //set up the product
        const products = order.items.map((items) => ({
            quantity: parseInt(items.quantity),
            description: product.name,

            price: parseInt(product.sale_price),
            total: parseInt(result.finalAmount),
            "tax-rate": 0,
        }));
        const isoDateString = order.date;
        const isoDate = new Date(isoDateString);

        const options = { year: "numeric", month: "long", day: "numeric" };
        const formattedDate = isoDate.toLocaleDateString("en-US", options);
        const data = {
            customize: {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
            },
            images: {
                // The invoice background
                background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
            },
            // Your own data
            sender: {
                company: "Shoe Cart",
                address: "Shoe Cart Hub Kalamassery",
                city: "Kochi",
                country: "India",
            },
            client: {
                company: "Customer Address",
                "zip": order.pincode,
                "city": order.area,
                "address": order.name,
                // "custom1": "custom value 1",
                // "custom2": "custom value 2",
                // "custom3": "custom value 3"
            },
            information: {
                // Invoice number
                number: "order:" + order._id,
                // ordered date
                date: formattedDate,
            },
            products: products,
            "bottom-notice": "Happy shoping and visit shoe cart again",
        };

        const pdfResult = await easyinvoice.createInvoice(data);
        const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");

        // Set HTTP headers for the PDF response
        res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
        res.setHeader("Content-Type", "application/pdf");

        // Create a readable stream from the PDF buffer and pipe it to the response
        const pdfStream = new Readable();
        pdfStream.push(pdfBuffer);
        pdfStream.push(null);

        pdfStream.pipe(res);
    } catch (err) {
        next(err)
        //   res.status(500).json({ error: error.message });
    }
};























module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    sendVerifyMail,
    generateOtp,
    validateOtp,
    loadHome,
    categories,
    products,
    productDetail,
    cart,
    checkOut,
    confirmation,
    userProfile,
    logOut,
    profile,
    addressForm,
    confirmAddress,
    total,
    removeAddres,
    verifyRazorpayPayment,
    orderSuccess,
    addcoupon,
    addcouponpost,
    ShowOrders,
    orderDetails,
    changeStatus,
    addToWallet,
    walletTrans,
    couponlist,
    checkCoupon,
    subCategory,
    searchProd,
    editAddress,
    confirmEdit,
    downloadInvoice,
    resendOTP,
    priceFilter





}