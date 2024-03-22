const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },    
    isDeleted:{
        type:Boolean,
        default:false
    },
    totalAmount: { type: Number, default: 0 },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
