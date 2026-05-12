import { useState } from 'react';
import { useApp, usePermission } from '../context/AppContext';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, DollarSign, Briefcase, Star, Lock, BarChart2 } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { ROLE_TYPES } from '../data/mockData';
import './Analytics.css';

// ── Time range config ───────────────────────────────────────────────────────
const RANGES = [
  { label:'1M',  value:1  },
  { label:'3M',  value:3  },
  { label:'6M',  value:6  },
  { label:'12M', value:12 },
  { label:'2Y',  value:24 },
  { label:'3Y',  value:36 },
];

const ROLE_COLORS = {
  Lead:             ROLE_TYPES.Lead?.color           || '#3B82F6',
  Traditional:      ROLE_TYPES.Traditional?.color    || '#F43F5E',
  Candid:           ROLE_TYPES.Candid?.color         || '#10B981',
  Drone:            ROLE_TYPES.Drone?.color          || '#8B5CF6',
  Reel:             ROLE_TYPES.Reel?.color           || '#F59E0B',
  Cinematographer:  ROLE_TYPES.Cinematographer?.color|| '#06B6D4',
  Assistant:        ROLE_TYPES.Assistant?.color      || '#6366F1',
  Helper:           ROLE_TYPES.Helper?.color         || '#94A3B8',
  'Creative Director': ROLE_TYPES['Creative Director']?.color || '#EC4899',
};

// Colours for job CATEGORIES (used by the pie chart)
const CATEGORY_COLORS = {
  Wedding:       '#8B5CF6',
  Corporate:     '#3B82F6',
  Commercial:    '#06B6D4',
  Fashion:       '#EC4899',
  Automotive:    '#F59E0B',
  Portrait:      '#10B981',
  Event:         '#F43F5E',
  Other:         '#64748b',
};
// Helper: returns a colour for any category, cycling through a palette for unknowns
const PALETTE = ['#6366F1','#F59E0B','#10B981','#3B82F6','#EC4899','#06B6D4','#8B5CF6','#F43F5E'];
const getCatColor = (name, idx) => CATEGORY_COLORS[name] || PALETTE[idx % PALETTE.length];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'12px',padding:'12px 16px',boxShadow:'var(--shadow-lg)',fontSize:13}}>
      <div style={{fontWeight:700,marginBottom:8,color:'var(--text-primary)'}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,display:'flex',justifyContent:'space-between',gap:24,alignItems:'center'}}>
          <span style={{color: 'var(--text-secondary)'}}>{p.name}</span>
          <strong style={{color: 'var(--text-primary)'}}>
            {typeof p.value==='number' ? `₹${p.value.toLocaleString()}` : p.value}
          </strong>
        </div>
      ))}
    </div>
  );
};

