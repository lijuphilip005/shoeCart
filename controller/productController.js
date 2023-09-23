const categoryModel = require('../model/category-model')
const productModel = require('../model/product-model')
const sharp = require('sharp')
const fs = require('fs')

module.exports = {
    allProduct: async (req, res, next) => {
        try {

            const data = await productModel
                .find({})
                .lean();
            data.reverse()
            const itemsperpage = 5;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(data.length / 5);
            const currentproduct = data.slice(startindex, endindex);
            res.render('view-products', { products: currentproduct, data, currentpage, totalpages })
        } catch (err) {
            next(err)
        }
    },




    showAddProduct: async (req, res, next) => {
        try {
            const findCategory = await categoryModel.find({})
            console.log(findCategory)
            res.render('add-product', { data: findCategory })
        } catch (err) {
            next(err)
        }
    },



    addProduct: async (req, res, next) => {
        try {
            console.log("AddProduct")
            console.log(req.body, "bogyyyyyyyy");
            let product = new productModel({
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                regular_price: req.body.regular_price,
                sale_price: req.body.sale_price,
                created_on: Date.now(),
                unit: req.body.units,
                gst: req.body.gst,
                quantity: req.body.quantity,
                images: [req.files[0]?.filename, req.files[1]?.filename, req.files[2]?.filename, req.files[3]?.filename,]
            })
            await product.save().then((statsu) => {
                res.redirect('/admin/page-products-list')
            })
        } catch (err) {
            next(err)
        }

    },
    deleteProduct: async (req, res, next) => {
        id = req.params.id
        console.log(id);
        await productModel.findByIdAndDelete({ _id: id })
            .then((data) => {
                res.redirect('/admin/all-products')
            }).catch((err) => {
                next(err)
            })
    }
}