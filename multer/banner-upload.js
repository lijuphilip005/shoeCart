
const multer=require("multer")


const bannerManagement =multer.diskStorage({
    destination:(req, file,cb)=>{
      return cb(null, "public/upload/banner")
    },
    filename:(req, file, cb)=>{
      cb(null, Date.now() + file.originalname)
    }
  })
  
  
const git ="hi"


  const banner = multer({ storage: bannerManagement})
  module.exports={
  banner
  }