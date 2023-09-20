const user = require("../model/userModel");
const bcrypt = require("bcrypt");
const categoryModel = require("../model/category-model")
const productModel = require("../model/product-model")
const orderModel = require("../model/order-model")
const couponModel = require("../model/coupon")
const mongodb = require('mongodb')
const moment = require("moment")
















const loadLogin = async (req, res, next) => {
    try {
        res.render("adminLogin");
    } catch (err) {
        next(err)

    }
};

const verifyLogin = async (req, res, next) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const userData = await user.findOne({ email: email, is_admin: 1 });
        console.log(userData)
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);


            if (passwordMatch) {

                if (userData.is_admin == 0) {

                    res.render("adminLogin", { message: "email and password is incorrect" });
                } else {
                    req.session.user_id = userData._id;
                    res.redirect("/admin/adminHome");
                }


            } else {
                res.render("adminLogin", { message: "email and password is incorrect" });

            }


        } else {
            res.render("adminLogin", { message: "email and password is incorrect" });
        }

    } catch (err) {
        next(err)
    }
};
const loadDashboard = async (req, res, next) => {
    try {
        const userData = await user.findById({ _id: req.session.user_id });
        const users = await user.find({ is_admin: 0 });
        res.render('adminHome'); // Updated argument names

    } catch (err) {
        next(err)
    }
};


const logout = async (req, res, next) => {
    try {
        req.session.destroy();
        res.redirect("/adminLogin");
    } catch (error) {
        next(err)

    }
};



const productList = async (req, res, next) => {
    try {
        res.render("page-products-list")

    } catch (error) {
        next(err)
    }

};

const productGrid1 = async (req, res, next) => {
    try {
        res.render("page-products-grid")

    } catch (err) {
        next(err)
    }
};

const productGrid2 = async (req, res, next) => {
    try {
        res.render("page-products-grid-2");
    } catch (err) {
        next(err)
    }
};
// const categories=async(req,res,next)=>{
//     try{
//         categoryModel.find({}).then((data)=>{
//         res.render("page-categories" , {data})

//         })

//     }catch(err){
//         next(err)
//     }
// };
const order1 = async (req, res, next) => {
    try {
        res.render("page-orders-1")
    } catch (err) {
        next(err)
    }
}
const pageProductList = async (req, res, next) => {
    try {
        res.render("page-form-product-1")
    } catch (err) {
        next(err)
    }
};


const blockUser = async (req, res, next) => {
    try {
        id = req.query.id
        await user.findByIdAndUpdate(id, { isVerified: 1 })
        res.redirect('/admin/usersList')

    } catch (err) {
        next(err)
    }


};
const unblockUser = async (req, res, next) => {
    try {
        console.log('heloo');
        id = req.query.id
        await user.findByIdAndUpdate(id, { isVerified: 0 })
        res.redirect('/admin/usersList')

    } catch (err) {
        next(err)
    }

};

const userslist = async (req, res, next) => {
    try {
        await user.find({ is_admin: 0 }).lean()
        .then((data)=>{
            data.reverse()
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(data.length / 3);
        const currentproduct = data.slice(startindex, endindex);

        res.render("page-sellers-list", { users:currentproduct ,totalpages,currentpage })

        })



    } catch (err) {
        next(err)
    }
}

const dashBoard = async (req, res, next) => {
    try {
        res.redirect("/admin/index.ejs")

    } catch (err) {
        next(err)
    }
}

const catgories = async (req, res, next) => {
    try {
        res.render("page-categories");
    } catch (err) {
        next(err)
    }
};

const editProductPage = async (req, res, next) => {
    try {
        const productId = req.params.id;
        console.log(productId)
        productModel.find({ _id: productId }).then((data) => {
            console.log(data);
            res.render("edit-product", { data: data })
        })

    } catch (err) {
        next(err)
    }
};

const editProduct = async (req, res, next) => {
    try {
        console.log(req.files);
        console.log(req.body)

        var id = req.params.id;
        console.log(id)
        var size = req.body.size;
        console.log(req.files);
        if (req.files.length !== 0) {
            console.log(';hehehehehhe');
            await productModel.findByIdAndUpdate(
                id,
                {
                    name: req.body.name,
                    description: req.body.description,
                    regularprice: req.body.regularprice,
                    saleprice: req.body.saleprice,
                    quantity: req.body.quantity,
                    gst: req.body.gst,
                    size: size,
                    category: req.body.category,
                    images: [
                        req.files[0].filename,
                        req.files[1].filename,
                        req.files[2].filename,
                        req.files[3].filename,
                    ],
                },
                { new: true }
            );
            res.redirect("/admin/all-products");
        } else {
            console.log("heloooooooooooo");
            console.log(req.body.sale_price);
            console.log(id);
            let user = await productModel.findById(id)
            console.log(user);
            let product = await productModel.findByIdAndUpdate(
                id,
                {
                    name: req.body.name,
                    description: req.body.description,
                    regular_price: req.body.regular_price,
                    sale_price: req.body.sale_price,
                    units: req.body.unit,
                    taxrate: req.body.taxrate,
                    quantity: req.body.quantity,
                    size: size,
                    category: req.body.category,
                },
                { new: true }
            );
            res.redirect("/admin/all-products")
        }
    } catch (err) {
        next(err)
    }
}


