import orderModel from "../models/orderModel.js";
import userModel  from "../models/userModel.js";

// ── POST /api/order/place ─────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod = "COD" } = req.body;

    if (!items?.length || !amount || !address) {
      return res.status(400).json({ success: false, message: "Missing order details" });
    }

    const order = new orderModel({
      userId:        req.userId,
      items,
      amount,
      address,
      paymentMethod,
      payment:       false,
      status:        "Pending",
    });
    await order.save();

    // COD: clear cart immediately
    if (paymentMethod === "COD") {
      await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
    }

    res.json({ success: true, message: "Order created", orderId: order._id });
  } catch (error) {
    console.error("placeOrder error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/order/confirm (called after 3DS COMPLETE) ──────────────────
const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { payment: true, status: "Processing", paidAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

    res.json({ success: true, message: "Payment confirmed", orderId: order._id });
  } catch (error) {
    console.error("confirmPayment error:", error);
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

// ── POST /api/order/cancel ───────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "orderId is required" });

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { payment: false, status: "cancelled", cancelledAt: new Date() },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Payment cancelled successfully" });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { placeOrder, confirmPayment, verifyOrder, userOrders, allOrders, updateStatus, cancelOrder };
