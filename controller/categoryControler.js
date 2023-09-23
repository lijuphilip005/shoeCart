const { Rembg } = require('rembg-node');
const rembg = new Rembg();
//const sharp = require('sharp');
const categoryModel = require('../model/category-model');
const productModel = require('../model/product-model');








module.exports = {
 


  category: async (req, res, next) => {
    try {
      const data = await categoryModel
        .find({})
        .sort({ createdAt: -1 })
        .lean();
      console.log(data, "dataaaaa");

      const itemsperpage = 2;
      const currentpage = parseInt(req.query.page) || 1;
      const startindex = (currentpage - 1) * itemsperpage;
      const endindex = startindex + itemsperpage;
      const totalpages = Math.ceil(data.length / 2);
      const currentproduct = data.slice(startindex, endindex);
      res.render("page-categories", { data: currentproduct, err: req.session.catExist, totalpages, currentpage });
      req.session.catExist = false

    } catch (err) {
      next(err);

    }
  },


  addCategory: async (req, res, next) => {
    try {
      // console.log(req.body,"vd");
      const cat = req.body;

      const existingCategory = await categoryModel.findOne({ category: req.body.category }).lean();
      if (existingCategory) {
        const data = await categoryModel
          .find({})
          .sort({ createdOn: -1 })
          .lean();
        console.log(data, "dataaaaa");
        res.render("page-categories", { data, err: " Category Already Exist" });
      } else {
        const category = new categoryModel({
          category: cat.category,
          base_price: cat.basePrice,
          description: cat.description,
          image: req.file.filename,

        });

        const savedCategory = await category.save();
        console.log(savedCategory);

        res.redirect('/admin/category');


      }
     

    } catch (err) {
      req.session.categoryError = true

      res.redirect('/admin/category');

    }
  },




  delete:async (req, res, next) => {

    try {
      const id=req.query.id
      const catogary=await categoryModel.findById(id)
      console.log("catogary>>>>" ,catogary);
    

      const a= await productModel.deleteMany({category:catogary.category})

    
       
      //  const a= await productModel.updateMany({ category:catogary._id  }, { $unset: { category: 1 } });;
       console.log(a,"prodddddddddducts");
        const delet=await categoryModel.findByIdAndDelete(id)
      
      
    

        res.json({status:true})  

      
    } catch (err) {
      next(err)
    }
  },


  categorySearch: async (req, res, next) => {
    try {
      console.log(req.body.search, "loggg");
      let data = await categoryModel.find({
        category: { $regex: `${req.body.search}`, $options: 'i' }
      });
      console.log(data);
      res.render('page-categories', { data })
    } catch (err) {
      next(err)
    }
  },




}
