// ── Financial Gate Overlay ──────────────────────────────────────────────────
function FinancialLock({ children }) {
  return (
    <div className="financial-lock-wrapper">
      <div className="financial-lock-blur">{children}</div>
      <div className="financial-lock-overlay">
        <Lock size={28} style={{color:'var(--text-muted)'}}/>
        <div className="financial-lock-title">Manager Access Only</div>
        <div className="financial-lock-desc">Switch to Manager authority to view financial data</div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const context = useApp();
  if (!context) return null;
  const { state, dispatch } = context;
  const { analyticsRole, analyticsTimeframe, analytics } = state;
  if (!analytics) return null;

  const isPhotographerMode = analyticsRole === 'photographer';

  const handleRoleChange = (role) => {
    dispatch({ type: 'SET_ANALYTICS_ROLE', payload: role });
  };

  const handleTimeframeChange = (tf) => {
    dispatch({ type: 'SET_ANALYTICS_TIMEFRAME', payload: tf });
  };

  const { jobs } = state;
  const completedJobs = jobs.filter(j => j.status === 'completed');

  // 1. Calculate Revenue by Role (Pie Chart)
  const dynamicRevenueByRole = Object.entries(
    completedJobs.reduce((acc, j) => {
      const cat = j.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (j.budget || 0);
      return acc;
    }, {})
  ).map(([name, value], idx) => ({
    name,
    value,
    color: getCatColor(name, idx)
  }));

  // 2. Calculate Revenue Growth (Area Chart)
  // Group by month-year
  const dynamicTrendData = Object.entries(
    completedJobs.reduce((acc, j) => {
      const date = new Date(j.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' }).replace(',', "'");
      acc[monthYear] = (acc[monthYear] || 0) + (j.budget || 0);
      return acc;
    }, {})
  ).map(([month, amount]) => ({
    month,
    amount,
    jobs: completedJobs.filter(j => {
      const d = new Date(j.date);
      const my = d.toLocaleString('default', { month: 'short', year: '2-digit' }).replace(',', "'");
      return my === month;
    }).length
  })).sort((a, b) => new Date(a.month) - new Date(b.month));

  // 3. KPI Fallbacks
  const totalRevenue = completedJobs.reduce((sum, j) => sum + (j.budget || 0), 0);
  const jobsThisMonth = completedJobs.filter(j => {
    const d = new Date(j.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // DUMMY DATA FOR PREMIUM AESTHETIC
  const DUMMY_REVENUE_BY_ROLE = [
    { name: 'Wedding',    value: 850000, color: CATEGORY_COLORS.Wedding    },
    { name: 'Candid',     value: 420000, color: ROLE_COLORS.Candid         },
    { name: 'Corporate',  value: 280000, color: CATEGORY_COLORS.Corporate  },
    { name: 'Commercial', value: 150000, color: CATEGORY_COLORS.Commercial },
  ];

  const DUMMY_TREND_DATA = [
    { month: 'Jan 26', amount: 180000, volume: 50000 },
    { month: 'Feb 26', amount: 240000, volume: 80000 },
    { month: 'Mar 26', amount: 210000, volume: 60000 },
    { month: 'Apr 26', amount: 320000, volume: 110000 },
    { month: 'May 26', amount: 480000, volume: 180000 },
    { month: 'Jun 26', amount: 650000, volume: 220000 },
  ];

  // Force using dummy data if dynamic data is completely empty (0 revenue)
  const hasData = completedJobs.length > 0 && totalRevenue > 0;
  
  const revenueByRole = hasData ? dynamicRevenueByRole : DUMMY_REVENUE_BY_ROLE;
  const trendData = hasData ? dynamicTrendData : DUMMY_TREND_DATA;

  const displayTotalRevenue = hasData ? totalRevenue : 1700000;
  const displayJobsCompleted = hasData ? completedJobs.length : 84;

  
  return (
    <div className="analytics-container">
      {/* ─── FILTERS BAR ─── */}
      <div className="analytics-filters">
        <div className="role-switch">
          <button 
            className={`switch-btn ${isPhotographerMode ? 'active' : ''}`}
            onClick={() => handleRoleChange('photographer')}
          >
            Photographer
          </button>
          <button 
            className={`switch-btn ${!isPhotographerMode ? 'active' : ''}`}
            onClick={() => handleRoleChange('freelancer')}
          >
            Freelancer
          </button>
        </div>

        <div className="timeframe-group">
          {['1W', '1M', '3M', '6M', '1Y', '2Y'].map(tf => (
            <button 
              key={tf}
              className={`tf-btn ${analyticsTimeframe === tf ? 'active' : ''}`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ─── KPI ROW ─── */}
      <div className="grid-4 premium-kpi-grid">
        <StatCard 
          label="Total Revenue" 
          value={`₹${displayTotalRevenue.toLocaleString()}`} 
          change="14.2%" 
          changeDir="up" 
          icon={<DollarSign size={18} />} 
          iconBg="linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)"
        />
        <StatCard 
          label="Jobs Completed" 
          value={displayJobsCompleted} 
          change="5" 
          changeDir="up" 
          icon={<Briefcase size={18} />} 
          iconBg="linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)"
        />
        <StatCard 
          label="Utilization Rate" 
          value={`${analytics.utilizationRate || 82}%`} 
          change="4.1%" 
          changeDir="up" 
          icon={<TrendingUp size={18} />} 
          iconBg="linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 100%)"
        />
        <StatCard 
          label="Avg Rating" 
          value={analytics.clientSatisfaction || 4.9} 
          suffix="/5" 
          icon={<Star size={18} />} 
          iconBg="linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)"
        />
      </div>


      <div className="analytics-main-grid">
        {/* ─── REVENUE CHART ─── */}
        <div className="card card-padding chart-main">
          <div className="section-header">
            <h2 className="section-title">Revenue Growth</h2>
            <div className="chart-legend">
              <span className="legend-item"><div className="dot" style={{background: '#6366F1'}} /> Revenue</span>
              <span className="legend-item"><div className="dot" style={{background: '#EC4899'}} /> Volume</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="amount" name="Revenue" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 8, strokeWidth: 0, fill: '#6366F1', style: { filter: 'drop-shadow(0px 4px 8px rgba(99,102,241,0.5))' } }} />
              <Area type="monotone" dataKey="volume" name="Volume" stroke="#EC4899" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" activeDot={{ r: 6, strokeWidth: 0, fill: '#EC4899' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ─── DISTRIBUTION ─── */}
        <div className="card card-padding chart-side">
          <div className="section-header">
            <h2 className="section-title">Category Share</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={revenueByRole}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {revenueByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 4px 6px ${entry.color}40)` }} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="distribution-legend">
            {revenueByRole.map(r => (
              <div key={r.name} className="dist-item">
                <div className="dist-dot" style={{background: r.color}} />
                <span className="dist-name">{r.name}</span>
                <span className="dist-val">{Math.round(r.value/1000)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TOP PHOTOGRAPHERS (Photographer View Only) ─── */}
      {isPhotographerMode && (
        <div className="card rankings-section">
          <div className="card-padding">
            <h2 className="section-title">Top Collaborative Photographers</h2>
          </div>
          <div className="table-container">
            <table className="ecosystem-table">
              <thead>
                <tr>
                  <th>Photographer</th>
                  <th>Jobs Together</th>
                  <th>Earnings Generated</th>
                  <th>Latest Work</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Aarav Sharma', jobs: 18, earnings: 184000, rating: 4.9, date: '18 May 2026' },
                  { name: 'Sana Khan', jobs: 24, earnings: 142000, rating: 4.9, date: '15 May 2026' },
                  { name: 'Ishani Patel', jobs: 12, earnings: 98000, rating: 4.8, date: '22 May 2026' },
                  { name: 'Rohan Mehta', jobs: 15, earnings: 85000, rating: 4.7, date: '18 May 2026' },
                ].map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="table-user">
                        <div className="user-avatar" style={{background: 'var(--primary-gradient)', color:'white'}}>{p.name[0]}</div>
                        {p.name}
                      </div>
                    </td>
                    <td>{p.jobs}</td>
                    <td className="text-green" style={{fontWeight: 600}}>₹{p.earnings.toLocaleString()}</td>
                    <td className="text-muted">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