// const orderList=async(req,res,next)=>{
//     try{

//         orderModel.find({}).then((data)=>{

//             res.render("orders-list",{data})
//         })

//     }catch(err){
//         next(err)
//     }
// };


const ShowOrders = async (req, res, next) => {
    try {
        let doc = await orderModel.aggregate([
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: null, total: {
                        $sum: 1
                    }
                }
            }
        ])
        const itemsperpage = 7;
        const count = doc[0].total

        const page = req.query.page || 1

        let orders = await orderModel.aggregate([

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
            },
            { $sort: { createdAt: -1 } },
            { $skip: itemsperpage * (page - 1) },
            { $limit: itemsperpage }



        ])



        const totalPages = Math.ceil(count / itemsperpage)
        res.render('orders-list', { orders, totalPages, page })


    } catch (err) {
        next(err)
        res.send("Error")
    }
};



const salesReport = (req, res) => {
    console.log(req.query.day);
    if (req.query.day) {
        res.redirect(`/admin/${req.query.day}`);
    } else {
        res.redirect(`/admin/salesToday`);
    }
};






const salesToday = async (req, res) => {
    let todaysales = new Date();
    const startOfDay = new Date(
      todaysales.getFullYear(),
      todaysales.getMonth(),
      todaysales.getDate(),
      0,
      0,
      0,
      0
    );
    const endOfDay = new Date(
      todaysales.getFullYear(),
      todaysales.getMonth(),
      todaysales.getDate(),
      23,
      59,
      59,
      999
    );
    
    try {
        const orders = await orderModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfDay,
                            $lt: endOfDay,
                        },
                        orderStatus: 'Delivered'
                    },
                },
            ])
            .sort({ createdAt: -1 });
        // const productIds = orders.map((order) => order.product.productId);
        // const products = await product.find({
        //   _id: { $in: productIds },
        // });
        console.log(orders);
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 3);
        const currentproduct = orders.slice(startindex, endindex);
        res.render("salesReport", {
            order: currentproduct,
            currentpage,
            totalpages,
            //product: products,
            salesToday: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const salesWeekly = async (req, res) => {
    const currentDate = new Date();
  
          const startOfWeek = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate() - currentDate.getDay()
          );
          const endOfWeek = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate() + (6 - currentDate.getDay()),
              23,
              59,
              59,
              999
          );



    console.log(currentDate < endOfWeek);
    console.log(endOfWeek);
    const orders = await orderModel.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfWeek,
                    $lt: endOfWeek,
                },
                orderStatus: 'Delivered'
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);
    const itemsperpage = 3;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(orders.length / 3);
    const currentproduct = orders.slice(startindex, endindex);
    res.render("salesReport", { order: currentproduct, salesWeekly: true, totalpages, currentpage });
};



