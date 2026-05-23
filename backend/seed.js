import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import foodModel from "./models/foodModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOADS_DIR   = path.join(__dirname, "uploads");
const FRONTEND_ASSETS = path.join(__dirname, "../frontend/src/assets");

// ── All 32 food items ────────────────────────────────────────────────────────
const foodData = [
  { name: "Greek salad",        image: "food_1.png",  price: 12, category: "Salad",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Veg salad",          image: "food_2.png",  price: 18, category: "Salad",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Clover Salad",       image: "food_3.png",  price: 16, category: "Salad",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Chicken Salad",      image: "food_4.png",  price: 24, category: "Salad",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Lasagna Rolls",      image: "food_5.png",  price: 14, category: "Rolls",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Peri Peri Rolls",    image: "food_6.png",  price: 12, category: "Rolls",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Chicken Rolls",      image: "food_7.png",  price: 20, category: "Rolls",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Veg Rolls",          image: "food_8.png",  price: 15, category: "Rolls",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Ripple Ice Cream",   image: "food_9.png",  price: 14, category: "Deserts",  description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Fruit Ice Cream",    image: "food_10.png", price: 22, category: "Deserts",  description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Jar Ice Cream",      image: "food_11.png", price: 10, category: "Deserts",  description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Vanilla Ice Cream",  image: "food_12.png", price: 12, category: "Deserts",  description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Chicken Sandwich",   image: "food_13.png", price: 12, category: "Sandwich", description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Vegan Sandwich",     image: "food_14.png", price: 18, category: "Sandwich", description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Grilled Sandwich",   image: "food_15.png", price: 16, category: "Sandwich", description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Bread Sandwich",     image: "food_16.png", price: 24, category: "Sandwich", description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Cup Cake",           image: "food_17.png", price: 14, category: "Cake",     description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Vegan Cake",         image: "food_18.png", price: 12, category: "Cake",     description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Butterscotch Cake",  image: "food_19.png", price: 20, category: "Cake",     description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Sliced Cake",        image: "food_20.png", price: 15, category: "Cake",     description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Garlic Mushroom",    image: "food_21.png", price: 14, category: "Pure Veg", description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Fried Cauliflower",  image: "food_22.png", price: 22, category: "Pure Veg", description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Mix Veg Pulao",      image: "food_23.png", price: 10, category: "Pure Veg", description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Rice Zucchini",      image: "food_24.png", price: 12, category: "Pure Veg", description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Cheese Pasta",       image: "food_25.png", price: 12, category: "Pasta",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Tomato Pasta",       image: "food_26.png", price: 18, category: "Pasta",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Creamy Pasta",       image: "food_27.png", price: 16, category: "Pasta",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Chicken Pasta",      image: "food_28.png", price: 24, category: "Pasta",    description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Butter Noodles",     image: "food_29.png", price: 14, category: "Noodles",  description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Veg Noodles",        image: "food_30.png", price: 12, category: "Noodles",  description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Somen Noodles",      image: "food_31.png", price: 20, category: "Noodles",  description: "Food provides essential nutrients for overall health and well-being" },
  { name: "Cooked Noodles",     image: "food_32.png", price: 15, category: "Noodles",  description: "Food provides essential nutrients for overall health and well-being" },
];

// ── Copy image file to uploads/ ──────────────────────────────────────────────
const copyImage = (filename) => {
  const src  = path.join(FRONTEND_ASSETS, filename);
  const dest = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`  Copied → ${filename}`);
  }
};

// ── Main seed function ───────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected\n");

    let inserted = 0;
    let skipped  = 0;

    for (const item of foodData) {
      // Copy image to uploads/
      copyImage(item.image);

      // Skip if a food with the same name already exists
      const exists = await foodModel.findOne({ name: item.name });
      if (exists) {
        console.log(`  Skipped (already exists) → ${item.name}`);
        skipped++;
        continue;
      }

      await foodModel.create(item);
      console.log(`  Inserted → ${item.name}`);
      inserted++;
    }

    console.log(`\nDone! Inserted: ${inserted} | Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
