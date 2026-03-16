import styles from './AdminDashboard.module.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home,
    Users,
    Activity,
    FileText,
    Settings,
    LogOut,
    Bell,
    ChevronDown,
    Download,
    Calendar,
    Filter,
    TrendingUp,
    TrendingDown,
    BarChart3,
    FileBarChart,
    Heart,
} from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const navItems = [
    { icon: <Home size={20} />, label: "Dashboard", id: "dashboard", path: "/admin" },
    { icon: <Users size={20} />, label: "Patients", id: "patients", path: "/admin" },
    { icon: <Activity size={20} />, label: "Vital Records", id: "records", path: "/admin" },
    { icon: <FileText size={20} />, label: "Reports", id: "reports", path: "/admin/reports" },
    { icon: <Settings size={20} />, label: "Settings", id: "settings", path: "/admin/settings" },
];

const monthlyReports = [
    { month: "Jan", patients: 45, visits: 120, avgBP: 128 },
    { month: "Feb", patients: 52, visits: 145, avgBP: 126 },
    { month: "Mar", patients: 48, visits: 138, avgBP: 130 },
    { month: "Apr", patients: 61, visits: 172, avgBP: 129 },
    { month: "May", patients: 58, visits: 165, avgBP: 127 },
    { month: "Jun", patients: 67, visits: 189, avgBP: 125 },
];

const conditionDistribution = [
    { name: "Normal", value: 45, color: "#2E5895" },
    { name: "Hypertensive", value: 30, color: "#FFC32B" },
    { name: "High Risk", value: 15, color: "#C23B21" },
    { name: "Under Monitoring", value: 10, color: "#F7E976" },
];

const ageDistribution = [
    { range: "18-30", count: 15 },
    { range: "31-45", count: 28 },
    { range: "46-60", count: 35 },
    { range: "61-75", count: 18 },
    { range: "76+", count: 4 },
];

