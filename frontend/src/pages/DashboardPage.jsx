import { useEffect, useState } from "react";
import { Activity, Box, DollarSign, ShoppingCart, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAnalyticsSummary } from "../api/analytics";
import { Card, EmptyState, Skeleton } from "../components/ui";
import { currency, shortDate } from "../utils/format";

const kpiConfig = [
  { key: "revenue", label: "Revenue", icon: DollarSign, format: currency },
  { key: "orders", label: "Orders", icon: ShoppingCart, format: (v) => v },
  { key: "users", label: "Users", icon: Users, format: (v) => v },
  { key: "products", label: "Products", icon: Box, format: (v) => v },
];

const pieColors = ["#a78bfa", "#34d399", "#22d3ee", "#fb923c", "#f87171"];

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setSummary(await getAnalyticsSummary());
      } catch {
        setError("Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (error) {
    return <EmptyState title="Analytics unavailable" description={error} />;
  }
  const avgOrderValue = summary.kpis.orders ? summary.kpis.revenue / summary.kpis.orders : 0;
  const deliveredCount = summary.status_breakdown.find((row) => row.status === "delivered")?.count ?? 0;

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-violet-500/20 via-slate-900 to-slate-900">
        <p className="text-xs uppercase tracking-wider text-violet-200">Overview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Operations are running smoothly</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-300">
          You processed {summary.kpis.orders} orders and generated {currency(summary.kpis.revenue)} in this demo workspace.
        </p>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiConfig.map((item) => (
          <Card key={item.key}>
            <div className="mb-3 inline-flex rounded-lg bg-slate-800 p-2 text-violet-200">
              <item.icon size={16} />
            </div>
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold">{item.format(summary.kpis[item.key])}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Average order value</p>
          <p className="mt-2 text-2xl font-semibold">{currency(avgOrderValue)}</p>
          <p className="mt-1 text-sm text-slate-400">Healthy basket sizing across recent checkouts.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Delivered orders</p>
          <p className="mt-2 text-2xl font-semibold">{deliveredCount}</p>
          <p className="mt-1 text-sm text-slate-400">Most orders are completing successfully this period.</p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h3 className="mb-4 text-sm font-medium text-slate-200">Revenue trend (14 days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.revenue_series}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                  labelStyle={{ color: "#cbd5e1" }}
                  formatter={(value) => currency(value)}
                  labelFormatter={shortDate}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-medium text-slate-200">Order status</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.status_breakdown} dataKey="count" nameKey="status" outerRadius={86}>
                  {summary.status_breakdown.map((entry, idx) => (
                    <Cell key={entry.status} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                  itemStyle={{ color: "#e2e8f0", textTransform: "capitalize" }}
                  labelStyle={{ color: "#cbd5e1" }}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {summary.status_breakdown.map((status) => (
              <div key={status.status} className="flex items-center justify-between text-slate-300">
                <span className="capitalize">{status.status}</span>
                <span>{status.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-medium text-slate-200">Top products</h3>
          {summary.top_products.length === 0 ? (
            <EmptyState title="No sales yet" description="Top products will appear after orders are created." />
          ) : (
            <div className="space-y-2">
              {summary.top_products.map((item) => (
                <div key={item.product_name} className="flex items-center justify-between rounded-xl bg-slate-800/40 p-3">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-slate-400">{item.sold_units} units sold</p>
                  </div>
                  <p className="text-sm">{currency(item.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
            <Activity size={15} /> Recent activity
          </h3>
          <div className="space-y-2">
            {summary.recent_activity.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-800 p-3">
                <p className="text-sm text-slate-200">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
