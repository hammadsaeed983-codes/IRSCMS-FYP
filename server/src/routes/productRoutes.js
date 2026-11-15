import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { escapeRegex, validateProductInput, validateStockChange } from "../utils/validation.js";

const router = express.Router();

function sendError(res, error) {
  if (error?.code === 11000) {
    return res.status(409).json({ message: "A product with this SKU already exists." });
  }
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "An unexpected server error occurred." });
}

router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: escapeRegex(search), $options: "i" } },
            { sku: { $regex: escapeRegex(search), $options: "i" } }
          ]
        }
      : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", async (req, res) => {
  const validationError = validateProductInput(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const payload = {
      name: req.body.name.trim(),
      sku: req.body.sku.trim().toUpperCase(),
      category: req.body.category?.trim() || "General",
      quantity: Number(req.body.quantity ?? 0),
      minStock: Number(req.body.minStock ?? 5),
      price: Number(req.body.price ?? 0)
    };
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    sendError(res, error);
  }
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }
  const validationError = validateProductInput(req.body, { partial: true });
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const payload = { ...req.body };
    if (typeof payload.name === "string") payload.name = payload.name.trim();
    if (typeof payload.sku === "string") payload.sku = payload.sku.trim().toUpperCase();
    if (typeof payload.category === "string") payload.category = payload.category.trim() || "General";

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      context: "query"
    });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:id/stock", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }
  const validationError = validateStockChange(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const change = req.body.change;
    const filter = { _id: req.params.id };
    if (change < 0) filter.quantity = { $gte: Math.abs(change) };

    const product = await Product.findOneAndUpdate(
      filter,
      { $inc: { quantity: change } },
      { new: true, runValidators: true }
    );
    if (!product) {
      const exists = await Product.exists({ _id: req.params.id });
      if (!exists) return res.status(404).json({ message: "Product not found." });
      return res.status(400).json({ message: "Insufficient stock. Quantity cannot become negative." });
    }
    res.json(product);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
