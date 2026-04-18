import { Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getOrders, updateOrderStatus } from "../api/orders";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import { Badge, Card, EmptyState, Modal, Pagination, Skeleton } from "../components/ui";
import { currency } from "../utils/format";
import { mockOrders } from "../utils/mockData";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

const toneMap = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, page_size: 8, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();
  const { pushToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getOrders({
          search: search || undefined,
          status: statusFilter || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          page: meta.page,
          page_size: meta.page_size,
        });
      setOrders(Array.isArray(response?.items) ? response.items : []);
      setMeta(
        response?.meta ?? {
          page: 1,
          page_size: meta.page_size,
          total: 0,
          total_pages: 1,
        },
      );
    } catch {
      const fallback = mockOrders;
      setOrders(fallback);
      setMeta({
        page: 1,
        page_size: meta.page_size,
        total: fallback.length,
        total_pages: 1,
      });
      setError("API unavailable. Showing fallback demo orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, startDate, endDate, meta.page]);

  const canManage = user?.role === "admin";

  const onUpdateStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      pushToast("Order status updated", "success");
      loadOrders();
    } catch {
      pushToast("Unable to update order", "error");
    }
  };

  const orderCountText = useMemo(() => `${meta.total} order${meta.total === 1 ? "" : "s"}`, [meta.total]);
  const grossRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0),
    [orders],
  );
  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === "delivered").length,
    [orders],
  );

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Orders in view</p>
          <p className="mt-1 text-2xl font-semibold">{meta.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Gross volume (page)</p>
          <p className="mt-1 text-2xl font-semibold">{currency(grossRevenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Delivered (page)</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-200">{deliveredCount}</p>
        </Card>
      </section>
      <Card className="grid gap-3 md:grid-cols-5">
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Search order number..."
            value={search}
            onChange={(event) => {
              setMeta((prev) => ({ ...prev, page: 1 }));
              setSearch(event.target.value);
            }}
            className="w-full bg-transparent py-2 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setMeta((prev) => ({ ...prev, page: 1 }));
            setStatusFilter(event.target.value);
          }}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(event) => {
            setMeta((prev) => ({ ...prev, page: 1 }));
            setStartDate(event.target.value);
          }}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(event) => {
            setMeta((prev) => ({ ...prev, page: 1 }));
            setEndDate(event.target.value);
          }}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">{orderCountText}</div>
      </Card>
      {error && (
        <Card className="border-amber-500/30 bg-amber-500/10 py-3">
          <p className="text-sm text-amber-200">{error}</p>
        </Card>
      )}

      {loading ? (
        <Skeleton className="h-80" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders match filters" description="Try broadening the date range or status filters." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-900/90 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-800 transition hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium text-slate-100">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-200">{order.user?.full_name ?? "Unknown customer"}</p>
                    <p className="text-xs text-slate-500">{order.user?.email ?? "No email"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-200">{currency(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <select
                        value={order.status}
                        onChange={(event) => onUpdateStatus(order.id, event.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs capitalize"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge tone={toneMap[order.status]}>{order.status}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-lg px-3 py-1.5 text-xs hover:bg-slate-700" onClick={() => setSelected(order)}>
                      <span className="inline-flex items-center gap-1">
                        <Eye size={14} /> View
                      </span>
                    </button>
                  </td>
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

      <Modal open={Boolean(selected)} title={selected?.order_number ?? "Order details"} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Status: <span className="capitalize text-slate-200">{selected.status}</span>
            </p>
            <div className="space-y-2">
              {selected.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm text-slate-200">{currency(item.unit_price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-sm">
              <span className="text-slate-400">Total</span>
              <span className="font-semibold">{currency(selected.total_amount)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
