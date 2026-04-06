import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminProfileLink from "./components/AdminProfileLink";
import { adminFetch, AUTH_REDIRECT_ERROR } from "./utils/adminApi";
import { getStoredUser, setStoredUser } from "./utils/authSession";
import {
    Bell,
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


export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: "Admin Staff",
        email: "admin@bantaykalusugan.com",
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

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const readErrorMessage = async (response, fallback) => {
        try {
            const payload = await response.json();
            return payload.detail || fallback;
        } catch {
            return fallback;
        }
    };

    useEffect(() => {
        let isCancelled = false;

        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const [profileRes, barangayRes, systemRes] = await Promise.all([
                    adminFetch("/api/admin/settings/profile"),
                    adminFetch("/api/admin/settings/barangay"),
                    adminFetch("/api/admin/settings/system"),
                ]);

                if (!profileRes.ok || !barangayRes.ok || !systemRes.ok) {
                    throw new Error("Failed to load settings");
                }

                const [profile, barangay, system] = await Promise.all([
                    profileRes.json(),
                    barangayRes.json(),
                    systemRes.json(),
                ]);

                if (isCancelled) {
                    return;
                }

                setProfileData({
                    name: profile.name || "Admin Staff",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    role: profile.role || "Administrator",
                });

                setBarangayData({
                    name: barangay.name || "",
                    municipality: barangay.municipality || "",
                    province: barangay.province || "",
                    address: barangay.address || "",
                    contactNumber: barangay.contact_number || "",
                });

                setSystemSettings({
                    language: system.language || "en",
                    timezone: system.timezone || "Asia/Manila",
                    dateFormat: system.date_format || "MM/DD/YYYY",
                    notifications: Boolean(system.notifications),
                    emailAlerts: Boolean(system.email_alerts),
                    autoBackup: Boolean(system.auto_backup),
                });
            } catch (err) {
                if (err.message !== AUTH_REDIRECT_ERROR && !isCancelled) {
                    showNotification(err.message || "Unable to load settings", "error");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchSettings();

        return () => {
            isCancelled = true;
        };
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const response = await adminFetch("/api/admin/settings/profile", {
                method: "PUT",
                body: JSON.stringify({
                    name: profileData.name,
                    email: profileData.email,
                    phone: profileData.phone,
                    role: profileData.role,
                }),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response, "Failed to save profile settings"));
            }

            const updated = await response.json();
            setProfileData({
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
                role: updated.role,
            });
            showNotification("Profile settings saved successfully!");

            const storedUser = getStoredUser() || {};
            const nameParts = String(updated.name || "").trim().split(/\s+/).filter(Boolean);
            const firstName = nameParts[0] || storedUser.first_name || "Admin";
            const lastName = nameParts.slice(1).join(" ") || storedUser.last_name || "Staff";

            setStoredUser({
                ...storedUser,
                first_name: firstName,
                last_name: lastName,
                email: updated.email,
                phone: updated.phone,
                role: storedUser.role || "admin",
            });
        } catch (err) {
            if (err.message !== AUTH_REDIRECT_ERROR) {
                showNotification(err.message || "Failed to save profile settings", "error");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBarangay = async () => {
        setIsSaving(true);
        try {
            const response = await adminFetch("/api/admin/settings/barangay", {
                method: "PUT",
                body: JSON.stringify({
                    name: barangayData.name,
                    municipality: barangayData.municipality,
                    province: barangayData.province,
                    address: barangayData.address,
                    contact_number: barangayData.contactNumber,
                }),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response, "Failed to save barangay settings"));
            }

            showNotification("Barangay settings saved successfully!");
        } catch (err) {
            if (err.message !== AUTH_REDIRECT_ERROR) {
                showNotification(err.message || "Failed to save barangay settings", "error");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSystem = async () => {
        setIsSaving(true);
        try {
            const response = await adminFetch("/api/admin/settings/system", {
                method: "PUT",
                body: JSON.stringify({
                    language: systemSettings.language,
                    timezone: systemSettings.timezone,
                    date_format: systemSettings.dateFormat,
                    notifications: systemSettings.notifications,
                    email_alerts: systemSettings.emailAlerts,
                    auto_backup: systemSettings.autoBackup,
                }),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response, "Failed to save system settings"));
            }

            showNotification("System settings saved successfully!");
        } catch (err) {
            if (err.message !== AUTH_REDIRECT_ERROR) {
                showNotification(err.message || "Failed to save system settings", "error");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
            showNotification("Please complete all password fields", "error");
            return;
        }

        if (securityData.newPassword !== securityData.confirmPassword) {
            showNotification("New password and confirmation do not match", "error");
            return;
        }

        setIsSaving(true);
        try {
            const response = await adminFetch("/api/admin/settings/change-password", {
                method: "POST",
                body: JSON.stringify({
                    current_password: securityData.currentPassword,
                    new_password: securityData.newPassword,
                    confirm_password: securityData.confirmPassword,
                }),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response, "Failed to update password"));
            }

            setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            showNotification("Password updated successfully!");
        } catch (err) {
            if (err.message !== AUTH_REDIRECT_ERROR) {
                showNotification(err.message || "Failed to update password", "error");
            }
        } finally {
            setIsSaving(false);
        }
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
            {notification && (
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
                        backgroundColor: notification.type === "error" ? "#C23B21" : "#2E5895",
                        color: "white"
                    }}
                >
                    <Check size={20} color="white" />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        {notification.message}
                    </span>
                </div>
            )}

            {/* Shared Sidebar */}
            <AdminSidebar activeNav="settings" />

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
                        <AdminProfileLink name={profileData.name} role={profileData.role} />
                    </div>
                </header>

                {/* Content */}
                <main className="admin-body">
                    {isLoading && (
                        <div className="chart-card" style={{ marginBottom: "1rem", textAlign: "center", color: "#666" }}>
                            Loading settings...
                        </div>
                    )}

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
                                    onClick={handleSaveProfile}
                                    disabled={isLoading || isSaving}
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "1.5rem" }}
                                >
                                    <Save size={16} />
                                    {isSaving ? "Saving..." : "Save Changes"}
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
                                    onClick={handleSaveBarangay}
                                    disabled={isLoading || isSaving}
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "1.5rem" }}
                                >
                                    <Save size={16} />
                                    {isSaving ? "Saving..." : "Save Changes"}
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
                                    onClick={handleSaveSystem}
                                    disabled={isLoading || isSaving}
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "1.5rem" }}
                                >
                                    <Save size={16} />
                                    {isSaving ? "Saving..." : "Save Changes"}
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
                                    onClick={handleUpdatePassword}
                                    disabled={isLoading || isSaving}
                                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer", marginTop: "1.5rem" }}
                                >
                                    <Save size={16} />
                                    {isSaving ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
