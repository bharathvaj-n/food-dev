import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      name:        { type: String, required: true },
      description: { type: String, default: "" },
      price:       { type: Number, required: true },
      quantity:    { type: Number, required: true },
      image:       { type: String, default: "" },
      category:    { type: String, default: "" },
    },
  ],
  amount:        { type: Number, required: true },
  address: {
    firstName: String,
    lastName:  String,
    email:     String,
    street:    String,
    city:      String,
    state:     String,
    zip:       String,
    country:   String,
    phone:     String,
  },
  status:        { type: String, default: "Pending" },
  paymentMethod: { type: String, default: "COD" },
  payment:       { type: Boolean, default: false },
  paymentStatus: { type: Boolean, default: false },
  paidAt:        { type: Date, default: null },
  cancelledAt:   { type: Date, default: null },
  date:          { type: Date, default: Date.now },
}, { timestamps: true });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
