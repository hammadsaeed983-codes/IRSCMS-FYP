import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must contain at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
      minlength: [2, "SKU must contain at least 2 characters"],
      maxlength: [40, "SKU cannot exceed 40 characters"],
      unique: true
    },
    category: {
      type: String,
      trim: true,
      default: "General",
      maxlength: [60, "Category cannot exceed 60 characters"]
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock quantity must be a whole number"
      }
    },
    minStock: {
      type: Number,
      default: 5,
      min: [0, "Minimum stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Minimum stock must be a whole number"
      }
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"]
    }
  },
  { timestamps: true }
);


export default mongoose.model("Product", productSchema);
