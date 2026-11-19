import React, { useState } from 'react';
import { 
  FileText, Download, TrendingUp, DollarSign, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatCard from '../../components/admin/StatCard';

function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock Data for the chart based on range
  const generateMockData = () => {
    const data = [];
    const points = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 12;
    const prefix = dateRange === 'year' ? 'Month ' : 'Day ';
    
    for (let i = 1; i <= points; i++) {
      data.push({
        name: `${prefix}${i}`,
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10
      });
    }
    return data;
  };

  const chartData = generateMockData();

  const handleDownload = (format) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`${format.toUpperCase()} report generated and downloaded successfully! (Mock Action)`);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-xl">
      <div className="card">
        <div className="card-header">
          <h3>Report Generator</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-lg items-end">
            <div className="flex-1 min-w-[200px]">
              <Input 
                id="reportType" type="select" label="Report Type" 
                value={reportType} onChange={e => setReportType(e.target.value)}
              >
                <option value="sales">Sales & Revenue Report</option>
                <option value="inventory">Inventory Valuation Report</option>
                <option value="lowstock">Low Stock Alerts Report</option>
                <option value="po">Purchase Order History</option>
              </Input>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input 
                id="dateRange" type="select" label="Date Range" 
                value={dateRange} onChange={e => setDateRange(e.target.value)}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 12 Months</option>
              </Input>
            </div>
            <div className="flex gap-sm">
              <Button 
                variant="outline" 
                icon={<Download size={16} />}
                onClick={() => handleDownload('csv')}
                disabled={isGenerating}
              >
                Export CSV
              </Button>
              <Button 
                variant="primary" 
                icon={<FileText size={16} />}
                onClick={() => handleDownload('pdf')}
                disabled={isGenerating}
              >
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {reportType === 'sales' && (
        <>
          <div className="grid grid-3">
            <StatCard title="Total Revenue" value="$42,500.00" icon={DollarSign} color="green" />
            <StatCard title="Total Orders" value="342" icon={TrendingUp} color="blue" />
            <StatCard title="Average Order Value" value="$124.26" icon={Calendar} color="orange" />
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Revenue Trend</h3>
            </div>
            <div className="card-body" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e5ec" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e5ec' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {reportType !== 'sales' && (
        <div className="card">
          <div className="card-body flex flex-col items-center justify-center p-3xl text-center">
            <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center text-muted mb-md">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold mb-xs">Report Preview Unavailable</h3>
            <p className="text-muted max-w-md">
              Detailed previews for this report type are not available in the dashboard. 
              Please generate and download the PDF or CSV to view the full dataset.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
