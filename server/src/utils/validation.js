const allowedProductFields = new Set([
  "name", "sku", "category", "quantity", "minStock", "price"
]);

export function validateProductInput(input, { partial = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "Request body must be a JSON object.";
  }

  const keys = Object.keys(input);
  const unknown = keys.filter((key) => !allowedProductFields.has(key));
  if (unknown.length) return `Unknown field(s): ${unknown.join(", ")}`;

  if (!partial && (!("name" in input) || !("sku" in input))) {
    return "Product name and SKU are required.";
  }

  if ("name" in input) {
    if (typeof input.name !== "string" || input.name.trim().length < 2 || input.name.trim().length > 100) {
      return "Product name must be between 2 and 100 characters.";
    }
  }

  if ("sku" in input) {
    if (typeof input.sku !== "string" || input.sku.trim().length < 2 || input.sku.trim().length > 40) {
      return "SKU must be between 2 and 40 characters.";
    }
  }

  if ("category" in input &&
      (typeof input.category !== "string" || input.category.trim().length > 60)) {
    return "Category must be text and cannot exceed 60 characters.";
  }

  for (const field of ["quantity", "minStock"]) {
    if (field in input &&
        (!Number.isInteger(Number(input[field])) || Number(input[field]) < 0 || input[field] === "")) {
      return `${field} must be a non-negative whole number.`;
    }
  }

  if ("price" in input &&
      (!Number.isFinite(Number(input.price)) || Number(input.price) < 0 || input.price === "")) {
    return "Price must be a non-negative number.";
  }

  return null;
}

export function validateStockChange(input) {
  if (!input || typeof input !== "object") return "A stock adjustment is required.";
  const { change } = input;
  if (!Number.isInteger(change) || change === 0) {
    return "Stock adjustment must be a non-zero whole number.";
  }
  return null;
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
