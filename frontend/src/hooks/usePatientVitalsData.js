import { useCallback, useEffect, useState } from "react";

import { AUTH_REDIRECT_ERROR, userFetch } from "../utils/userApi";

function buildQueryString({ skip = 0, limit = 500, dateStart = "", dateEnd = "" } = {}) {
  const params = new URLSearchParams();
  params.set("skip", String(skip));
  params.set("limit", String(limit));

  if (dateStart) {
    params.set("date_start", dateStart);
  }

  if (dateEnd) {
    params.set("date_end", dateEnd);
  }

  return params.toString();
}


function buildExportQueryString({ dateStart = "", dateEnd = "", format = "csv" } = {}) {
  const params = new URLSearchParams();
  params.set("format", format);

  if (dateStart) {
    params.set("date_start", dateStart);
  }

  if (dateEnd) {
    params.set("date_end", dateEnd);
  }

  return params.toString();
}

export default function usePatientVitalsData(initialFilters = {}) {
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 500,
    dateStart: "",
    dateEnd: "",
    ...initialFilters,
  });
  const [vitals, setVitals] = useState([]);
  const [latestVital, setLatestVital] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVitalsData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const filterQuery = buildQueryString(filters);
      const overviewQuery = buildQueryString({
        dateStart: filters.dateStart,
        dateEnd: filters.dateEnd,
        skip: 0,
        limit: 1,
      });

      const [vitalsResponse, latestResponse, overviewResponse] = await Promise.all([
        userFetch(`/api/me/vitals?${filterQuery}`),
        userFetch("/api/me/vitals/latest"),
        userFetch(`/api/me/analytics/overview?${overviewQuery}`),
      ]);

      if (!vitalsResponse.ok) {
        const payload = await vitalsResponse.json().catch(() => ({}));
        throw new Error(payload.detail || "Unable to load vital records.");
      }
      if (!latestResponse.ok) {
        const payload = await latestResponse.json().catch(() => ({}));
        throw new Error(payload.detail || "Unable to load latest vital record.");
      }
      if (!overviewResponse.ok) {
        const payload = await overviewResponse.json().catch(() => ({}));
        throw new Error(payload.detail || "Unable to load analytics overview.");
      }

      const [vitalsPayload, latestPayload, overviewPayload] = await Promise.all([
        vitalsResponse.json(),
        latestResponse.json(),
        overviewResponse.json(),
      ]);

      setVitals(Array.isArray(vitalsPayload) ? vitalsPayload : []);
      setLatestVital(latestPayload || null);
      setOverview(overviewPayload || null);
    } catch (loadError) {
      if (loadError instanceof Error && loadError.message === AUTH_REDIRECT_ERROR) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your vital records right now."
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadVitalsData();
  }, [loadVitalsData]);

  const exportVitalsFile = useCallback(async (format = "csv") => {
    const normalizedFormat = format === "pdf" ? "pdf" : "csv";
    const query = buildExportQueryString({
      dateStart: filters.dateStart,
      dateEnd: filters.dateEnd,
      format: normalizedFormat,
    });

    const response = await userFetch(`/api/me/vitals/export?${query}`);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || "Unable to export vitals.");
    }

    const csvBlob = await response.blob();
    const objectUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement("a");

    const disposition = response.headers.get("content-disposition") || "";
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
    const fallbackFilename = `my-vitals-${new Date().toISOString().split("T")[0]}.${normalizedFormat}`;

    link.href = objectUrl;
    link.download = filenameMatch?.[1] || fallbackFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }, [filters.dateEnd, filters.dateStart]);


  const exportVitalsCsv = useCallback(async () => {
    await exportVitalsFile("csv");
  }, [exportVitalsFile]);


  const exportVitalsPdf = useCallback(async () => {
    await exportVitalsFile("pdf");
  }, [exportVitalsFile]);

  return {
    vitals,
    latestVital,
    overview,
    loading,
    error,
    filters,
    setFilters,
    reloadVitalsData: loadVitalsData,
    exportVitalsFile,
    exportVitalsCsv,
    exportVitalsPdf,
  };
}
