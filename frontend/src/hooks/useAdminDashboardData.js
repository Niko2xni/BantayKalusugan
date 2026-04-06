import { useCallback, useEffect, useMemo, useState } from "react";

import { adminFetch, AUTH_REDIRECT_ERROR } from "../utils/adminApi";
import { getStatus } from "../components/admin-dashboard/dashboardUtils";

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function safeDatePart(dateValue, fallback = "N/A") {
  if (!dateValue) return fallback;
  const dateObj = new Date(dateValue);
  if (Number.isNaN(dateObj.getTime())) return fallback;
  return dateObj.toISOString().split("T")[0];
}

function safeTimePart(dateValue, fallback = "N/A") {
  if (!dateValue) return fallback;
  const dateObj = new Date(dateValue);
  if (Number.isNaN(dateObj.getTime())) return fallback;
  return dateObj.toTimeString().slice(0, 5);
}

function mapPatient(patient) {
  return {
    id: `P-${String(patient.id).padStart(3, "0")}`,
    dbId: patient.id,
    firstName: patient.first_name,
    lastName: patient.last_name,
    age: calculateAge(patient.date_of_birth),
    gender: patient.sex,
    address: patient.address,
    email: patient.email,
    phone: patient.phone,
    date_of_birth: patient.date_of_birth,
    dateRegistered: safeDatePart(patient.created_at),
  };
}

function mapVital(vital) {
  const sourceDateTime = vital.created_at || `${vital.date || ""} ${vital.time || ""}`;
  return {
    id: `V-${String(vital.id).padStart(3, "0")}`,
    dbId: vital.id,
    patientId: `P-${String(vital.patient_id).padStart(3, "0")}`,
    patientName: vital.patient_name || "Unknown",
    date: safeDatePart(sourceDateTime, vital.date || "N/A"),
    time: safeTimePart(sourceDateTime, vital.time || "N/A"),
    systolic: vital.systolic,
    diastolic: vital.diastolic,
    heartRate: vital.heart_rate,
    temperature: vital.temperature,
    spO2: vital.spo2,
    respiratoryRate: vital.respiratory_rate,
    weight: vital.weight,
    height: vital.height,
    recordedBy: vital.recorded_by || "Admin Staff",
  };
}

async function readErrorMessage(response, fallback) {
  try {
    const payload = await response.json();
    return payload.detail || fallback;
  } catch {
    return fallback;
  }
}

