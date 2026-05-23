import userModel from "../models/userModel.js";

// POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ success: false, message: "itemId is required" });

    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const cartData = { ...user.cartData };
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(req.userId, { $set: { cartData } });
    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/cart/remove
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ success: false, message: "itemId is required" });

    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const cartData = { ...user.cartData };
    if (cartData[itemId] > 0) cartData[itemId] -= 1;

    await userModel.findByIdAndUpdate(req.userId, { $set: { cartData } });
    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/cart/get
const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, cartData: user.cartData || {} });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { addToCart, removeFromCart, getCart };
