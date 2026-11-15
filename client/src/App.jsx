import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api/products";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  quantity: 0,
  minStock: 5,
  price: 0
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    const response = await fetch(`${API}?search=${search}`);
    const data = await response.json();
    setProducts(data);
  }

  useEffect(() => {
    loadProducts();
  }, [search]);

  const lowStockCount = useMemo(
    () => products.filter((product) => product.quantity <= product.minStock).length,
    [products]
  );

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

 async function saveProduct(event) {
  event.preventDefault();

  const url = editingId ? `${API}/${editingId}` : API;
  const method = editingId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Could not save product.");
    }

    setMessage(editingId ? "Product updated successfully." : "Product added successfully.");
    setForm(emptyForm);
    setEditingId(null);

    await loadProducts();
  } catch (error) {
    setMessage(error.message || "Something went wrong.");
  }


    if (response.ok) {
      setMessage(editingId ? "Product updated." : "Product added.");
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } else {
      setMessage("Could not save product.");
    }
  }

  function editProduct(product) {
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.quantity,
      minStock: product.minStock,
      price: product.price
    });
    setEditingId(product._id);
  }

  async function deleteProduct(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setMessage("Product deleted.");
    loadProducts();
  }

  async function changeStock(id, change) {
    await fetch(`${API}/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ change })
    });
    loadProducts();
  }

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <p className="eyebrow">INTELLIGENT RETAIL SUPPLY CHAIN SYSTEM</p>
          <h1>Inventory Management</h1>
          <p className="subheading">A simple view of your store's products and stock.</p>
        </div>
        <div className="summary">
          <span>Products</span>
          <strong>{products.length}</strong>
          <small>{lowStockCount} low-stock items</small>
        </div>
      </header>

      {message && <div className="message">{message}</div>}

      <section className="panel">
        <h2>{editingId ? "Edit product" : "Add a product"}</h2>
        <form className="product-form" onSubmit={saveProduct}>
          <label>
            Product name
            <input name="name" value={form.name} onChange={updateForm} required />
          </label>
          <label>
            SKU / Barcode
            <input name="sku" value={form.sku} onChange={updateForm} required />
          </label>
          <label>
            Category
            <input name="category" value={form.category} onChange={updateForm} />
          </label>
          <label>
            Quantity
            <input name="quantity" type="number" value={form.quantity} onChange={updateForm} />
          </label>
          <label>
            Minimum stock
            <input name="minStock" type="number" value={form.minStock} onChange={updateForm} />
          </label>
          <label>
            Unit price
            <input name="price" type="number" value={form.price} onChange={updateForm} />
          </label>
          <div className="form-actions">
            <button type="submit">{editingId ? "Save changes" : "Add product"}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}>Cancel</button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Products</h2>
            <p className="muted">Search and update stock quantities.</p>
          </div>
          <input
            className="search"
            placeholder="Search product name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit price</th>
                <th>Stock actions</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.sku}</td>
                  <td>{product.category || "General"}</td>
                  <td>
                    <span className={product.quantity <= product.minStock ? "low" : "quantity"}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>Rs. {product.price}</td>
                  <td>
                    <div className="actions">
                      <button className="small secondary" onClick={() => changeStock(product._id, 1)}>+ In</button>
                      <button className="small secondary" onClick={() => changeStock(product._id, -1)}>- Out</button>
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="small secondary" onClick={() => editProduct(product)}>Edit</button>
                      <button className="small danger" onClick={() => deleteProduct(product._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="7" className="empty">No products found. Add your first product above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <footer>Inventory Management Module · Version 1.0 baseline</footer>
    </main>
  );
}

