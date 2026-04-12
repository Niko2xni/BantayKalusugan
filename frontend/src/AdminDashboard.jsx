import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import "./AdminDashboard.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminProfileLink from "./components/AdminProfileLink";
import AdminNotificationsDropdown from "./components/admin-dashboard/AdminNotificationsDropdown";
import AdminToast from "./components/admin-dashboard/AdminToast";
import DeleteConfirmModal from "./components/admin-dashboard/DeleteConfirmModal";
import OverviewPanel from "./components/admin-dashboard/OverviewPanel";
import PanelErrorBoundary from "./components/admin-dashboard/PanelErrorBoundary";
import PatientModal from "./components/admin-dashboard/PatientModal";
import NotifyPatientModal from "./components/admin-dashboard/NotifyPatientModal";
import PatientsPanel from "./components/admin-dashboard/PatientsPanel";
import VitalDetailsModal from "./components/admin-dashboard/VitalDetailsModal";
import VitalModal from "./components/admin-dashboard/VitalModal";
import VitalsPanel from "./components/admin-dashboard/VitalsPanel";
import useAdminDashboardData from "./hooks/useAdminDashboardData";

const SUPPORTED_TABS = new Set(["dashboard", "patients", "records"]);

function safeParseInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function safeParseFloat(value) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function AdminDashboard() {
  const location = useLocation();
  const requestedTab = location.state?.tab;

  const [activeNav, setActiveNav] = useState(
    requestedTab && SUPPORTED_TABS.has(requestedTab) ? requestedTab : "dashboard"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showNotifyPatientModal, setShowNotifyPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [notifyingPatient, setNotifyingPatient] = useState(null);

  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [showViewVitalModal, setShowViewVitalModal] = useState(false);
  const [selectedVital, setSelectedVital] = useState(null);

  const [patientSubmitState, setPatientSubmitState] = useState({
    loading: false,
    error: "",
  });
  const [notifySubmitState, setNotifySubmitState] = useState({
    loading: false,
    error: "",
  });
  const [vitalSubmitState, setVitalSubmitState] = useState({
    loading: false,
    error: "",
  });

  const [deleteDialog, setDeleteDialog] = useState({ type: "", item: null });
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);

  const [toast, setToast] = useState(null);

  const {
    patients,
    vitalSigns,
    appointmentsQueue,
    bpTrendData,
    registrationsData,
    loading,
    errors,
    statsSummary,
    refreshPatients,
    refreshVitals,
    refreshAppointments,
    refreshStats,
    createPatient,
    updatePatient,
    deletePatient,
    createVital,
    deleteVital,
    updateAppointmentStatus,
    getPatientLatestVitals,
    getVitalPatientName,
    sendNotification,
  } = useAdminDashboardData();

  const pageTitle = useMemo(() => {
    if (activeNav === "patients") return "Patient Management";
    if (activeNav === "records") return "Vital Records";
    return "Admin Dashboard";
  }, [activeNav]);

  const overviewError = useMemo(
    () => errors.stats || errors.patients || errors.vitals || "",
    [errors.stats, errors.patients, errors.vitals]
  );

  const selectedVitalWithPatient = useMemo(() => {
    if (!selectedVital) return null;
    return {
      ...selectedVital,
      patientName: getVitalPatientName(selectedVital),
    };
  }, [selectedVital, getVitalPatientName]);

  useEffect(() => {
    if (!toast) return undefined;
    const timerId = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timerId);
  }, [toast]);

  const pushToast = (type, message) => {
    setToast({
      type,
      message,
      id: Date.now(),
    });
  };

  const handleUpdateAppointmentStatus = async (appointment, nextStatus) => {
    if (!appointment?.dbId) {
      pushToast("error", "Unable to update appointment: missing database identifier.");
      return;
    }

    setUpdatingAppointmentId(appointment.dbId);

    const result = await updateAppointmentStatus(appointment.dbId, {
      status: nextStatus,
      assigned_staff: appointment.assignedStaff || "Admin Staff",
      notes: appointment.notes || appointment.requestedNotes || "",
    });

    setUpdatingAppointmentId(null);

    if (result.ok) {
      pushToast("success", `Appointment marked as ${nextStatus}.`);
      return;
    }

    pushToast("error", result.error || "Failed to update appointment status.");
  };

  const handleAddPatientSubmit = async (form) => {
    setPatientSubmitState({ loading: true, error: "" });

    const result = await createPatient({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      date_of_birth: form.date_of_birth,
      sex: form.gender,
      address: form.address,
      barangay: "Unknown",
      source_document_url: form.sourceDocumentUrl || null,
    });

    if (result.ok) {
      setShowAddPatientModal(false);
      setPatientSubmitState({ loading: false, error: "" });
      pushToast("success", "Patient added successfully.");
      return;
    }

    setPatientSubmitState({
      loading: false,
      error: result.error || "Failed to add patient",
    });
  };

  const handleEditPatientSubmit = async (form) => {
    if (!editingPatient) return;

    setPatientSubmitState({ loading: true, error: "" });

    const result = await updatePatient(editingPatient.dbId, {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      date_of_birth: form.date_of_birth,
      sex: form.gender,
      address: form.address,
      source_document_url: form.sourceDocumentUrl || null,
    });

    if (result.ok) {
      setShowEditPatientModal(false);
      setEditingPatient(null);
      setPatientSubmitState({ loading: false, error: "" });
      pushToast("success", "Patient details updated.");
      return;
    }

    setPatientSubmitState({
      loading: false,
      error: result.error || "Failed to update patient",
    });
  };

  const handleNotifyPatientSubmit = async (form) => {
    setNotifySubmitState({ loading: true, error: "" });

    const result = await sendNotification(form);

    if (result.ok) {
      setShowNotifyPatientModal(false);
      setNotifyingPatient(null);
      setNotifySubmitState({ loading: false, error: "" });
      pushToast("success", "SMS Notification sent successfully.");
      return;
    }

    setNotifySubmitState({
      loading: false,
      error: result.error || "Failed to send SMS",
    });
  };

  const handleAddVitalSubmit = async (form) => {
    const selectedPatient = patients.find((patient) => patient.id === form.patientId);
    if (!selectedPatient) {
      setVitalSubmitState({
        loading: false,
        error: "Please select a valid patient",
      });
      return;
    }

    setVitalSubmitState({ loading: true, error: "" });

    const result = await createVital({
      patient_id: selectedPatient.dbId,
      date: form.date,
      time: form.time,
      systolic: safeParseInt(form.systolic),
      diastolic: safeParseInt(form.diastolic),
      heart_rate: safeParseInt(form.heartRate),
      temperature: safeParseFloat(form.temperature),
      spo2: safeParseInt(form.spO2),
      respiratory_rate: safeParseInt(form.respiratoryRate),
      weight: safeParseFloat(form.weight),
      height: safeParseFloat(form.height),
      source_document_url: form.sourceDocumentUrl || null,
    });

    if (result.ok) {
      setShowAddVitalModal(false);
      setVitalSubmitState({ loading: false, error: "" });
      pushToast("success", "Vital signs recorded successfully.");
      return;
    }

    setVitalSubmitState({
      loading: false,
      error: result.error || "Failed to save vital signs",
    });
  };

  const handleViewPatientVitals = (patient) => {
    const latestVital = [...vitalSigns]
      .filter((vital) => vital.patientId === patient.id)
      .sort(
        (a, b) =>
          new Date(`${b.date} ${b.time}`).getTime() -
          new Date(`${a.date} ${a.time}`).getTime()
      )[0];

    if (!latestVital) {
      pushToast("info", "No vital signs recorded for this patient yet.");
      return;
    }

    setSelectedVital(latestVital);
    setShowViewVitalModal(true);
  };

  const handleRequestDeletePatient = (patient) => {
    setDeleteDialog({
      type: "patient",
      item: patient,
    });
  };

  const handleRequestDeleteVital = (vital) => {
    setDeleteDialog({
      type: "vital",
      item: vital,
    });
  };

  const closeDeleteDialog = () => {
    if (deleteSubmitting) return;
    setDeleteDialog({ type: "", item: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;

    setDeleteSubmitting(true);

    if (deleteDialog.type === "patient") {
      if (!deleteDialog.item.dbId) {
        setDeleteSubmitting(false);
        setDeleteDialog({ type: "", item: null });
        pushToast("error", "Unable to delete patient: missing database identifier.");
        return;
      }

      const result = await deletePatient(deleteDialog.item.dbId);
      setDeleteSubmitting(false);

      if (result.ok) {
        setDeleteDialog({ type: "", item: null });
        pushToast("success", "Patient deleted successfully.");
      } else {
        pushToast("error", result.error || "Failed to delete patient");
      }
      return;
    }

    if (deleteDialog.type === "vital") {
      if (!deleteDialog.item.dbId) {
        setDeleteSubmitting(false);
        setDeleteDialog({ type: "", item: null });
        pushToast("error", "Unable to delete vital record: missing database identifier.");
        return;
      }

      const result = await deleteVital(deleteDialog.item.dbId);
      setDeleteSubmitting(false);

      if (result.ok) {
        setDeleteDialog({ type: "", item: null });
        pushToast("success", "Vital record deleted successfully.");
      } else {
        pushToast("error", result.error || "Failed to delete vital record");
      }
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{pageTitle}</h1>
            <p className="topbar-subtitle">
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="topbar-right">
            <AdminNotificationsDropdown />
            <AdminProfileLink />
          </div>
        </header>

        <main className="admin-body">
          {activeNav === "dashboard" && (
            <PanelErrorBoundary
              title="Overview panel failed"
              onReset={() => {
                refreshPatients();
                refreshVitals();
                refreshAppointments();
                refreshStats();
              }}
            >
              <OverviewPanel
                statsSummary={statsSummary}
                bpTrendData={bpTrendData}
                registrationsData={registrationsData}
                patients={patients}
                appointmentsQueue={appointmentsQueue}
                getPatientLatestVitals={getPatientLatestVitals}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                updatingAppointmentId={updatingAppointmentId}
                onViewAllPatients={() => setActiveNav("patients")}
                isLoading={loading.stats || loading.patients || loading.vitals}
                error={overviewError}
                appointmentsLoading={loading.appointments}
                appointmentsError={errors.appointments}
                onRetry={() => {
                  refreshPatients();
                  refreshVitals();
                  refreshAppointments();
                  refreshStats();
                }}
              />
            </PanelErrorBoundary>
          )}

          {activeNav === "patients" && (
            <PanelErrorBoundary
              title="Patients panel failed"
              onReset={() => {
                refreshPatients();
                refreshVitals();
              }}
            >
              <PatientsPanel
                patients={patients}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                getPatientLatestVitals={getPatientLatestVitals}
                onOpenAddPatient={() => {
                  setPatientSubmitState({ loading: false, error: "" });
                  setShowAddPatientModal(true);
                }}
                onOpenEditPatient={(patient) => {
                  setEditingPatient(patient);
                  setPatientSubmitState({ loading: false, error: "" });
                  setShowEditPatientModal(true);
                }}
                onDeletePatient={handleRequestDeletePatient}
                onViewPatientVitals={handleViewPatientVitals}
                onNotifyPatient={(patient) => {
                  setNotifyingPatient(patient);
                  setNotifySubmitState({ loading: false, error: "" });
                  setShowNotifyPatientModal(true);
                }}
                onOpenTestNotify={() => {
                  setNotifyingPatient(null);
                  setNotifySubmitState({ loading: false, error: "" });
                  setShowNotifyPatientModal(true);
                }}
                isLoading={loading.patients || loading.vitals}
                error={errors.patients || errors.vitals}
                onRetry={() => {
                  refreshPatients();
                  refreshVitals();
                }}
              />
            </PanelErrorBoundary>
          )}

          {activeNav === "records" && (
            <PanelErrorBoundary
              title="Vitals panel failed"
              onReset={() => {
                refreshVitals();
                refreshStats();
              }}
            >
              <VitalsPanel
                vitalSigns={vitalSigns}
                bpTrendData={bpTrendData}
                getVitalPatientName={getVitalPatientName}
                onOpenAddVital={() => {
                  setVitalSubmitState({ loading: false, error: "" });
                  setShowAddVitalModal(true);
                }}
                onDeleteVital={handleRequestDeleteVital}
                onViewVital={(vital) => {
                  setSelectedVital(vital);
                  setShowViewVitalModal(true);
                }}
                isLoading={loading.vitals}
                error={errors.vitals}
                isStatsLoading={loading.stats}
                statsError={errors.stats}
                onRetryVitals={refreshVitals}
                onRetryStats={refreshStats}
              />
            </PanelErrorBoundary>
          )}
        </main>
      </div>

      {showAddPatientModal && (
        <PatientModal
          isOpen={showAddPatientModal}
          mode="add"
          initialData={null}
          onClose={() => {
            setShowAddPatientModal(false);
            setPatientSubmitState({ loading: false, error: "" });
          }}
          onSubmit={handleAddPatientSubmit}
          isSubmitting={patientSubmitState.loading}
          submitError={patientSubmitState.error}
        />
      )}

      {showEditPatientModal && editingPatient && (
        <PatientModal
          isOpen={showEditPatientModal}
          mode="edit"
          initialData={editingPatient}
          onClose={() => {
            setShowEditPatientModal(false);
            setEditingPatient(null);
            setPatientSubmitState({ loading: false, error: "" });
          }}
          onSubmit={handleEditPatientSubmit}
          isSubmitting={patientSubmitState.loading}
          submitError={patientSubmitState.error}
        />
      )}

      {showNotifyPatientModal && (
        <NotifyPatientModal
          isOpen={showNotifyPatientModal}
          patient={notifyingPatient}
          onClose={() => {
            setShowNotifyPatientModal(false);
            setNotifyingPatient(null);
            setNotifySubmitState({ loading: false, error: "" });
          }}
          onSubmit={handleNotifyPatientSubmit}
          isSubmitting={notifySubmitState.loading}
          submitError={notifySubmitState.error}
        />
      )}

      {showAddVitalModal && (
        <VitalModal
          isOpen={showAddVitalModal}
          patients={patients}
          onClose={() => {
            setShowAddVitalModal(false);
            setVitalSubmitState({ loading: false, error: "" });
          }}
          onSubmit={handleAddVitalSubmit}
          isSubmitting={vitalSubmitState.loading}
          submitError={vitalSubmitState.error}
        />
      )}

      <VitalDetailsModal
        vital={showViewVitalModal ? selectedVitalWithPatient : null}
        onClose={() => {
          setShowViewVitalModal(false);
          setSelectedVital(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteDialog.item)}
        title={
          deleteDialog.type === "patient"
            ? "Delete patient"
            : "Delete vital record"
        }
        description={
          deleteDialog.type === "patient"
            ? `Delete ${deleteDialog.item?.firstName || ""} ${deleteDialog.item?.lastName || ""} and all related vital records?`
            : `Delete the vital record from ${deleteDialog.item?.date || "N/A"} ${deleteDialog.item?.time || ""}?`
        }
        confirmLabel={
          deleteDialog.type === "patient" ? "Delete Patient" : "Delete Record"
        }
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
        isSubmitting={deleteSubmitting}
      />

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
