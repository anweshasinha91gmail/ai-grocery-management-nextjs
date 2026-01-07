import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },         // e.g., Rice, Tomato
  quantity: { type: String, required: true },     // "2 kg", "5 pcs"
  units: {type: String, required: true},
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true },    // "Vegetables", "Grains"
  expiryDate: { type: Date, required: false },    // optional
  createdAt: { type: Date, default: Date.now },   // track when added
});

export default mongoose.models.Products ||
  mongoose.model("Products", ProductSchema);