export default function useAdminDashboardData() {
  const [patients, setPatients] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [bpTrendData, setBpTrendData] = useState([]);
  const [registrationsData, setRegistrationsData] = useState([]);

  const [loading, setLoading] = useState({
    patients: true,
    vitals: true,
    stats: true,
  });

  const [errors, setErrors] = useState({
    patients: "",
    vitals: "",
    stats: "",
  });

  const refreshPatients = useCallback(async () => {
    setLoading((prev) => ({ ...prev, patients: true }));
    setErrors((prev) => ({ ...prev, patients: "" }));

    try {
      const response = await adminFetch("/api/patients/");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to fetch patients"));
      }

      const data = await response.json();
      setPatients((data || []).map(mapPatient));
    } catch (error) {
      if (error.message !== AUTH_REDIRECT_ERROR) {
        setErrors((prev) => ({ ...prev, patients: error.message || "Failed to fetch patients" }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, patients: false }));
    }
  }, []);

  const refreshVitals = useCallback(async () => {
    setLoading((prev) => ({ ...prev, vitals: true }));
    setErrors((prev) => ({ ...prev, vitals: "" }));

    try {
      const response = await adminFetch("/api/vitals/");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to fetch vital signs"));
      }

      const data = await response.json();
      setVitalSigns((data || []).map(mapVital));
    } catch (error) {
      if (error.message !== AUTH_REDIRECT_ERROR) {
        setErrors((prev) => ({ ...prev, vitals: error.message || "Failed to fetch vital signs" }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, vitals: false }));
    }
  }, []);

  const refreshStats = useCallback(async () => {
    setLoading((prev) => ({ ...prev, stats: true }));
    setErrors((prev) => ({ ...prev, stats: "" }));

    try {
      const response = await adminFetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to fetch dashboard stats"));
      }

      const data = await response.json();
      setBpTrendData(data.bp_trends || []);
      setRegistrationsData(data.registrations || []);
    } catch (error) {
      if (error.message !== AUTH_REDIRECT_ERROR) {
        setErrors((prev) => ({ ...prev, stats: error.message || "Failed to fetch dashboard stats" }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  useEffect(() => {
    refreshPatients();
    refreshVitals();
    refreshStats();
  }, [refreshPatients, refreshVitals, refreshStats]);

  const createPatient = useCallback(
    async (payload) => {
      try {
        const response = await adminFetch("/api/patients/", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          return {
            ok: false,
            error: await readErrorMessage(response, "Failed to add patient"),
          };
        }

        await Promise.all([refreshPatients(), refreshStats()]);
        return { ok: true };
      } catch (error) {
        if (error.message === AUTH_REDIRECT_ERROR) {
          return { ok: false, error: "Session expired. Please sign in again." };
        }
        return { ok: false, error: error.message || "Failed to add patient" };
      }
    },
    [refreshPatients, refreshStats]
  );

  const updatePatient = useCallback(
    async (dbId, payload) => {
      try {
        const response = await adminFetch(`/api/patients/${dbId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          return {
            ok: false,
            error: await readErrorMessage(response, "Failed to update patient"),
          };
        }

        await refreshPatients();
        return { ok: true };
      } catch (error) {
        if (error.message === AUTH_REDIRECT_ERROR) {
          return { ok: false, error: "Session expired. Please sign in again." };
        }
        return { ok: false, error: error.message || "Failed to update patient" };
      }
    },
    [refreshPatients]
  );

  const deletePatient = useCallback(
    async (dbId) => {
      try {
        const response = await adminFetch(`/api/patients/${dbId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          return {
            ok: false,
            error: await readErrorMessage(response, "Failed to delete patient"),
          };
        }

        await Promise.all([refreshPatients(), refreshVitals(), refreshStats()]);
        return { ok: true };
      } catch (error) {
        if (error.message === AUTH_REDIRECT_ERROR) {
          return { ok: false, error: "Session expired. Please sign in again." };
        }
        return { ok: false, error: error.message || "Failed to delete patient" };
      }
    },
    [refreshPatients, refreshStats, refreshVitals]
  );

  const createVital = useCallback(
    async (payload) => {
      try {
        const response = await adminFetch("/api/vitals/", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          return {
            ok: false,
            error: await readErrorMessage(response, "Failed to add vital sign"),
          };
        }

        await Promise.all([refreshVitals(), refreshStats()]);
        return { ok: true };
      } catch (error) {
        if (error.message === AUTH_REDIRECT_ERROR) {
          return { ok: false, error: "Session expired. Please sign in again." };
        }
        return { ok: false, error: error.message || "Failed to add vital sign" };
      }
    },
    [refreshVitals, refreshStats]
  );

  const deleteVital = useCallback(
    async (dbId) => {
      try {
        const response = await adminFetch(`/api/vitals/${dbId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          return {
            ok: false,
            error: await readErrorMessage(response, "Failed to delete vital record"),
          };
        }

        await Promise.all([refreshVitals(), refreshStats()]);
        return { ok: true };
      } catch (error) {
        if (error.message === AUTH_REDIRECT_ERROR) {
          return { ok: false, error: "Session expired. Please sign in again." };
        }
        return { ok: false, error: error.message || "Failed to delete vital record" };
      }
    },
    [refreshVitals, refreshStats]
  );

  const getPatientLatestVitals = useCallback(
    (patientId) => {
      const patientVitals = vitalSigns
        .filter((vital) => vital.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(`${b.date} ${b.time}`).getTime() -
            new Date(`${a.date} ${a.time}`).getTime()
        );
      return patientVitals[0];
    },
    [vitalSigns]
  );

  const getVitalPatientName = useCallback(
    (vital) => {
      if (vital.patientName && vital.patientName !== "Unknown") return vital.patientName;
      const patient = patients.find((item) => item.id === vital.patientId);
      return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
    },
    [patients]
  );

  const statsSummary = useMemo(() => {
    const totalPatients = patients.length;
    const todayDate = new Date().toISOString().split("T")[0];
    const bpRecordsToday = vitalSigns.filter((vital) => vital.date === todayDate).length;

    let highRiskCount = 0;
    let normalCount = 0;

    patients.forEach((patient) => {
      const latestVitals = getPatientLatestVitals(patient.id);
      if (!latestVitals) return;

      const status = getStatus(latestVitals.systolic, latestVitals.diastolic);
      if (status === "High Risk") highRiskCount += 1;
      if (status === "Normal") normalCount += 1;
    });

    return {
      totalPatients,
      bpRecordsToday,
      highRiskCount,
      normalCount,
    };
  }, [patients, vitalSigns, getPatientLatestVitals]);

  return {
    patients,
    vitalSigns,
    bpTrendData,
    registrationsData,
    loading,
    errors,
    statsSummary,
    refreshPatients,
    refreshVitals,
    refreshStats,
    createPatient,
    updatePatient,
    deletePatient,
    createVital,
    deleteVital,
    getPatientLatestVitals,
    getVitalPatientName,
  };
}