const salesMonthly = async (req, res) => {
    const thisMonth = new Date().getMonth() + 1;
    const startofMonth = new Date(
        new Date().getFullYear(),
        thisMonth - 1,
        1,
        0,
        0,
        0,
        0
    );
    const endofMonth = new Date(
        new Date().getFullYear(),
        thisMonth,
        0,
        23,
        59,
        59,
        999
    );

    try {
        const orders = await orderModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startofMonth,
                            $lt: endofMonth,
                        },
                        orderStatus: 'Delivered'
                    },
                },
            ])
            .sort({ createdAt: -1 });
        // const productIds = orders.map((order) => order.product.productId);
        // const products = await product.find({
        //   _id: { $in: productIds },
        // });
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 3);
        const currentproduct = orders.slice(startindex, endindex);
        res.render("salesReport", {
            order: currentproduct,
            totalpages,
            currentpage,
            salesMonthly: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const salesYearly = async (req, res) => {
    const today = new Date().getFullYear();
    const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
    const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);

    try {
        const orders = await orderModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startofYear,
                            $lt: endofYear,
                        },
                        orderStatus: 'Delivered'
                    },
                },
            ])
            .sort({ createdAt: -1 });
        console.log(orders, "ods");
        // const products = await product.find({
        //   _id: { $in: productIds },
        // });
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(orders.length / 3);
        const currentproduct = orders.slice(startindex, endindex);
        res.render("salesReport", {
            order: currentproduct,
            totalpages,
            currentpage,
            // product: products,
            salesYearly: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};







const orderDetail = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await orderModel.findById(orderId).lean().populate('items.product', 'name price'); // Assuming 'items.product' is the reference to the 'Product' model
        console.log('this is poducts ', order.items);
        const productName = order.items[0].product.name;
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', productName);


        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.render('page-orders-detail', {
            data: order,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};






const couponlist = async (req, res, next) => {
    try {
        const ITEMS_PER_PAGE = 3
        const page = parseInt(req.query.page) || 1
        const skipItems = (page - 1) * ITEMS_PER_PAGE
        const totalCount = await orderModel.countDocuments()
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
        const coupon = await couponModel.find().skip(skipItems)
            .limit(ITEMS_PER_PAGE)
        console.log(coupon)
        res.render("couponlist", { coupon, currentPage: page, totalPages: totalPages });
    } catch (err) {
        next(err);
    }
};

const addcoupon = async (req, res, next) => {

    console.log(req.body);
    try {
        couponModel.find({}).then((data) => {
            data.reverse()
            const itemsperpage = 3;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(data.length / 3);
            const currentproduct = data.slice(startindex, endindex);
            res.render("addcoupon", { data:currentproduct ,totalpages,currentpage});
        })

    } catch (err) {
        next(err);
    }
};

const addcouponpost = async (req, res, next) => {
    console.log("kkkkkkkkkkkkkkkkkkkkkkkkkk");
    try {
        console.log(req.body);
        let coupon = req.body;
        await couponModel.create(coupon);
        res.redirect("back");
    } catch (err) {
        next(err);
    }
};




const editcoupon = async (req, res, next) => {
    try {
        const couponId = req.query._id;
        const coupon = await couponModel.findById(couponId)
        res.render("/editcoupon", { coupon });
    } catch (err) {
        next(err)
    }
};

const editcouponpost = async (req, res, next) => {
    try {
        const couponId = req.body.id;
        const updatedCoupon = await couponModel.findById(couponId);
        updatedCoupon.code = req.body.code;
        updatedCoupon.description = req.body.description;
        updatedCoupon.discountType = req.body.discountType;
        updatedCoupon.discountAmount = req.body.discountAmount;
        updatedCoupon.minimumAmount = req.body.minimumAmount;
        updatedCoupon.expirationDate = req.body.expirationDate;
        updatedCoupon.maxRedemptions = req.body.maxRedemptions;

        await updatedCoupon.save();
        res.redirect("/couponlist");
    } catch (err) {
        next(err)
    }
};

const changeStatus = (req, res, next) => {
    try {
        orderModel.findByIdAndUpdate(req.body.orderId, { orderStatus: req.body.status }).then((status) => {
            console.log(status);
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



const monthlyreport = async (req, res) => {
    try {
        const start = moment().subtract(30, 'days').startOf('day'); // Data for the last 30 days
        const end = moment().endOf('day');

        const orderSuccessDetails = await orderModel.find({
            createdAt: { $gte: start, $lte: end },
            orderStatus: 'Delivered'
        });
        console.log(orderSuccessDetails, "sucesssssssss")
        const monthlySales = {};

        orderSuccessDetails.forEach(order => {
            const monthName = moment(order.order_date).format('MMMM');
            if (!monthlySales[monthName]) {
                monthlySales[monthName] = {
                    revenue: 0,
                    productCount: 0,
                    orderCount: 0,
                    codCount: 0,
                    razorpayCount: 0,
                };
            }
            console.log("ORder: ", order)
            monthlySales[monthName].revenue += order.finalAmount;
            monthlySales[monthName].productCount += order.items.length;
            monthlySales[monthName].orderCount++;

            if (order.payment === 'cod') {
                monthlySales[monthName].codCount++;
            } else if (order.payment === 'Razorpay') {
                monthlySales[monthName].razorpayCount++;
            }
        });

        const monthlyData = {
            labels: [],
            revenueData: [],
            productCountData: [],
            orderCountData: [],
            codCountData: [],
            razorpayCountData: [],
        };

        for (const monthName in monthlySales) {
            if (monthlySales.hasOwnProperty(monthName)) {
                monthlyData.labels.push(monthName);
                monthlyData.revenueData.push(monthlySales[monthName].revenue);
                monthlyData.productCountData.push(monthlySales[monthName].productCount);
                monthlyData.orderCountData.push(monthlySales[monthName].orderCount);
                monthlyData.codCountData.push(monthlySales[monthName].codCount);
                monthlyData.razorpayCountData.push(monthlySales[monthName].razorpayCount);
            }
        }
        console.log(monthlyData);
        return res.json(monthlyData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while generating the monthly report.' });
    }
};












module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    productList,
    productGrid1,
    productGrid2,
    order1,
    pageProductList,
    blockUser,
    unblockUser,
    userslist,
    dashBoard,
    catgories,
    editProductPage,
    editProduct,
    ShowOrders,
    orderDetail,
    couponlist,
    addcoupon,
    addcouponpost,
    editcoupon,
    editcouponpost,
    changeStatus,
    salesYearly,
    salesMonthly,
    salesWeekly,
    salesReport,
    salesToday,
    monthlyreport,



}