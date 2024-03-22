const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default:1
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
