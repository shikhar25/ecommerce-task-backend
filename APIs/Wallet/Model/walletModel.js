const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  ],
  isDeleted:{
    type:Boolean,
    default:false
  }
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
