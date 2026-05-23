import express from "express";
import {
  placeOrder,
  confirmPayment,
  verifyOrder,
  userOrders,
  allOrders,
  updateStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place",      authMiddleware, placeOrder);
orderRouter.post("/confirm",    authMiddleware, confirmPayment);
orderRouter.post("/verify",     verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list",        allOrders);
orderRouter.post("/status",     updateStatus);
orderRouter.post("/cancel",     authMiddleware, cancelOrder);

export default orderRouter;
