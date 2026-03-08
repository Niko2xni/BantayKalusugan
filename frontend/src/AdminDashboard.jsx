import styles from './AdminDashboard.module.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Initial mock data
const initialPatients = [
  { id: "P-001", firstName: "Maria", lastName: "Santos", age: 58, gender: "Female", address: "Zone 1, Barangay San Roque", email: "maria.santos@email.com", dateRegistered: "2025-01-15" },
  { id: "P-002", firstName: "Juan", lastName: "dela Cruz", age: 45, gender: "Male", address: "Zone 2, Barangay San Roque", email: "juan.delacruz@email.com", dateRegistered: "2025-02-20" },
  { id: "P-003", firstName: "Rosario", lastName: "Reyes", age: 63, gender: "Female", address: "Zone 1, Barangay San Roque", email: "rosario.reyes@email.com", dateRegistered: "2025-03-10" },
  { id: "P-004", firstName: "Eduardo", lastName: "Lim", age: 50, gender: "Male", address: "Zone 3, Barangay San Roque", email: "eduardo.lim@email.com", dateRegistered: "2025-04-05" },
  { id: "P-005", firstName: "Lourdes", lastName: "Garcia", age: 70, gender: "Female", address: "Zone 2, Barangay San Roque", email: "lourdes.garcia@email.com", dateRegistered: "2025-05-12" },
];

const initialVitalSigns = [
  { id: "V-001", patientId: "P-001", patientName: "Maria Santos", date: "2025-07-22", time: "09:30", systolic: 130, diastolic: 85, heartRate: 78, temperature: 36.6, spO2: 97, respiratoryRate: 18, weight: 65, height: 158, recordedBy: "Admin Staff" },
  { id: "V-002", patientId: "P-002", patientName: "Juan dela Cruz", date: "2025-07-22", time: "10:15", systolic: 118, diastolic: 76, heartRate: 74, temperature: 36.4, spO2: 98, respiratoryRate: 16, weight: 72, height: 170, recordedBy: "Admin Staff" },
  { id: "V-003", patientId: "P-003", patientName: "Rosario Reyes", date: "2025-07-21", time: "14:20", systolic: 145, diastolic: 92, heartRate: 88, temperature: 36.7, spO2: 95, respiratoryRate: 20, weight: 58, height: 155, recordedBy: "Admin Staff" },
  { id: "V-004", patientId: "P-004", patientName: "Eduardo Lim", date: "2025-07-21", time: "11:00", systolic: 122, diastolic: 78, heartRate: 73, temperature: 36.5, spO2: 98, respiratoryRate: 17, weight: 78, height: 175, recordedBy: "Admin Staff" },
  { id: "V-005", patientId: "P-005", patientName: "Lourdes Garcia", date: "2025-07-20", time: "15:45", systolic: 138, diastolic: 88, heartRate: 80, temperature: 36.6, spO2: 96, respiratoryRate: 19, weight: 60, height: 160, recordedBy: "Admin Staff" },
];

const bpTrendData = [
  { month: "Jan", systolic: 125, diastolic: 82 },
  { month: "Feb", systolic: 130, diastolic: 85 },
  { month: "Mar", systolic: 128, diastolic: 83 },
  { month: "Apr", systolic: 122, diastolic: 80 },
  { month: "May", systolic: 135, diastolic: 88 },
  { month: "Jun", systolic: 129, diastolic: 84 },
  { month: "Jul", systolic: 124, diastolic: 81 },
];

const registrationsData = [
  { month: "Jan", patients: 12 },
  { month: "Feb", patients: 18 },
  { month: "Mar", patients: 15 },
  { month: "Apr", patients: 22 },
  { month: "May", patients: 19 },
  { month: "Jun", patients: 25 },
  { month: "Jul", patients: 30 },
];

