import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api/products";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  quantity: "0",
  minStock: "5",
  price: "0"
};

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [stockAmounts, setStockAmounts] = useState({});
  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    try {
      const response = await fetch(`${API}?search=${encodeURIComponent(search)}`);
      const data = await readResponse(response);
      setProducts(data);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load products. Check that the server is running.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, [search]);

  const lowStockCount = useMemo(
    () => products.filter((product) => product.quantity <= product.minStock).length,
    [products]
  );
  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + product.quantity, 0),
    [products]
  );

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function saveProduct(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const url = editingId ? `${API}/${editingId}` : API;
    const method = editingId ? "PUT" : "POST";
    const payload = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category.trim(),
      quantity: Number(form.quantity),
      minStock: Number(form.minStock),
      price: Number(form.price)
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await readResponse(response);
      setMessage(editingId ? "Product updated successfully." : "Product added successfully.");
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message || "Could not save product.");
    } finally {
      setLoading(false);
    }
  }

  function editProduct(product) {
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category || "",
      quantity: String(product.quantity),
      minStock: String(product.minStock),
      price: String(product.price)
    });
    setEditingId(product._id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id, name) {
    const confirmed = window.confirm(`Delete "${name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      await readResponse(response);
      setMessage("Product deleted successfully.");
      if (editingId === id) resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message || "Could not delete product.");
    }
  }

  async function changeStock(id, change) {
    try {
      const response = await fetch(`${API}/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change })
      });
      await readResponse(response);
      setMessage("Stock quantity updated.");
      await loadProducts();
    } catch (err) {
      setError(err.message || "Could not update stock.");
    }
  }

  function adjustmentAmount(id) {
    const amount = Number(stockAmounts[id] ?? 1);
    return Number.isInteger(amount) && amount > 0 ? amount : null;
  }

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <p className="eyebrow">INTELLIGENT RETAIL SUPPLY CHAIN SYSTEM</p>
          <h1>Inventory Management</h1>
          <p className="subheading">A simple view of your store's products and stock.</p>
        </div>
        <div className="summary-grid">
          <div className="summary"><span>Products</span><strong>{products.length}</strong></div>
          <div className="summary"><span>Total available stock</span><strong>{totalStock}</strong></div>
          <div className="summary"><span>Low-stock items</span><strong>{lowStockCount}</strong></div>
        </div>
      </header>

      {message && <div className="message success" role="status">{message}</div>}
      {error && <div className="message error" role="alert">{error}</div>}

      <section className="panel">
        <h2>{editingId ? "Edit product" : "Add a product"}</h2>
        <form className="product-form" onSubmit={saveProduct}>
          <label>Product name
            <input name="name" value={form.name} onChange={updateForm} minLength="2" maxLength="100" required />
          </label>
          <label>SKU / Barcode
            <input name="sku" value={form.sku} onChange={updateForm} minLength="2" maxLength="40" required />
          </label>
          <label>Category
            <input name="category" value={form.category} onChange={updateForm} maxLength="60" />
          </label>
          <label>Quantity
            <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={updateForm} required />
          </label>
          <label>Minimum stock
            <input name="minStock" type="number" min="0" step="1" value={form.minStock} onChange={updateForm} required />
          </label>
          <label>Unit price
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateForm} required />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={loading}>{loading ? "Saving..." : editingId ? "Save changes" : "Add product"}</button>
            {editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div><h2>Products</h2><p className="muted">Search by product name or SKU and manage stock quantities.</p></div>
          <input className="search" placeholder="Search name or SKU..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Product</th><th>SKU</th><th>Category</th><th>Quantity</th><th>Unit price</th><th>Stock adjustment</th><th>Manage</th>
            </tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.sku}</td>
                  <td>{product.category || "General"}</td>
                  <td><span className={product.quantity <= product.minStock ? "low" : "quantity"}>{product.quantity}</span></td>
                  <td>Rs. {Number(product.price).toLocaleString()}</td>
                  <td>
                    <div className="stock-controls">
                      <input aria-label={`Stock adjustment amount for ${product.name}`} type="number" min="1" step="1"
                        value={stockAmounts[product._id] ?? "1"}
                        onChange={(event) => setStockAmounts((current) => ({ ...current, [product._id]: event.target.value }))} />
                      <button className="small secondary" onClick={() => {
                        const amount = adjustmentAmount(product._id);
                        if (amount) changeStock(product._id, amount);
                        else setError("Enter a positive whole-number stock adjustment.");
                      }}>+ In</button>
                      <button className="small secondary" onClick={() => {
                        const amount = adjustmentAmount(product._id);
                        if (amount) changeStock(product._id, -amount);
                        else setError("Enter a positive whole-number stock adjustment.");
                      }}>- Out</button>
                    </div>
                  </td>
                  <td><div className="actions">
                    <button className="small secondary" onClick={() => editProduct(product)}>Edit</button>
                    <button className="small danger" onClick={() => deleteProduct(product._id, product.name)}>Delete</button>
                  </div></td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan="7" className="empty">No products found. Add your first product above.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <footer>Inventory Management Module · Maintenance update</footer>
    </main>
  );
}
