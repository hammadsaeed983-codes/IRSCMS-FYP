import test from "node:test";
import assert from "node:assert/strict";
import { escapeRegex, validateProductInput, validateStockChange } from "./validation.js";

test("accepts a valid new product", () => {
  assert.equal(validateProductInput({
    name: "Rice", sku: "RICE-01", quantity: 10, minStock: 2, price: 250
  }), null);
});

test("rejects missing required product fields", () => {
  assert.match(validateProductInput({ name: "Rice" }), /name and SKU are required/i);
});

test("rejects negative and fractional stock quantities", () => {
  assert.match(validateProductInput({ name: "Rice", sku: "R1", quantity: -1 }), /quantity/i);
  assert.match(validateProductInput({ name: "Rice", sku: "R1", quantity: 1.5 }), /quantity/i);
});

test("rejects negative prices", () => {
  assert.match(validateProductInput({ name: "Rice", sku: "R1", price: -5 }), /price/i);
});

test("allows a valid partial product update", () => {
  assert.equal(validateProductInput({ name: "Premium Rice" }, { partial: true }), null);
});

test("rejects zero or fractional stock adjustments", () => {
  assert.match(validateStockChange({ change: 0 }), /non-zero whole number/i);
  assert.match(validateStockChange({ change: 1.5 }), /non-zero whole number/i);
});

test("accepts positive and negative whole stock adjustments", () => {
  assert.equal(validateStockChange({ change: 4 }), null);
  assert.equal(validateStockChange({ change: -2 }), null);
});

test("escapes regular-expression special characters", () => {
  assert.equal(escapeRegex("A+B"), "A\\+B");
});