const navItems = [
  { icon: <Home size={20} />, label: "Dashboard", id: "dashboard", path: "/admin" },
  { icon: <Users size={20} />, label: "Patients", id: "patients", path: "/admin" },
  { icon: <Activity size={20} />, label: "Vital Records", id: "records", path: "/admin" },
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
      className={`${styles['px-2']} ${styles['py-0.5']} ${styles['rounded-full']} ${styles['text-xs']}`}
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Patient state
  const [patients, setPatients] = useState(initialPatients);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Vital signs state
  const [vitalSigns, setVitalSigns] = useState(initialVitalSigns);
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [showViewVitalModal, setShowViewVitalModal] = useState(false);
  const [selectedVital, setSelectedVital] = useState(null);

  // Form states for adding patient
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "Male",
    address: "",
    email: "",
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
  const handleAddPatient = () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.age) {
      alert("Please fill in all required fields");
      return;
    }

    const patientId = `P-${String(patients.length + 1).padStart(3, '0')}`;
    const patient = {
      id: patientId,
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      address: newPatient.address,
      email: newPatient.email,
      dateRegistered: new Date().toISOString().split('T')[0],
    };

    setPatients([...patients, patient]);
    setShowAddPatientModal(false);
    setNewPatient({
      firstName: "",
      lastName: "",
      age: "",
      gender: "Male",
      address: "",
      email: "",
    });
  };

  // Edit patient
  const handleEditPatient = () => {
    if (!editingPatient) return;

    setPatients(patients.map(p => p.id === editingPatient.id ? editingPatient : p));
    setShowEditPatientModal(false);
    setEditingPatient(null);
  };

  // Delete patient
  const handleDeletePatient = (patientId) => {
    if (confirm("Are you sure you want to delete this patient? All their vital sign records will also be deleted.")) {
      setPatients(patients.filter(p => p.id !== patientId));
      setVitalSigns(vitalSigns.filter(v => v.patientId !== patientId));
    }
  };

  // Add vital signs
  const handleAddVital = () => {
    if (!newVital.patientId || !newVital.systolic || !newVital.diastolic || !newVital.heartRate || !newVital.temperature) {
      alert("Please fill in all required vital sign fields");
      return;
    }

    const patient = patients.find(p => p.id === newVital.patientId);
    if (!patient) return;

    const vitalId = `V-${String(vitalSigns.length + 1).padStart(3, '0')}`;
    const vital = {
      id: vitalId,
      patientId: newVital.patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: newVital.date,
      time: newVital.time,
      systolic: parseInt(newVital.systolic),
      diastolic: parseInt(newVital.diastolic),
      heartRate: parseInt(newVital.heartRate),
      temperature: parseFloat(newVital.temperature),
      spO2: parseInt(newVital.spO2) || 0,
      respiratoryRate: parseInt(newVital.respiratoryRate) || 0,
      weight: parseFloat(newVital.weight) || 0,
      height: parseFloat(newVital.height) || 0,
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
  };

  // Delete vital sign
  const handleDeleteVital = (vitalId) => {
    if (confirm("Are you sure you want to delete this vital sign record?")) {
      setVitalSigns(vitalSigns.filter(v => v.id !== vitalId));
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
    <div className={styles['admin-layout']}>
      {/* Yellow Icon Sidebar */}
      <aside className={styles['admin-sidebar']}>
        {/* Logo */}
        <div className={styles['sidebar-logo-wrap']}>
          {/* Empty logo as requested */}
        </div>

        {/* Nav Icons */}
        <nav className={styles['sidebar-nav']}>
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
              className={`${styles["sidebar-nav-btn"]} ${activeNav === item.id ? styles.active : ""}`}
            >
              {item.icon}
              <span className={styles['nav-tooltip']}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => {
            // TODO: Implement logout functionality
            alert("Logout functionality to be implemented");
          }}
          className={styles['sidebar-logout-btn']}
          title="Log Out"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <div className={styles['admin-main']}>
        {/* Top Bar */}
        <header className={styles['admin-topbar']}>
          <div className={styles['topbar-left']}>
            <h1 className={styles['topbar-title']}>
              {activeNav === "dashboard" && "Admin Dashboard"}
              {activeNav === "patients" && "Patient Management"}
              {activeNav === "records" && "Vital Records"}
              {activeNav === "reports" && "Reports"}
              {activeNav === "settings" && "Settings"}
            </h1>
            <p className={styles['topbar-subtitle']}>
              {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className={styles['topbar-right']}>
            <button className={styles['topbar-bell-btn']}>
              <Bell size={18} />
              <span className={styles['bell-dot']} />
            </button>
            <div className={styles['topbar-avatar']}>
              <div className={styles['topbar-avatar-circle']}>A</div>
              <div className={`${styles['topbar-avatar-info']} ${styles['hidden']} ${styles['sm:flex']}`}>
                <span className={styles['topbar-avatar-name']}>Admin</span>
              </div>
              <ChevronDown size={14} style={{ color: "#888" }} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles['admin-body']}>
          {/* Dashboard View */}
          {activeNav === "dashboard" && (
            <div>
              {/* Stats */}
              <div className={styles['stat-cards-row']}>
                {stats.map((stat) => (
                  <div key={stat.label} className={styles['stat-card']}>
                    <div
                      className={styles['stat-card-icon']}
                      style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                    >
                      {stat.icon}
                    </div>
                    <div className={styles['stat-card-body']}>
                      <div className={styles['stat-card-value']} style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className={styles['stat-card-label']}>{stat.label}</div>
                      <div className={styles['stat-card-change']}>{stat.change}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className={styles['charts-row']}>
                {/* BP Trend Chart */}
                <div className={styles['chart-card']}>
                  <div className={styles['chart-card-header']}>
                    <div>
                      <h3 className={styles['chart-card-title']}>Average BP Trends</h3>
                      <p className={styles['chart-card-subtitle']}>Community-wide blood pressure averages</p>
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
                <div className={styles['chart-card']}>
                  <div className={styles['chart-card-header']}>
                    <div>
                      <h3 className={styles['chart-card-title']}>Patient Registrations</h3>
                      <p className={styles['chart-card-subtitle']}>Monthly new patient registrations</p>
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
              <div className={styles['table-card']} style={{ marginTop: "1.5rem" }}>
                <div className={styles['table-card-header']}>
                  <h3 className={styles['table-card-title']}>Recent Patients</h3>
                  <button onClick={() => setActiveNav("patients")} className={`${styles['table-action-btn']} ${styles['secondary']}`}>
                    View All
                  </button>
                </div>
                <div className={styles['table-wrapper']}>
                  <table className={styles['data-table']}>
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
                                  className={styles['topbar-avatar-circle']}
                                  style={{ width: "28px", height: "28px", fontSize: "0.6rem" }}
                                >
                                  {p.firstName.charAt(0)}
                                </div>
                                <div>
                                  <div className={styles['patient-name']}>{p.firstName} {p.lastName}</div>
                                  <div className={styles['patient-id']}>{p.id}</div>
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
              <div className={styles['filter-bar']}>
                <div className={styles['filter-search']}>
                  <Search size={16} color="#888" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
                  <button className={`${styles['table-action-btn']} ${styles['secondary']}`}>
                    <Filter size={14} />
                    Filter
                  </button>
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className={styles['table-action-btn']}
                  >
                    <Plus size={14} />
                    Add Patient
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className={styles['table-card']} style={{ marginTop: "1.5rem" }}>
                <div className={styles['table-wrapper']}>
                  <table className={styles['data-table']}>
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
                                  className={styles['topbar-avatar-circle']}
                                  style={{ width: "28px", height: "28px", fontSize: "0.6rem" }}
                                >
                                  {p.firstName.charAt(0)}
                                </div>
                                <span className={styles['patient-name']}>{p.firstName} {p.lastName}</span>
                              </div>
                            </td>
                            <td>{p.age}</td>
                            <td>{p.gender}</td>
                            <td style={{ fontWeight: 600, color: "#333" }}>{bpDisplay}</td>
                            <td>
                              <StatusBadge status={status} />
                            </td>
                            <td className={styles['patient-id']}>{p.dateRegistered}</td>
                            <td>
                              <div className={styles['row-actions']}>
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
                                  className={`${styles['icon-btn']} ${styles['view']}`}
                                  title="View vitals"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingPatient(p);
                                    setShowEditPatientModal(true);
                                  }}
                                  className={styles['icon-btn']}
                                  title="Edit patient"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeletePatient(p.id)}
                                  className={`${styles['icon-btn']} ${styles['danger']}`}
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
                <button onClick={() => setShowAddVitalModal(true)} className={styles['table-action-btn']}>
                  <Plus size={14} />
                  Add Vital Signs
                </button>
              </div>

              {/* Chart */}
              <div className={styles['chart-card']} style={{ marginBottom: "1.5rem" }}>
                <div className={styles['chart-card-header']}>
                  <div>
                    <h3 className={styles['chart-card-title']}>Community BP Trend</h3>
                    <p className={styles['chart-card-subtitle']}>Average blood pressure readings across all patients (2025)</p>
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
              <div className={styles['table-card']}>
                <div className={styles['table-wrapper']}>
                  <table className={styles['data-table']}>
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
                              <td className={styles['patient-id']}>{v.time}</td>
                              <td className={styles['patient-name']}>{v.patientName}</td>
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
                                <div className={styles['row-actions']}>
                                  <button
                                    onClick={() => {
                                      setSelectedVital(v);
                                      setShowViewVitalModal(true);
                                    }}
                                    className={`${styles['icon-btn']} ${styles['view']}`}
                                    title="View details"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVital(v.id)}
                                    className={`${styles['icon-btn']} ${styles['danger']}`}
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
            <div className={styles['empty-state']} style={{ backgroundColor: "#fff", borderRadius: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className={styles['empty-state-icon']}>
                {activeNav === "reports" ? <FileText size={28} /> : <Settings size={28} />}
              </div>
              <h3 className={styles['empty-state-title']}>
                {activeNav === "reports" ? "Reports" : "Settings"}
              </h3>
              <p className={styles['empty-state-sub']}>
                This section is under development. Check back soon.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-box']}>
            <div className={styles['modal-header']}>
              <h3 className={styles['modal-title']}>Add New Patient</h3>
              <button onClick={() => setShowAddPatientModal(false)} className={styles['modal-close-btn']}>
                <X size={20} />
              </button>
            </div>
            <div className={styles['modal-form-grid']}>
              <div>
                <label className={styles['modal-label']}>First Name *</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div>
                <label className={styles['modal-label']}>Last Name *</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>

              <div>
                <label className={styles['modal-label']}>Age *</label>
                <input
                  type="number"
                  placeholder="Age"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div>
                <label className={styles['modal-label']}>Gender *</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  className={styles['modal-input']}
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className={styles['modal-form-full']}>
                <label className={styles['modal-label']}>Address</label>
                <input
                  type="text"
                  placeholder="Barangay address"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div className={styles['modal-form-full']}>
                <label className={styles['modal-label']}>Email</label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
            </div>
            <div className={styles['modal-footer']}>
              <button onClick={() => setShowAddPatientModal(false)} className={styles['btn-cancel']}>
                Cancel
              </button>
              <button onClick={handleAddPatient} className={styles['btn-save']}>
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditPatientModal && editingPatient && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-box']}>
            <div className={styles['modal-header']}>
              <h3 className={styles['modal-title']}>Edit Patient</h3>
              <button onClick={() => setShowEditPatientModal(false)} className={styles['modal-close-btn']}>
                <X size={20} />
              </button>
            </div>
            <div className={styles['modal-form-grid']}>
              <div>
                <label className={styles['modal-label']}>First Name *</label>
                <input
                  type="text"
                  value={editingPatient.firstName}
                  onChange={(e) => setEditingPatient({ ...editingPatient, firstName: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div>
                <label className={styles['modal-label']}>Last Name *</label>
                <input
                  type="text"
                  value={editingPatient.lastName}
                  onChange={(e) => setEditingPatient({ ...editingPatient, lastName: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>

              <div>
                <label className={styles['modal-label']}>Age *</label>
                <input
                  type="number"
                  value={editingPatient.age}
                  onChange={(e) => setEditingPatient({ ...editingPatient, age: parseInt(e.target.value) })}
                  className={styles['modal-input']}
                />
              </div>
              <div>
                <label className={styles['modal-label']}>Gender *</label>
                <select
                  value={editingPatient.gender}
                  onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value })}
                  className={styles['modal-input']}
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className={styles['modal-form-full']}>
                <label className={styles['modal-label']}>Address</label>
                <input
                  type="text"
                  value={editingPatient.address}
                  onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div className={styles['modal-form-full']}>
                <label className={styles['modal-label']}>Email</label>
                <input
                  type="email"
                  value={editingPatient.email}
                  onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
            </div>
            <div className={styles['modal-footer']}>
              <button onClick={() => setShowEditPatientModal(false)} className={styles['btn-cancel']}>
                Cancel
              </button>
              <button onClick={handleEditPatient} className={styles['btn-save']}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vital Signs Modal */}
      {showAddVitalModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-box']} style={{ maxWidth: '600px' }}>
            <div className={styles['modal-header']}>
              <h3 className={styles['modal-title']}>Add Vital Signs</h3>
              <button onClick={() => setShowAddVitalModal(false)} className={styles['modal-close-btn']}>
                <X size={20} />
              </button>
            </div>
            <div className={styles['modal-form-grid']}>

              {/* Patient Selection - Full Width */}
              <div className={styles['modal-form-full']}>
                <label className={styles['modal-label']}>Select Patient *</label>
                <select
                  value={newVital.patientId}
                  onChange={(e) => setNewVital({ ...newVital, patientId: e.target.value })}
                  className={styles['modal-input']}
                >
                  <option value="">-- Select a patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div>
                <label className={styles['modal-label']}>Date *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={newVital.date}
                    onChange={(e) => setNewVital({ ...newVital, date: e.target.value })}
                    className={styles['modal-input']}
                  />
                </div>
              </div>
              <div>
                <label className={styles['modal-label']}>Time *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="time"
                    value={newVital.time}
                    onChange={(e) => setNewVital({ ...newVital, time: e.target.value })}
                    className={styles['modal-input']}
                  />
                </div>
              </div>

              {/* Blood Pressure */}
              <div>
                <label className={styles['modal-label']}>Systolic (mmHg) *</label>
                <input
                  type="number"
                  placeholder="e.g., 120"
                  value={newVital.systolic}
                  onChange={(e) => setNewVital({ ...newVital, systolic: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div>
                <label className={styles['modal-label']}>Diastolic (mmHg) *</label>
                <input
                  type="number"
                  placeholder="e.g., 80"
                  value={newVital.diastolic}
                  onChange={(e) => setNewVital({ ...newVital, diastolic: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>

              {/* Heart Rate and Temperature */}
              <div>
                <label className={styles['modal-label']}>Heart Rate (bpm) *</label>
                <input
                  type="number"
                  placeholder="e.g., 72"
                  value={newVital.heartRate}
                  onChange={(e) => setNewVital({ ...newVital, heartRate: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div>
                <label className={styles['modal-label']}>Temperature (°C) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 36.5"
                  value={newVital.temperature}
                  onChange={(e) => setNewVital({ ...newVital, temperature: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>

              {/* SpO2 and Respiratory Rate */}
              <div>
                <label className={styles['modal-label']}>SpO₂ (%)</label>
                <input
                  type="number"
                  placeholder="e.g., 98"
                  value={newVital.spO2}
                  onChange={(e) => setNewVital({ ...newVital, spO2: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div>
                <label className={styles['modal-label']}>Respiratory Rate (breaths/min)</label>
                <input
                  type="number"
                  placeholder="e.g., 16"
                  value={newVital.respiratoryRate}
                  onChange={(e) => setNewVital({ ...newVital, respiratoryRate: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>

              {/* Weight and Height */}
              <div>
                <label className={styles['modal-label']}>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 65.5"
                  value={newVital.weight}
                  onChange={(e) => setNewVital({ ...newVital, weight: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>
              <div>
                <label className={styles['modal-label']}>Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 165"
                  value={newVital.height}
                  onChange={(e) => setNewVital({ ...newVital, height: e.target.value })}
                  className={styles['modal-input']}
                />
              </div>

              {/* Footer Buttons - Full Width */}
              <div className={styles['modal-form-full']} style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddVitalModal(false)}
                  className={styles['btn-cancel']}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddVital}
                  className={styles['btn-save']}
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
        <div className={`${styles['fixed']} ${styles['inset-0']} ${styles['z-50']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']} ${styles['p-4']}`} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className={`${styles['bg-white']} ${styles['rounded-2xl']} ${styles['p-6']} ${styles['w-full']} ${styles['max-w-2xl']} ${styles['shadow-2xl']} ${styles['max-h-[90vh]']} ${styles['overflow-y-auto']}`}>
            <div className={`${styles['flex']} ${styles['items-center']} ${styles['justify-between']} ${styles['mb-5']}`}>
              <div>
                <h3 style={{ fontWeight: 700, color: "#333333" }}>Vital Signs Record</h3>
                <p className={`${styles['text-xs']} ${styles['mt-1']}`} style={{ color: "#888" }}>{selectedVital.patientName} - {selectedVital.date} {selectedVital.time}</p>
              </div>
              <button onClick={() => setShowViewVitalModal(false)} style={{ color: "#888" }}>
                <X size={20} />
              </button>
            </div>

            <div className={`${styles['grid']} ${styles['grid-cols-2']} ${styles['gap-4']}`}>
              {/* Blood Pressure */}
              <div className={`${styles['bg-gray-50']} ${styles['rounded-xl']} ${styles['p-4']}`}>
                <div className={`${styles['flex']} ${styles['items-center']} ${styles['gap-2']} ${styles['mb-2']}`}>
                  <Activity size={18} style={{ color: "#C23B21" }} />
                  <span className={styles['text-xs']} style={{ color: "#888", fontWeight: 600 }}>Blood Pressure</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#C23B21" }}>
                  {selectedVital.systolic}/{selectedVital.diastolic}
                </div>
                <div className={styles['text-xs']} style={{ color: "#888" }}>mmHg</div>
              </div>

              {/* Heart Rate */}
              <div className={`${styles['bg-gray-50']} ${styles['rounded-xl']} ${styles['p-4']}`}>
                <div className={`${styles['flex']} ${styles['items-center']} ${styles['gap-2']} ${styles['mb-2']}`}>
                  <Heart size={18} style={{ color: "#2E5895" }} />
                  <span className={styles['text-xs']} style={{ color: "#888", fontWeight: 600 }}>Heart Rate</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2E5895" }}>
                  {selectedVital.heartRate}
                </div>
                <div className={styles['text-xs']} style={{ color: "#888" }}>bpm</div>
              </div>

              {/* Temperature */}
              <div className={`${styles['bg-gray-50']} ${styles['rounded-xl']} ${styles['p-4']}`}>
                <div className={`${styles['flex']} ${styles['items-center']} ${styles['gap-2']} ${styles['mb-2']}`}>
                  <Thermometer size={18} style={{ color: "#FFC32B" }} />
                  <span className={styles['text-xs']} style={{ color: "#888", fontWeight: 600 }}>Temperature</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#b8820a" }}>
                  {selectedVital.temperature}
                </div>
                <div className={styles['text-xs']} style={{ color: "#888" }}>°C</div>
              </div>

              {/* SpO2 */}
              <div className={`${styles['bg-gray-50']} ${styles['rounded-xl']} ${styles['p-4']}`}>
                <div className={`${styles['flex']} ${styles['items-center']} ${styles['gap-2']} ${styles['mb-2']}`}>
                  <Droplets size={18} style={{ color: "#2E5895" }} />
                  <span className={styles['text-xs']} style={{ color: "#888", fontWeight: 600 }}>SpO₂</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2E5895" }}>
                  {selectedVital.spO2}
                </div>
                <div className={styles['text-xs']} style={{ color: "#888" }}>%</div>
              </div>

              {/* Respiratory Rate */}
              <div className={`${styles['bg-gray-50']} ${styles['rounded-xl']} ${styles['p-4']}`}>
                <div className={`${styles['flex']} ${styles['items-center']} ${styles['gap-2']} ${styles['mb-2']}`}>
                  <Wind size={18} style={{ color: "#C23B21" }} />
                  <span className={styles['text-xs']} style={{ color: "#888", fontWeight: 600 }}>Respiratory Rate</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#C23B21" }}>
                  {selectedVital.respiratoryRate}
                </div>
                <div className={styles['text-xs']} style={{ color: "#888" }}>breaths/min</div>
              </div>

              {/* BMI */}
              <div className={`${styles['bg-gray-50']} ${styles['rounded-xl']} ${styles['p-4']}`}>
                <div className={`${styles['flex']} ${styles['items-center']} ${styles['gap-2']} ${styles['mb-2']}`}>
                  <Users size={18} style={{ color: "#FFC32B" }} />
                  <span className={styles['text-xs']} style={{ color: "#888", fontWeight: 600 }}>BMI</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#b8820a" }}>
                  {selectedVital.weight > 0 && selectedVital.height > 0
                    ? calculateBMI(selectedVital.weight, selectedVital.height)
                    : "N/A"}
                </div>
                <div className={styles['text-xs']} style={{ color: "#888" }}>
                  {selectedVital.weight}kg / {selectedVital.height}cm
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`${styles['mt-4']} ${styles['p-4']} ${styles['rounded-xl']}`} style={{ backgroundColor: "#F2F3F5" }}>
              <div className={`${styles['flex']} ${styles['items-center']} ${styles['justify-between']}`}>
                <span className={styles['text-xs']} style={{ color: "#555", fontWeight: 600 }}>Health Status</span>
                <StatusBadge status={getStatus(selectedVital.systolic, selectedVital.diastolic)} />
              </div>
              <div className={`${styles['text-xs']} ${styles['mt-2']}`} style={{ color: "#888" }}>
                Recorded by: {selectedVital.recordedBy}
              </div>
            </div>

            <button
              onClick={() => setShowViewVitalModal(false)}
              className={`${styles['w-full']} ${styles['mt-4']} ${styles['py-2.5']} ${styles['rounded-lg']} ${styles['text-sm']} ${styles['text-white']}`}
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


