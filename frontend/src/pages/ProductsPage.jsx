import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { createProduct, deleteProduct, getCategories, getProducts, updateProduct } from "../api/products";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import { Badge, Card, EmptyState, Modal, Pagination, Skeleton } from "../components/ui";
import { currency } from "../utils/format";
import { mockProducts } from "../utils/mockData";

const initialForm = { name: "", description: "", price: 0, stock: 0, category_id: "", is_active: true };

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, page_size: 8, total: 0, total_pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const { pushToast } = useToast();
  const { user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts({
          search: search || undefined,
          category_id: categoryFilter || undefined,
          page: meta.page,
          page_size: meta.page_size,
        }),
        getCategories(),
      ]);
      setProducts(Array.isArray(productsData?.items) ? productsData.items : []);
      setMeta(
        productsData?.meta ?? {
          page: 1,
          page_size: meta.page_size,
          total: 0,
          total_pages: 1,
        },
      );
      setCategories(categoriesData);
    } catch {
      const fallback = mockProducts;
      setProducts(fallback);
      setMeta({
        page: 1,
        page_size: meta.page_size,
        total: fallback.length,
        total_pages: 1,
      });
      setError("API unavailable. Showing fallback demo products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryFilter, meta.page]);

  const canManage = user?.role === "admin";

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      is_active: product.is_active,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (Number(form.price) <= 0) errors.price = "Price must be greater than 0";
    if (Number(form.stock) < 0) errors.stock = "Stock cannot be negative";
    if (!form.category_id) errors.category_id = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSave = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const payload = { ...form, category_id: Number(form.category_id), price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        pushToast("Product updated", "success");
      } else {
        await createProduct(payload);
        pushToast("Product created", "success");
      }
      setModalOpen(false);
      await loadData();
    } catch {
      pushToast("Unable to save product", "error");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      pushToast("Product deleted", "success");
      await loadData();
    } catch {
      pushToast("Unable to delete product", "error");
    }
  };

  const stockTone = useMemo(
    () => (stock) => {
      if (stock <= 10) return "danger";
      if (stock <= 30) return "warning";
      return "success";
    },
    [],
  );
  const lowStockCount = useMemo(() => products.filter((product) => product.stock <= 10).length, [products]);
  const inactiveCount = useMemo(
    () => products.filter((product) => !product.is_active).length,
    [products],
  );

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Visible products</p>
          <p className="mt-1 text-2xl font-semibold">{meta.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Low stock risk</p>
          <p className="mt-1 text-2xl font-semibold text-amber-200">{lowStockCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Inactive catalog items</p>
          <p className="mt-1 text-2xl font-semibold text-rose-200">{inactiveCount}</p>
        </Card>
      </section>
      <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Search products..."
            className="w-full bg-transparent py-2.5 text-sm outline-none"
            value={search}
            onChange={(event) => {
              setMeta((prev) => ({ ...prev, page: 1 }));
              setSearch(event.target.value);
            }}
          />
        </div>
        <select
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          value={categoryFilter}
          onChange={(event) => {
            setMeta((prev) => ({ ...prev, page: 1 }));
            setCategoryFilter(event.target.value);
          }}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {canManage && (
          <button className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium hover:bg-violet-400" onClick={openCreate}>
            <span className="inline-flex items-center gap-1">
              <Plus size={16} /> Add Product
            </span>
          </button>
        )}
      </Card>
      {error && (
        <Card className="border-amber-500/30 bg-amber-500/10 py-3">
          <p className="text-sm text-amber-200">{error}</p>
        </Card>
      )}

      {loading ? (
        <Skeleton className="h-80" />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting filters or create a new product." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-900/90 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-800 transition hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-100">{product.name}</p>
                    <p className="line-clamp-1 text-xs text-slate-400">{product.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{product.category.name}</td>
                  <td className="px-4 py-3 text-slate-200">{currency(product.price)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={stockTone(product.stock)}>{product.stock} in stock</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={product.is_active ? "success" : "danger"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{new Date(product.created_at).toLocaleDateString()}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button className="mr-2 rounded-lg px-3 py-1.5 text-xs hover:bg-slate-700" onClick={() => openEdit(product)}>
                        Edit
                      </button>
                      <button className="rounded-lg px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/20" onClick={() => onDelete(product.id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {!loading && meta.total > 0 && (
        <Card className="p-0">
          <Pagination
            page={meta.page}
            totalPages={meta.total_pages}
            total={meta.total}
            onPageChange={(nextPage) => setMeta((prev) => ({ ...prev, page: nextPage }))}
          />
        </Card>
      )}

      <Modal open={modalOpen} title={editing ? "Edit product" : "Create product"} onClose={() => setModalOpen(false)}>
        <form className="space-y-3" onSubmit={onSave}>
          <input
            required
            placeholder="Name"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          {formErrors.name && <p className="text-xs text-rose-300">{formErrors.name}</p>}
          <textarea
            placeholder="Description"
            className="h-20 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            />
          {formErrors.price && <p className="text-xs text-rose-300">{formErrors.price}</p>}
            <input
              required
              type="number"
              min="0"
              placeholder="Stock"
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={form.stock}
              onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
            />
          {formErrors.stock && <p className="text-xs text-rose-300">{formErrors.stock}</p>}
          </div>
          <select
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.category_id}
            onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {formErrors.category_id && <p className="text-xs text-rose-300">{formErrors.category_id}</p>}
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
            />
            Product is active
          </label>
          <button className="w-full rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium hover:bg-violet-400">
            {editing ? "Save changes" : "Create product"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
