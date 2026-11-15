import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, default: "General" },
    quantity: { type: Number, default: 0 },
    minStock: { type: Number, default: 5 },
    price: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
