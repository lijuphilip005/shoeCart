const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
   },

   password: {
      type: String,
      required: true,
   },
   repeatPassword: {
      type: String,
      required: true,
   },
  
   is_admin: {
      type: Number,
      required: true,

   },

   otp: {
      type: String,
      default: 0,

   },
   token: {
      type: String,
      default: ""

   },
   cart: {
      type: Array

   },
   isVerified: {
      type: Number,
      default: 0
   },
   address:
      [{
         name: { type: String },
         number: { type: String },
         altNumber: { type: String },
         pinCode: { type: String },
         house: { type: String },
         area: { type: String },
         landmark: { type: String },
         town: { type: String },
         state: { type: String },


      }],


   total: {
      type: String
   },

   wallet: [{
      amount: {
         type: Number
      },
       timestamp: {
         type: Date,
         default: Date.now

      }, paymentType: {
         type: String

      }


   }],


   referal: {
      type: String
   }

})


module.exports = mongoose.model("user", userSchema);