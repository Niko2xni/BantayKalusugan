import { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";
import {
  Users,
  Activity,
  Search,
  Plus,
  Bell,
  ChevronDown,
  Home,
  FileText,
  Settings,
  LogOut,
  Eye,
  Edit2,
  Trash2,
  Heart,
  AlertTriangle,
  CheckCircle,
  Filter,
  X,
  Thermometer,
  Wind,
  Droplets,
  FileCheck,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
const navItems = [
  { icon: <Home size={20} />, label: "Dashboard", id: "dashboard", path: "/admin" },
  { icon: <Users size={20} />, label: "Patients", id: "patients", path: "/admin" },
  { icon: <Activity size={20} />, label: "Vital Records", id: "records", path: "/admin" },
  { icon: <FileCheck size={20} />, label: "Audit Logs", id: "audit", path: "/admin/audit-logs" },
  { icon: <FileText size={20} />, label: "Reports", id: "reports", path: "/admin/reports" },
  { icon: <Settings size={20} />, label: "Settings", id: "settings", path: "/admin/settings" },
];

function StatusBadge({ status }) {
  const styles = {
    Normal: { bg: "rgba(46,88,149,0.1)", text: "#2E5895" },
    Hypertensive: { bg: "rgba(255,195,43,0.15)", text: "#b8820a" },
    "High Risk": { bg: "rgba(194,59,33,0.1)", text: "#C23B21" },
  };
  const style = styles[status] || styles.Normal;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs"
      style={{ backgroundColor: style.bg, color: style.text, fontWeight: 600 }}
    >
      {status}
    </span>
  );
}

function calculateBMI(weight, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  return bmi.toFixed(1);
}

function getStatus(systolic, diastolic) {
  if (systolic >= 140 || diastolic >= 90) return "High Risk";
  if (systolic >= 130 || diastolic >= 85) return "Hypertensive";
  return "Normal";
}

const API_BASE = "http://localhost:8000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Patient state
  const [patients, setPatients] = useState([]);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Vital signs state
  const [vitalSigns, setVitalSigns] = useState([]);
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [showViewVitalModal, setShowViewVitalModal] = useState(false);
  const [selectedVital, setSelectedVital] = useState(null);

  // Stats State
  const [bpTrendData, setBpTrendData] = useState([]);
  const [registrationsData, setRegistrationsData] = useState([]);

  // Fetch from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/patients/`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(p => {
          let ageObj = 0;
          if (p.date_of_birth) {
            const today = new Date();
            const birthDate = new Date(p.date_of_birth);
            ageObj = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ageObj--;
          }
          return {
            id: `P-${String(p.id).padStart(3, '0')}`,
            dbId: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            age: ageObj,
            gender: p.sex,
            address: p.address,
            email: p.email,
            phone: p.phone,
            date_of_birth: p.date_of_birth,
            dateRegistered: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : "N/A",
          };
        });
        setPatients(mapped);
      })
      .catch(err => console.error("Failed to fetch patients:", err));

    fetch(`${API_BASE}/api/vitals/`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(v => ({
          id: `V-${String(v.id).padStart(3, '0')}`,
          dbId: v.id,
          patientId: `P-${String(v.patient_id).padStart(3, '0')}`,
          patientName: v.patient_name || "Unknown",
          date: new Date(v.created_at).toISOString().split('T')[0],
          time: new Date(v.created_at).toTimeString().slice(0, 5),
          systolic: v.systolic,
          diastolic: v.diastolic,
          heartRate: v.heart_rate,
          temperature: v.temperature,
          spO2: v.spo2,
          respiratoryRate: v.respiratory_rate,
          weight: v.weight,
          height: v.height,
          recordedBy: "Admin",
        }));
        setVitalSigns(mapped);
      })
      .catch(err => console.error("Failed to fetch vitals:", err));

    fetch(`${API_BASE}/api/admin/stats`)
      .then(res => res.json())
      .then(data => {
        setBpTrendData(data.bp_trends);
        setRegistrationsData(data.registrations);
      })
      .catch(err => console.error("Failed to fetch custom stats:", err));
  }, []);

  // Update vital signs names when patients load
  useEffect(() => {
    if (patients.length > 0 && vitalSigns.length > 0 && vitalSigns.some(v => v.patientName === "Unknown")) {
      setVitalSigns(prev => prev.map(v => {
        if (v.patientName !== "Unknown") return v;
        const p = patients.find(pat => pat.id === v.patientId);
        return p ? { ...v, patientName: `${p.firstName} ${p.lastName}` } : v;
      }));
    }
  }, [patients, vitalSigns]);

  // Form states for adding patient
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "Male",
    address: "",
  });

  // Form states for adding vital signs
  const [newVital, setNewVital] = useState({
    patientId: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    systolic: "",
    diastolic: "",
    heartRate: "",
    temperature: "",
    spO2: "",
    respiratoryRate: "",
    weight: "",
    height: "",
  });

  // Get patient's latest vital signs
  const getPatientLatestVitals = (patientId) => {
    const patientVitals = vitalSigns
      .filter(v => v.patientId === patientId)
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
    return patientVitals[0];
  };

  // Add patient
  const handleAddPatient = async () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.phone || !newPatient.date_of_birth) {
      alert("Please fill in first name, last name, phone, and date of birth");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/patients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: newPatient.firstName,
          last_name: newPatient.lastName,
          email: newPatient.email,
          phone: newPatient.phone,
          date_of_birth: newPatient.date_of_birth,
          sex: newPatient.gender,
          address: newPatient.address,
          barangay: "Unknown",
        }),
      });

      if (response.ok) {
        const p = await response.json();
        
        let ageObj = 0;
        if (p.date_of_birth) {
          const today = new Date();
          const birthDate = new Date(p.date_of_birth);
          ageObj = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ageObj--;
        }

        const patient = {
          id: `P-${String(p.id).padStart(3, '0')}`,
          dbId: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          age: ageObj,
          gender: p.sex,
          address: p.address,
          email: p.email,
          phone: p.phone,
          date_of_birth: p.date_of_birth,
          dateRegistered: new Date(p.created_at || new Date()).toISOString().split('T')[0],
        };

        setPatients([...patients, patient]);
        setShowAddPatientModal(false);
        setNewPatient({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          date_of_birth: "",
          gender: "Male",
          address: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to add patient: ${errorData.detail}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  // Edit patient
  const handleEditPatient = async () => {
    if (!editingPatient) return;

    try {
      const response = await fetch(`${API_BASE}/api/patients/${editingPatient.dbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editingPatient.firstName,
          last_name: editingPatient.lastName,
          email: editingPatient.email,
          phone: editingPatient.phone,
          sex: editingPatient.gender,
          address: editingPatient.address,
        }),
      });

      if (response.ok) {
        setPatients(patients.map(p => p.id === editingPatient.id ? editingPatient : p));
        setShowEditPatientModal(false);
        setEditingPatient(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to edit patient details: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  // Delete patient
  const handleDeletePatient = async (patientId) => {
    if (confirm("Are you sure you want to delete this patient? All their vital sign records will also be deleted.")) {
      const p = patients.find(pat => pat.id === patientId);
      if (p && p.dbId) {
        try {
          const res = await fetch(`${API_BASE}/api/patients/${p.dbId}`, { method: "DELETE" });
          if (res.ok) {
            setPatients(patients.filter(pat => pat.id !== patientId));
            setVitalSigns(vitalSigns.filter(v => v.patientId !== patientId));
          } else {
            const errorData = await res.json();
            alert(`Failed to delete patient: ${errorData.detail || "Unknown error"}`);
          }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server");
        }
      } else {
        setPatients(patients.filter(pat => pat.id !== patientId));
        setVitalSigns(vitalSigns.filter(v => v.patientId !== patientId));
      }
    }
  };

  // Add vital signs
  const handleAddVital = async () => {
    if (!newVital.patientId || !newVital.systolic || !newVital.diastolic || !newVital.heartRate || !newVital.temperature) {
      alert("Please fill in all required vital sign fields");
      return;
    }

    const patient = patients.find(p => p.id === newVital.patientId);
    if (!patient) return;

    try {
      const response = await fetch(`${API_BASE}/api/vitals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.dbId,
          date: newVital.date,
          time: newVital.time,
          systolic: parseInt(newVital.systolic),
          diastolic: parseInt(newVital.diastolic),
          heart_rate: parseInt(newVital.heartRate),
          temperature: parseFloat(newVital.temperature),
          spo2: parseInt(newVital.spO2) || 0,
          respiratory_rate: parseInt(newVital.respiratoryRate) || 0,
          weight: parseFloat(newVital.weight) || 0,
          height: parseFloat(newVital.height) || 0,
        }),
      });

      if (response.ok) {
        const v = await response.json();
        const vital = {
          id: `V-${String(v.id).padStart(3, '0')}`,
          dbId: v.id,
          patientId: newVital.patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          date: new Date(v.created_at).toISOString().split('T')[0],
          time: new Date(v.created_at).toTimeString().slice(0, 5),
          systolic: v.systolic,
          diastolic: v.diastolic,
          heartRate: v.heart_rate,
          temperature: v.temperature,
          spO2: v.spo2,
          respiratoryRate: v.respiratory_rate,
          weight: v.weight,
          height: v.height,
          recordedBy: "Admin Staff",
        };
        setVitalSigns([...vitalSigns, vital]);
        setShowAddVitalModal(false);
        setNewVital({
          patientId: "",
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          systolic: "",
          diastolic: "",
          heartRate: "",
          temperature: "",
          spO2: "",
          respiratoryRate: "",
          weight: "",
          height: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to save vital sign: ${errorData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    }
  };

  // Delete vital sign
  const handleDeleteVital = async (vitalId) => {
    if (confirm("Are you sure you want to delete this vital sign record?")) {
      const v = vitalSigns.find(vital => vital.id === vitalId);
      if (v && v.dbId) {
        try {
          const res = await fetch(`${API_BASE}/api/vitals/${v.dbId}`, { method: "DELETE" });
          if (res.ok) {
            setVitalSigns(vitalSigns.filter(vital => vital.id !== vitalId));
          } else {
            const errorData = await res.json();
            alert(`Failed to delete record: ${errorData.detail || "Unknown error"}`);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setVitalSigns(vitalSigns.filter(vital => vital.id !== vitalId));
      }
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats from real data
  const totalPatients = patients.length;
  const todayDate = new Date().toISOString().split('T')[0];
  const bpRecordsToday = vitalSigns.filter(v => v.date === todayDate).length;
  const highRiskCount = patients.filter(p => {
    const vitals = getPatientLatestVitals(p.id);
    return vitals && getStatus(vitals.systolic, vitals.diastolic) === "High Risk";
  }).length;
  const normalCount = patients.filter(p => {
    const vitals = getPatientLatestVitals(p.id);
    return vitals && getStatus(vitals.systolic, vitals.diastolic) === "Normal";
  }).length;

  const stats = [
    { label: "Total Patients", value: String(totalPatients), icon: <Users size={22} />, change: `${patients.length} registered`, color: "#2E5895" },
    { label: "BP Records Today", value: String(bpRecordsToday), icon: <Activity size={22} />, change: `${vitalSigns.length} total records`, color: "#C23B21" },
    { label: "High Risk Patients", value: String(highRiskCount), icon: <AlertTriangle size={22} />, change: "Require follow-up", color: "#FFC32B" },
    { label: "Healthy Patients", value: String(normalCount), icon: <CheckCircle size={22} />, change: "Normal status", color: "#2E5895" },
  ];

  return (
    <div className="admin-layout">
      {/* Yellow Icon Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="sidebar-logo-wrap">
          <img src={logo} alt="BantayKalusugan Logo" />
        </div>

        {/* Nav Icons */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.path !== "/admin") {
                  navigate(item.path);
                } else {
                  setActiveNav(item.id);
                }
              }}
              className={`sidebar-nav-btn ${activeNav === item.id ? "active" : ""}`}
            >
              {item.icon}
              <span className="nav-tooltip">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => {
            // TODO: Implement logout functionality
            alert("Logout functionality to be implemented");
          }}
          className="sidebar-logout-btn"
          title="Log Out"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {activeNav === "dashboard" && "Admin Dashboard"}
              {activeNav === "patients" && "Patient Management"}
              {activeNav === "records" && "Vital Records"}
              {activeNav === "reports" && "Reports"}
              {activeNav === "settings" && "Settings"}
            </h1>
            <p className="topbar-subtitle">
              {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="topbar-right">
            <button className="topbar-bell-btn">
              <Bell size={18} />
              <span className="bell-dot" />
            </button>
            <div className="topbar-avatar">
              <div className="topbar-avatar-circle">A</div>
              <div className="topbar-avatar-info hidden sm:flex">
                <span className="topbar-avatar-name">Admin</span>
              </div>
              <ChevronDown size={14} style={{ color: "#888" }} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-body">
          {/* Dashboard View */}
          {activeNav === "dashboard" && (
            <div>
              {/* Stats */}
              <div className="stat-cards-row">
                {stats.map((stat) => (
                  <div key={stat.label} className="stat-card">
                    <div
                      className="stat-card-icon"
                      style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                    >
                      {stat.icon}
                    </div>
                    <div className="stat-card-body">
                      <div className="stat-card-value" style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className="stat-card-label">{stat.label}</div>
                      <div className="stat-card-change">{stat.change}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                {/* BP Trend Chart */}
                <div className="chart-card">
                  <div className="chart-card-header">
                    <div>
                      <h3 className="chart-card-title">Average BP Trends</h3>
                      <p className="chart-card-subtitle">Community-wide blood pressure averages</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={bpTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#888" }} domain={[70, 150]} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="#C23B21"
                        strokeWidth={2}
                        dot={{ fill: "#C23B21", r: 4 }}
                        name="Systolic"
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#2E5895"
                        strokeWidth={2}
                        dot={{ fill: "#2E5895", r: 4 }}
                        name="Diastolic"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Registrations Chart */}
                <div className="chart-card">
                  <div className="chart-card-header">
                    <div>
                      <h3 className="chart-card-title">Patient Registrations</h3>
                      <p className="chart-card-subtitle">Monthly new patient registrations</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={registrationsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <Bar dataKey="patients" fill="#2E5895" radius={[4, 4, 0, 0]} name="Patients" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Patients Table */}
              <div className="table-card" style={{ marginTop: "1.5rem" }}>
                <div className="table-card-header">
                  <h3 className="table-card-title">Recent Patients</h3>
                  <button onClick={() => setActiveNav("patients")} className="table-action-btn secondary">
                    View All
                  </button>
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Last BP</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.slice(0, 5).map((p) => {
                        const vitals = getPatientLatestVitals(p.id);
                        const status = vitals ? getStatus(vitals.systolic, vitals.diastolic) : "No Data";
                        const bpDisplay = vitals ? `${vitals.systolic}/${vitals.diastolic}` : "N/A";

                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div
                                  className="topbar-avatar-circle"
                                  style={{ width: "28px", height: "28px", fontSize: "0.6rem" }}
                                >
                                  {p.firstName.charAt(0)}
                                </div>
                                <div>
                                  <div className="patient-name">{p.firstName} {p.lastName}</div>
                                  <div className="patient-id">{p.id}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: "#333" }}>{bpDisplay}</span>
                            </td>
                            <td>
                              <StatusBadge status={status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Patients View */}
          {activeNav === "patients" && (
            <div>
              {/* Filter Bar */}
              <div className="filter-bar">
                <div className="filter-search">
                  <Search size={16} color="#888" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
                  <button className="table-action-btn secondary">
                    <Filter size={14} />
                    Filter
                  </button>
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="table-action-btn"
                  >
                    <Plus size={14} />
                    Add Patient
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="table-card" style={{ marginTop: "1.5rem" }}>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {["Patient ID", "Name", "Age", "Gender", "Last BP", "Status", "Date", "Actions"].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((p) => {
                        const vitals = getPatientLatestVitals(p.id);
                        const status = vitals ? getStatus(vitals.systolic, vitals.diastolic) : "No Data";
                        const bpDisplay = vitals ? `${vitals.systolic}/${vitals.diastolic}` : "N/A";

                        return (
                          <tr key={p.id}>
                            <td style={{ color: "#2E5895", fontWeight: 600 }}>{p.id}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div
                                  className="topbar-avatar-circle"
                                  style={{ width: "28px", height: "28px", fontSize: "0.6rem" }}
                                >
                                  {p.firstName.charAt(0)}
                                </div>
                                <span className="patient-name">{p.firstName} {p.lastName}</span>
                              </div>
                            </td>
                            <td>{p.age}</td>
                            <td>{p.gender}</td>
                            <td style={{ fontWeight: 600, color: "#333" }}>{bpDisplay}</td>
                            <td>
                              <StatusBadge status={status} />
                            </td>
                            <td className="patient-id">{p.dateRegistered}</td>
                            <td>
                              <div className="row-actions">
                                <button
                                  onClick={() => {
                                    const patientVitals = vitalSigns.filter(v => v.patientId === p.id);
                                    if (patientVitals.length > 0) {
                                      setSelectedVital(patientVitals[0]);
                                      setShowViewVitalModal(true);
                                    } else {
                                      alert("No vital signs recorded for this patient yet.");
                                    }
                                  }}
                                  className="icon-btn view"
                                  title="View vitals"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingPatient(p);
                                    setShowEditPatientModal(true);
                                  }}
                                  className="icon-btn"
                                  title="Edit patient"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeletePatient(p.id)}
                                  className="icon-btn danger"
                                  title="Delete patient"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #f0f0f0", fontSize: "0.75rem", color: "#888" }}>
                  Showing {filteredPatients.length} of {patients.length} patients
                </div>
              </div>
            </div>
          )}

          {/* Vital Records View */}
          {activeNav === "records" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#333" }}>Vital Sign Records</h2>
                <button onClick={() => setShowAddVitalModal(true)} className="table-action-btn">
                  <Plus size={14} />
                  Add Vital Signs
                </button>
              </div>

              {/* Chart */}
              <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
                <div className="chart-card-header">
                  <div>
                    <h3 className="chart-card-title">Community BP Trend</h3>
                    <p className="chart-card-subtitle">Average blood pressure readings across all patients (2025)</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={bpTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#888" }} domain={[70, 160]} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="systolic" stroke="#C23B21" strokeWidth={2.5} dot={{ r: 5, fill: "#C23B21" }} name="Avg Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#2E5895" strokeWidth={2.5} dot={{ r: 5, fill: "#2E5895" }} name="Avg Diastolic" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Records Table */}
              <div className="table-card">
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {["Date", "Time", "Patient", "BP", "HR", "Temp", "SpO₂", "Status", "Actions"].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vitalSigns
                        .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
                        .map((v) => {
                          const status = getStatus(v.systolic, v.diastolic);
                          return (
                            <tr key={v.id}>
                              <td>{v.date}</td>
                              <td className="patient-id">{v.time}</td>
                              <td className="patient-name">{v.patientName}</td>
                              <td style={{ color: "#C23B21", fontWeight: 600 }}>
                                {v.systolic}/{v.diastolic}
                              </td>
                              <td>{v.heartRate} bpm</td>
                              <td>{v.temperature}°C</td>
                              <td>{v.spO2}%</td>
                              <td>
                                <StatusBadge status={status} />
                              </td>
                              <td>
                                <div className="row-actions">
                                  <button
                                    onClick={() => {
                                      setSelectedVital(v);
                                      setShowViewVitalModal(true);
                                    }}
                                    className="icon-btn view"
                                    title="View details"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVital(v.id)}
                                    className="icon-btn danger"
                                    title="Delete record"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reports/Settings Placeholder */}
          {(activeNav === "reports" || activeNav === "settings") && (
            <div className="empty-state" style={{ backgroundColor: "#fff", borderRadius: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="empty-state-icon">
                {activeNav === "reports" ? <FileText size={28} /> : <Settings size={28} />}
              </div>
              <h3 className="empty-state-title">
                {activeNav === "reports" ? "Reports" : "Settings"}
              </h3>
              <p className="empty-state-sub">
                This section is under development. Check back soon.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Add New Patient</h3>
              <button onClick={() => setShowAddPatientModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-form-grid">
              <div>
                <label className="modal-label">First Name *</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div>
                <label className="modal-label">Last Name *</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                  className="modal-input"
                />
              </div>

              <div>
                <label className="modal-label">Date of Birth *</label>
                <input
                  type="date"
                  value={newPatient.date_of_birth}
                  onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div>
                <label className="modal-label">Gender *</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  className="modal-input"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className="modal-form-full">
                <label className="modal-label">Phone *</label>
                <input
                  type="text"
                  placeholder="Phone number"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="modal-input"
                />
              </div>

              <div className="modal-form-full">
                <label className="modal-label">Address</label>
                <input
                  type="text"
                  placeholder="Barangay address"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div className="modal-form-full">
                <label className="modal-label">Email</label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="modal-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddPatientModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleAddPatient} className="btn-save">
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditPatientModal && editingPatient && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Edit Patient</h3>
              <button onClick={() => setShowEditPatientModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-form-grid">
              <div>
                <label className="modal-label">First Name *</label>
                <input
                  type="text"
                  value={editingPatient.firstName}
                  onChange={(e) => setEditingPatient({ ...editingPatient, firstName: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div>
                <label className="modal-label">Last Name *</label>
                <input
                  type="text"
                  value={editingPatient.lastName}
                  onChange={(e) => setEditingPatient({ ...editingPatient, lastName: e.target.value })}
                  className="modal-input"
                />
              </div>

              <div>
                <label className="modal-label">Age (Calculated)</label>
                <input
                  type="number"
                  value={editingPatient.age}
                  disabled
                  className="modal-input"
                  style={{ backgroundColor: "#f5f5f5", opacity: 0.7 }}
                />
              </div>
              <div>
                <label className="modal-label">Gender *</label>
                <select
                  value={editingPatient.gender}
                  onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value })}
                  className="modal-input"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className="modal-form-full">
                <label className="modal-label">Phone</label>
                <input
                  type="text"
                  value={editingPatient.phone}
                  onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                  className="modal-input"
                />
              </div>

              <div className="modal-form-full">
                <label className="modal-label">Address</label>
                <input
                  type="text"
                  value={editingPatient.address}
                  onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div className="modal-form-full">
                <label className="modal-label">Email</label>
                <input
                  type="email"
                  value={editingPatient.email}
                  onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                  className="modal-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowEditPatientModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleEditPatient} className="btn-save">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vital Signs Modal */}
      {showAddVitalModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Vital Signs</h3>
              <button onClick={() => setShowAddVitalModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-form-grid">

              {/* Patient Selection - Full Width */}
              <div className="modal-form-full">
                <label className="modal-label">Select Patient *</label>
                <select
                  value={newVital.patientId}
                  onChange={(e) => setNewVital({ ...newVital, patientId: e.target.value })}
                  className="modal-input"
                >
                  <option value="">-- Select a patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div>
                <label className="modal-label">Date *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={newVital.date}
                    onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>
              <div>
                <label className="modal-label">Time *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="time"
                    value={newVital.time}
                    onChange={(e) => setNewVital({ ...newVital, time: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              {/* Blood Pressure */}
              <div>
                <label className="modal-label">Systolic (mmHg) *</label>
                <input
                  type="number"
                  placeholder="e.g., 120"
                  value={newVital.systolic}
                  onChange={(e) => setNewVital({ ...newVital, systolic: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div>
                <label className="modal-label">Diastolic (mmHg) *</label>
                <input
                  type="number"
                  placeholder="e.g., 80"
                  value={newVital.diastolic}
                  onChange={(e) => setNewVital({ ...newVital, diastolic: e.target.value })}
                  className="modal-input"
                />
              </div>

              {/* Heart Rate and Temperature */}
              <div>
                <label className="modal-label">Heart Rate (bpm) *</label>
                <input
                  type="number"
                  placeholder="e.g., 72"
                  value={newVital.heartRate}
                  onChange={(e) => setNewVital({ ...newVital, heartRate: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div>
                <label className="modal-label">Temperature (°C) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 36.5"
                  value={newVital.temperature}
                  onChange={(e) => setNewVital({ ...newVital, temperature: e.target.value })}
                  className="modal-input"
                />
              </div>

              {/* SpO2 and Respiratory Rate */}
              <div>
                <label className="modal-label">SpO₂ (%)</label>
                <input
                  type="number"
                  placeholder="e.g., 98"
                  value={newVital.spO2}
                  onChange={(e) => setNewVital({ ...newVital, spO2: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div>
                <label className="modal-label">Respiratory Rate (breaths/min)</label>
                <input
                  type="number"
                  placeholder="e.g., 16"
                  value={newVital.respiratoryRate}
                  onChange={(e) => setNewVital({ ...newVital, respiratoryRate: e.target.value })}
                  className="modal-input"
                />
              </div>

              {/* Weight and Height */}
              <div>
                <label className="modal-label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 65.5"
                  value={newVital.weight}
                  onChange={(e) => setNewVital({ ...newVital, weight: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div>
                <label className="modal-label">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 165"
                  value={newVital.height}
                  onChange={(e) => setNewVital({ ...newVital, height: e.target.value })}
                  className="modal-input"
                />
              </div>

              {/* Footer Buttons - Full Width */}
              <div className="modal-form-full" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddVitalModal(false)}
                  className="btn-cancel"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddVital}
                  className="btn-save"
                  style={{ flex: 1 }}
                >
                  Save Vital Signs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Vital Signs Modal */}
      {showViewVitalModal && selectedVital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 style={{ fontWeight: 700, color: "#333333" }}>Vital Signs Record</h3>
                <p className="text-xs mt-1" style={{ color: "#888" }}>{selectedVital.patientName} - {selectedVital.date} {selectedVital.time}</p>
              </div>
              <button onClick={() => setShowViewVitalModal(false)} style={{ color: "#888" }}>
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Blood Pressure */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={18} style={{ color: "#C23B21" }} />
                  <span className="text-xs" style={{ color: "#888", fontWeight: 600 }}>Blood Pressure</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#C23B21" }}>
                  {selectedVital.systolic}/{selectedVital.diastolic}
                </div>
                <div className="text-xs" style={{ color: "#888" }}>mmHg</div>
              </div>

              {/* Heart Rate */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={18} style={{ color: "#2E5895" }} />
                  <span className="text-xs" style={{ color: "#888", fontWeight: 600 }}>Heart Rate</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2E5895" }}>
                  {selectedVital.heartRate}
                </div>
                <div className="text-xs" style={{ color: "#888" }}>bpm</div>
              </div>

              {/* Temperature */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={18} style={{ color: "#FFC32B" }} />
                  <span className="text-xs" style={{ color: "#888", fontWeight: 600 }}>Temperature</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#b8820a" }}>
                  {selectedVital.temperature}
                </div>
                <div className="text-xs" style={{ color: "#888" }}>°C</div>
              </div>

              {/* SpO2 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={18} style={{ color: "#2E5895" }} />
                  <span className="text-xs" style={{ color: "#888", fontWeight: 600 }}>SpO₂</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2E5895" }}>
                  {selectedVital.spO2}
                </div>
                <div className="text-xs" style={{ color: "#888" }}>%</div>
              </div>

              {/* Respiratory Rate */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind size={18} style={{ color: "#C23B21" }} />
                  <span className="text-xs" style={{ color: "#888", fontWeight: 600 }}>Respiratory Rate</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#C23B21" }}>
                  {selectedVital.respiratoryRate}
                </div>
                <div className="text-xs" style={{ color: "#888" }}>breaths/min</div>
              </div>

              {/* BMI */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={18} style={{ color: "#FFC32B" }} />
                  <span className="text-xs" style={{ color: "#888", fontWeight: 600 }}>BMI</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#b8820a" }}>
                  {selectedVital.weight > 0 && selectedVital.height > 0
                    ? calculateBMI(selectedVital.weight, selectedVital.height)
                    : "N/A"}
                </div>
                <div className="text-xs" style={{ color: "#888" }}>
                  {selectedVital.weight}kg / {selectedVital.height}cm
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#F2F3F5" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "#555", fontWeight: 600 }}>Health Status</span>
                <StatusBadge status={getStatus(selectedVital.systolic, selectedVital.diastolic)} />
              </div>
              <div className="text-xs mt-2" style={{ color: "#888" }}>
                Recorded by: {selectedVital.recordedBy}
              </div>
            </div>

            <button
              onClick={() => setShowViewVitalModal(false)}
              className="w-full mt-4 py-2.5 rounded-lg text-sm text-white"
              style={{ backgroundColor: "#2E5895", fontWeight: 600 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


