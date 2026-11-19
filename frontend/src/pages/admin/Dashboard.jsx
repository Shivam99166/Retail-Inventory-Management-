import React, { useState, useEffect } from 'react';
import {
  Package, Boxes, AlertTriangle, Clock, ClipboardList, Warehouse
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import StatCard from '../../components/admin/StatCard';
import reportService from '../../services/reportService';
import inventoryService from '../../services/inventoryService';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#6b7280'];

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rptRes, invRes] = await Promise.allSettled([
          reportService.getDashboardSummary(),
          inventoryService.getInventory(),
        ]);
        if (rptRes.status === 'fulfilled') {
          const d = rptRes.value?.data ?? rptRes.value;
          setSummary(d);
        }
        if (invRes.status === 'fulfilled') {
          const list = invRes.value?.data ?? invRes.value ?? [];
          setInventory(Array.isArray(list) ? list : []);
        }
      } catch {
        // silently fail — StatCards will show 0
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive category breakdown from real inventory
  const categoryData = inventory.reduce((acc, item) => {
    const cat = item.category || item.product?.category || 'Uncategorised';
    const existing = acc.find(e => e.name === cat);
    const qty = item.availableStock ?? item.available_stock ?? 0;
    if (existing) existing.value += qty;
    else acc.push({ name: cat, value: qty });
    return acc;
  }, []);

  // Month labels for trend chart (structural — no fake numbers)
  const salesData = summary?.monthlySales ?? [];

  return (
    <div className="flex flex-col gap-xl">
      <div className="grid grid-3">
        <StatCard title="Total Products" value={loading ? '…' : (summary?.totalProducts ?? 0)} icon={Package} color="blue" />
        <StatCard title="Total Inventory" value={loading ? '…' : (summary?.totalInventoryUnits ?? inventory.reduce((s, i) => s + (i.availableStock ?? 0), 0))} icon={Boxes} color="green" />
        <StatCard title="Low Stock Items" value={loading ? '…' : (summary?.lowStockItems ?? 0)} icon={AlertTriangle} color="red" />
        <StatCard title="Pending Orders" value={loading ? '…' : (summary?.pendingOrders ?? 0)} icon={Clock} color="orange" />
        <StatCard title="Purchase Orders" value={loading ? '…' : (summary?.totalPurchaseOrders ?? 0)} icon={ClipboardList} color="cyan" />
        <StatCard title="Warehouses" value={loading ? '…' : (summary?.totalWarehouses ?? 0)} icon={Warehouse} color="blue" />
      </div>

      <div className="grid grid-2">
        {/* Monthly sales trend — only rendered when real data exists */}
        <div className="card">
          <div className="card-header">
            <h3>Inventory by Category</h3>
          </div>
          <div className="card-body" style={{ height: 350 }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e5ec' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted">
                {loading ? 'Loading inventory…' : 'No inventory data available.'}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Revenue Trend</h3>
          </div>
          <div className="card-body" style={{ height: 350 }}>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e5ec" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f5f6fa' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e5ec' }} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted text-center px-lg">
                {loading ? 'Loading report…' : 'Revenue trend data is not yet available. As orders are placed and fulfilled, this chart will populate automatically.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
