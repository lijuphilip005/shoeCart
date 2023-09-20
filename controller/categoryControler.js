const { Rembg } = require('rembg-node');
const rembg = new Rembg();
//const sharp = require('sharp');
const categoryModel = require('../model/category-model')








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
      // console.log(req.file);
      // const input = (req.file.path);
      // const output = await rembg.remove(input);
      // await output.webp().toFile('./public/upload/category/'+req.file.filename);



      //  res.redirect('/admin/categories'); // Correct the redirect URL

    } catch (err) {
      req.session.categoryError = true

      res.redirect('/admin/category');

    }
  },




  delete: (req, res, next) => {
    try {

      categoryModel.findByIdAndDelete(req.params.id).then((status) => {
        res.redirect('/admin/category')
      })
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
















