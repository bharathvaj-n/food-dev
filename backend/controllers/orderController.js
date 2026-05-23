import orderModel from "../models/orderModel.js";
import userModel  from "../models/userModel.js";
import Stripe from "stripe";

// Stripe is initialized lazily inside placeOrder so a missing key
// never crashes the server on startup — COD orders always work.
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith("sk_test_your")) {
    throw new Error("Stripe secret key is not configured in .env");
  }
  return new Stripe(key);
};

const DELIVERY_FEE = 2;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── POST /api/order/place ─────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod = "COD" } = req.body;

    if (!items?.length || !amount || !address) {
      return res.status(400).json({ success: false, message: "Missing order details" });
    }

    const order = new orderModel({
      userId: req.userId,
      items,
      amount,
      address,
      paymentMethod,
      payment: false,
      status:  "Pending",
    });
    await order.save();

    if (paymentMethod === "Stripe") {
      let stripe;
      try {
        stripe = getStripe();
      } catch (e) {
        await orderModel.findByIdAndDelete(order._id);
        return res.status(500).json({ success: false, message: e.message });
      }

      const lineItems = items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery Fee" },
          unit_amount: DELIVERY_FEE * 100,
        },
        quantity: 1,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${FRONTEND_URL}/verify?success=true&orderId=${order._id}`,
        cancel_url:  `${FRONTEND_URL}/verify?success=false&orderId=${order._id}`,
      });

      return res.json({ success: true, session_url: session.url, orderId: order._id });
    }

    // Clear cart only after COD order is confirmed
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
    res.json({ success: true, message: "Order placed successfully", orderId: order._id });
  } catch (error) {
    console.error("placeOrder error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/order/verify (Stripe callback) ──────────────────────────────
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      const order = await orderModel.findByIdAndUpdate(orderId, { payment: true, status: "Processing" }, { new: true });
      if (order) await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
      res.json({ success: true, message: "Payment verified" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed, order cancelled" });
    }
  } catch (error) {
    console.error("verifyOrder error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/order/userorders ────────────────────────────────────────────
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("userOrders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── GET /api/order/list (admin) ───────────────────────────────────────────
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("allOrders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/order/status ────────────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("updateStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { placeOrder, verifyOrder, userOrders, allOrders, updateStatus };
