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
    Save,
    User,
    Lock,
    Globe,
    Shield,
    Mail,
    Phone,
    MapPin,
    Building,
    Check,
} from "lucide-react";

const navItems = [
    { icon: <Home size={20} />, label: "Dashboard", id: "dashboard", path: "/admin" },
    { icon: <Users size={20} />, label: "Patients", id: "patients", path: "/admin" },
    { icon: <Activity size={20} />, label: "Vital Records", id: "records", path: "/admin" },
    { icon: <FileText size={20} />, label: "Reports", id: "reports", path: "/admin/reports" },
    { icon: <Settings size={20} />, label: "Settings", id: "settings", path: "/admin/settings" },
];

export default function AdminSettings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [showSaveNotification, setShowSaveNotification] = useState(false);

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: "Admin Staff",
        email: "admin@bantaykalusugan.ph",
        phone: "+63 912 345 6789",
        role: "Administrator",
    });

    // Barangay settings
    const [barangayData, setBarangayData] = useState({
        name: "Barangay San Antonio",
        municipality: "Quezon City",
        province: "Metro Manila",
        address: "123 Barangay Hall Road, San Antonio, Quezon City",
        contactNumber: "+63 2 1234 5678",
    });

    // System settings
    const [systemSettings, setSystemSettings] = useState({
        language: "en",
        timezone: "Asia/Manila",
        dateFormat: "MM/DD/YYYY",
        notifications: true,
        emailAlerts: true,
        autoBackup: true,
    });

    // Security settings
    const [securityData, setSecurityData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleLogout = () => {
        navigate("/login");
    };

    const handleNavClick = (path) => {
        navigate(path);
    };

    const handleSave = () => {
        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 3000);
    };

    const tabs = [
        { id: "profile", label: "Profile Settings", icon: <User size={16} /> },
        { id: "barangay", label: "Barangay Info", icon: <Building size={16} /> },
        { id: "system", label: "System Settings", icon: <Globe size={16} /> },
        { id: "security", label: "Security", icon: <Shield size={16} /> },
    ];

    return (
        <div className="admin-layout">
            {/* Save Notification */}
            {showSaveNotification && (
                <div
                    style={{
                        position: "fixed",
                        top: "1.5rem",
                        right: "1.5rem",
                        zIndex: 50,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.5rem",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        backgroundColor: "#2E5895",
                        color: "white"
                    }}
                >
                    <Check size={20} color="white" />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        Settings saved successfully!
                    </span>
                </div>
            )}

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo-wrap">
                    {/* Empty logo as requested */}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.path)}
                            className={`sidebar-nav-btn ${item.id === "settings" ? "active" : ""}`}
                            title={item.label}
                        >
                            {item.icon}
                            <span className="nav-tooltip">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="sidebar-logout-btn"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Header */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Settings</h1>
                        <p className="topbar-subtitle">Manage your system preferences and configurations</p>
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-bell-btn">
                            <Bell size={20} />
                            <span className="bell-dot" />
                        </button>
                        <div className="topbar-avatar">
                            <div className="topbar-avatar-circle">
                                AS
                            </div>
                            <div className="topbar-avatar-info">
                                <span className="topbar-avatar-name">Admin Staff</span>
                                <span style={{ fontSize: "0.75rem", color: "#888" }}>Administrator</span>
                            </div>
                            <ChevronDown size={16} style={{ color: "#888", marginLeft: "0.25rem" }} />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="admin-body">
                    <div style={{ maxWidth: "64rem", margin: "0 auto", width: "100%" }}>
                        {/* Tabs - adapted to use settings-tabs if we add them, but for now inline */}
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", paddingBottom: "0.5rem", overflowX: "auto" }}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        padding: "0.75rem 1.25rem",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                        border: "none",
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                        transition: "all 0.2s",
                                        backgroundColor: activeTab === tab.id ? "#2E5895" : "white",
                                        color: activeTab === tab.id ? "white" : "#333333",
                                        fontWeight: activeTab === tab.id ? 600 : 400,
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Profile Settings */}
                        {activeTab === "profile" && (
                            <div className="chart-card" style={{ width: "100%" }}>
                                <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "#333", fontWeight: 700 }}>
                                    Profile Information
                                </h2>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Full Name
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <User size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Email Address
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <Mail size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Phone Number
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <Phone size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Role
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0", backgroundColor: "#f9f9f9" }}>
                                            <Shield size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="text"
                                                value={profileData.role}
                                                disabled
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#888" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "1.5rem" }}
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* Barangay Info */}
                        {activeTab === "barangay" && (
                            <div className="chart-card" style={{ width: "100%" }}>
                                <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "#333", fontWeight: 700 }}>
                                    Barangay Information
                                </h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Barangay Name
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <Building size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="text"
                                                value={barangayData.name}
                                                onChange={(e) => setBarangayData({ ...barangayData, name: e.target.value })}
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                                Municipality/City
                                            </label>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                                <MapPin size={16} style={{ color: "#2E5895" }} />
                                                <input
                                                    type="text"
                                                    value={barangayData.municipality}
                                                    onChange={(e) => setBarangayData({ ...barangayData, municipality: e.target.value })}
                                                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                                Province
                                            </label>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                                <Globe size={16} style={{ color: "#2E5895" }} />
                                                <input
                                                    type="text"
                                                    value={barangayData.province}
                                                    onChange={(e) => setBarangayData({ ...barangayData, province: e.target.value })}
                                                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Complete Address
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <MapPin size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="text"
                                                value={barangayData.address}
                                                onChange={(e) => setBarangayData({ ...barangayData, address: e.target.value })}
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Contact Number
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <Phone size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="tel"
                                                value={barangayData.contactNumber}
                                                onChange={(e) => setBarangayData({ ...barangayData, contactNumber: e.target.value })}
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "1.5rem" }}
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* System Settings */}
                        {activeTab === "system" && (
                            <div className="chart-card" style={{ width: "100%" }}>
                                <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "#333", fontWeight: 700 }}>
                                    System Preferences
                                </h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                                Language
                                            </label>
                                            <select
                                                value={systemSettings.language}
                                                onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                                                style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0", fontSize: "0.875rem", outline: "none", color: "#333" }}
                                            >
                                                <option value="en">English</option>
                                                <option value="tl">Tagalog</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                                Timezone
                                            </label>
                                            <select
                                                value={systemSettings.timezone}
                                                onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                                                style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0", fontSize: "0.875rem", outline: "none", color: "#333" }}
                                            >
                                                <option value="Asia/Manila">Asia/Manila (PHT)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                                Date Format
                                            </label>
                                            <select
                                                value={systemSettings.dateFormat}
                                                onChange={(e) => setSystemSettings({ ...systemSettings, dateFormat: e.target.value })}
                                                style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0", fontSize: "0.875rem", outline: "none", color: "#333" }}
                                            >
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1rem" }}>
                                        <h3 style={{ fontSize: "0.875rem", marginBottom: "0.75rem", color: "#333", fontWeight: 600 }}>
                                            Notification Preferences
                                        </h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                            {[
                                                { key: "notifications", label: "Enable Notifications" },
                                                { key: "emailAlerts", label: "Email Alerts" },
                                                { key: "autoBackup", label: "Automatic Data Backup" },
                                            ].map((setting) => (
                                                <label key={setting.key} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={systemSettings[setting.key]}
                                                        onChange={(e) =>
                                                            setSystemSettings({ ...systemSettings, [setting.key]: e.target.checked })
                                                        }
                                                        style={{ width: "1rem", height: "1rem", accentColor: "#2E5895", cursor: "pointer" }}
                                                    />
                                                    <span style={{ fontSize: "0.875rem", color: "#333" }}>
                                                        {setting.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "1.5rem" }}
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === "security" && (
                            <div className="chart-card" style={{ width: "100%" }}>
                                <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem", color: "#333", fontWeight: 700 }}>
                                    Security & Password
                                </h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "28rem" }}>
                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Current Password
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <Lock size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="password"
                                                value={securityData.currentPassword}
                                                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                                placeholder="Enter current password"
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            New Password
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <Lock size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="password"
                                                value={securityData.newPassword}
                                                onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                                placeholder="Enter new password"
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block", color: "#888", fontWeight: 600 }}>
                                            Confirm New Password
                                        </label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e0e0e0" }}>
                                            <Lock size={16} style={{ color: "#2E5895" }} />
                                            <input
                                                type="password"
                                                value={securityData.confirmPassword}
                                                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                                placeholder="Confirm new password"
                                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#333" }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "rgba(46,88,149,0.08)", border: "1px solid rgba(46,88,149,0.15)" }}>
                                        <p style={{ fontSize: "0.75rem", color: "#2E5895", margin: 0 }}>
                                            <strong>Password Requirements:</strong>
                                        </p>
                                        <ul style={{ fontSize: "0.75rem", color: "#555", marginTop: "0.5rem", paddingLeft: "1.25rem", marginBottom: 0 }}>
                                            <li>At least 8 characters long</li>
                                            <li>Contains uppercase and lowercase letters</li>
                                            <li>Contains at least one number</li>
                                            <li>Contains at least one special character</li>
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "1.5rem" }}
                                >
                                    <Save size={16} />
                                    Update Password
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
