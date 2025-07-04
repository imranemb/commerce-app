const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
});


const SaleSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
    },
  ],
  total: Number,
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'cancelled'],
    default: 'pending',
  },
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
  },
});

const TicketSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
    },
  ],
  total: Number,
  date: { type: Date, default: Date.now },
});



const DeliverySchema = new mongoose.Schema({
  sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  status: { type: String, enum: ['pending', 'in_transit', 'delivered'], default: 'pending' },
  date: { type: Date, default: Date.now },
});

const PredictionSchema = new mongoose.Schema({
  date: Date,
  expectedSales: Number,
});

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Product: mongoose.model('Product', ProductSchema),
  Sale: mongoose.model('Sale', SaleSchema),
  Delivery: mongoose.model('Delivery', DeliverySchema),
  Prediction: mongoose.model('Prediction', PredictionSchema),
  Ticket: mongoose.model('Ticket', TicketSchema),
  Image: mongoose.model('Image', ImageSchema),
};