export default function AdminReports() {
    const navigate = useNavigate();
    const [reportType, setReportType] = useState("overview");
    const [dateRange, setDateRange] = useState("thisMonth");

    const handleLogout = () => {
        navigate("/login");
    };

    const handleNavClick = (path) => {
        navigate(path);
    };

    return (
        <div className={styles['admin-layout']}>
            {/* Sidebar */}
            <aside className={styles['admin-sidebar']}>
                <div className={styles['sidebar-logo-wrap']}>
                    {/* Empty logo as requested */}
                </div>

                <nav className={styles['sidebar-nav']}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.path)}
                            className={`${styles['sidebar-nav-btn']} ${item.id === 'reports' ? styles.active : ''}`}
                            title={item.label}
                        >
                            {item.icon}
                            <span className={styles['nav-tooltip']}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className={styles['sidebar-logout-btn']}
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </aside>

            {/* Main Content */}
            <div className={styles['admin-main']}>
                {/* Header */}
                <header className={styles['admin-topbar']}>
                    <div className={styles['topbar-left']}>
                        <h1 className={styles['topbar-title']}>Reports & Analytics</h1>
                        <p className={styles['topbar-subtitle']}>Generate and view health monitoring reports</p>
                    </div>
                    <div className={styles['topbar-right']}>
                        <button className={styles['topbar-bell-btn']}>
                            <Bell size={20} />
                            <span className={styles['bell-dot']} />
                        </button>
                        <div className={styles['topbar-avatar']}>
                            <div className={styles['topbar-avatar-circle']}>
                                AS
                            </div>
                            <div className={styles['topbar-avatar-info']}>
                                <span className={styles['topbar-avatar-name']}>Admin Staff</span>
                                <span style={{ fontSize: "0.75rem", color: "#888" }}>Administrator</span>
                            </div>
                            <ChevronDown size={16} style={{ color: "#888", marginLeft: "0.25rem" }} />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className={styles['admin-body']}>
                    {/* Report Controls */}
                    <div className={`${styles['bg-white']} ${styles['rounded-xl']} ${styles['p-6']} ${styles['shadow-sm']} ${styles['mb-6']}`} style={{ borderRadius: "1rem", backgroundColor: "#fff", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>
                                        Report Type
                                    </label>
                                    <select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0", fontSize: "0.875rem", outline: "none", color: "#333" }}
                                    >
                                        <option value="overview">Overview Report</option>
                                        <option value="patients">Patient Statistics</option>
                                        <option value="vitals">Vital Signs Analysis</option>
                                        <option value="conditions">Health Conditions</option>
                                    </select>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>
                                        Date Range
                                    </label>
                                    <select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0", fontSize: "0.875rem", outline: "none", color: "#333" }}
                                    >
                                        <option value="thisMonth">This Month</option>
                                        <option value="lastMonth">Last Month</option>
                                        <option value="last3Months">Last 3 Months</option>
                                        <option value="last6Months">Last 6 Months</option>
                                        <option value="thisYear">This Year</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}
                            >
                                <Download size={16} />
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className={styles['stat-cards-row']} style={{ marginBottom: "1.5rem" }}>
                        {[
                            { label: "Total Patients", value: "100", change: "+12%", icon: <Users size={24} />, color: "#2E5895" },
                            { label: "Total Visits", value: "189", change: "+8%", icon: <Activity size={24} />, color: "#FFC32B" },
                            { label: "Avg Blood Pressure", value: "125/82", change: "-3%", icon: <Heart size={24} />, color: "#C23B21" },
                            { label: "Reports Generated", value: "24", change: "+15%", icon: <FileText size={24} />, color: "#F7E976" },
                        ].map((metric, idx) => (
                            <div key={idx} className={styles['stat-card']}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                    <div
                                        className={styles['stat-card-icon']}
                                        style={{ backgroundColor: `${metric.color}20`, color: metric.color }}
                                    >
                                        {metric.icon}
                                    </div>
                                    <div className={styles['stat-card-change']} style={{ color: metric.change.startsWith('+') ? "#2E5895" : "#C23B21", backgroundColor: "transparent" }}>
                                        {metric.change.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {metric.change}
                                    </div>
                                </div>
                                <div className={styles['stat-card-body']}>
                                    <div className={styles['stat-card-label']}>{metric.label}</div>
                                    <div className={styles['stat-card-value']}>{metric.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className={styles['charts-row']} style={{ marginBottom: "1.5rem" }}>
                        {/* Monthly Trends */}
                        <div className={styles['chart-card']}>
                            <div className={styles['chart-card-header']} style={{ marginBottom: "1rem" }}>
                                <h3 className={styles['chart-card-title']}>Monthly Patient Trends</h3>
                                <BarChart3 size={20} color="#888" />
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={monthlyReports}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} />
                                    <YAxis tick={{ fontSize: 12, fill: "#888" }} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                    <Bar dataKey="patients" fill="#2E5895" radius={[8, 8, 0, 0]} name="Patients" />
                                    <Bar dataKey="visits" fill="#FFC32B" radius={[8, 8, 0, 0]} name="Visits" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Health Condition Distribution */}
                        <div className={styles['chart-card']}>
                            <div className={styles['chart-card-header']} style={{ marginBottom: "1rem" }}>
                                <h3 className={styles['chart-card-title']}>Health Condition Distribution</h3>
                                <FileBarChart size={20} color="#888" />
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={conditionDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {conditionDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Average BP Trends */}
                        <div className={styles['chart-card']}>
                            <div className={styles['chart-card-header']} style={{ marginBottom: "1rem" }}>
                                <h3 className={styles['chart-card-title']}>Average Blood Pressure Trend</h3>
                                <Activity size={20} color="#888" />
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={monthlyReports}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} />
                                    <YAxis tick={{ fontSize: 12, fill: "#888" }} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Line type="monotone" dataKey="avgBP" stroke="#C23B21" strokeWidth={2.5} dot={{ r: 5, fill: "#C23B21" }} name="Avg Systolic BP" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Age Distribution */}
                        <div className={styles['chart-card']}>
                            <div className={styles['chart-card-header']} style={{ marginBottom: "1rem" }}>
                                <h3 className={styles['chart-card-title']}>Patient Age Distribution</h3>
                                <Users size={20} color="#888" />
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={ageDistribution} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: "#888" }} />
                                    <YAxis dataKey="range" type="category" tick={{ fontSize: 12, fill: "#888" }} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                    <Bar dataKey="count" fill="#FFC32B" radius={[0, 8, 8, 0]} name="Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Summary Table */}
                    <div className={styles['table-card']}>
                        <div className={styles['table-card-header']}>
                            <h3 className={styles['table-card-title']}>Monthly Summary</h3>
                        </div>
                        <div className={styles['table-wrapper']}>
                            <table className={styles['data-table']}>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Total Patients</th>
                                        <th>Total Visits</th>
                                        <th>Avg BP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyReports.map((report, idx) => (
                                        <tr key={idx}>
                                            <td>{report.month}</td>
                                            <td>{report.patients}</td>
                                            <td>{report.visits}</td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: "#C23B21" }}>{report.avgBP}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
