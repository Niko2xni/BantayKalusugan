const DAY_IN_MS = 24 * 60 * 60 * 1000;

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDateTime(dateValue, timeValue = "00:00") {
  return new Date(`${dateValue}T${timeValue}`);
}

export function calculateBmi(weightKg, heightCm) {
  const weight = safeNumber(weightKg, 0);
  const height = safeNumber(heightCm, 0);
  if (!weight || !height) {
    return null;
  }

  const heightMeters = height / 100;
  if (!heightMeters) {
    return null;
  }

  return weight / (heightMeters * heightMeters);
}

export function getVitalStatus(type, value) {
  if (type === "bloodPressure") {
    const [systolic, diastolic] = String(value)
      .split("/")
      .map((part) => safeNumber(part, 0));

    if (systolic >= 140 || diastolic >= 90) {
      return "Abnormal";
    }
    if (systolic >= 120 || diastolic >= 80) {
      return "Elevated";
    }
    return "Normal";
  }

  const numeric = safeNumber(value, 0);

  if (type === "heartRate") {
    if (numeric < 60 || numeric > 100) {
      return "Abnormal";
    }
    if (numeric > 90) {
      return "Elevated";
    }
    return "Normal";
  }

  if (type === "temperature") {
    if (numeric >= 38 || numeric < 35) {
      return "Abnormal";
    }
    if (numeric >= 37.5) {
      return "Elevated";
    }
    return "Normal";
  }

  if (type === "spO2") {
    if (numeric < 92) {
      return "Abnormal";
    }
    if (numeric < 95) {
      return "Elevated";
    }
    return "Normal";
  }

  if (type === "respRate") {
    if (numeric < 12 || numeric > 25) {
      return "Abnormal";
    }
    if (numeric > 20) {
      return "Elevated";
    }
    return "Normal";
  }

  if (type === "bmi") {
    if (numeric >= 30) {
      return "Abnormal";
    }
    if (numeric >= 25 || numeric < 18.5) {
      return "Elevated";
    }
    return "Normal";
  }

  return "Normal";
}

export function getStatusColors(status) {
  if (status === "Elevated") {
    return { bgColor: "#fef3c7", color: "#d97706" };
  }
  if (status === "Abnormal") {
    return { bgColor: "#fee2e2", color: "#dc2626" };
  }
  return { bgColor: "#d1fae5", color: "#10b981" };
}

export function formatDisplayDate(isoDate) {
  const parsed = toDateTime(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatChartLabel(isoDate) {
  const parsed = toDateTime(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function mapApiVitalToTableRow(vital) {
  const bmi = calculateBmi(vital.weight, vital.height);

  return {
    id: vital.id,
    dateIso: vital.date,
    date: formatDisplayDate(vital.date),
    bloodPressure: `${safeNumber(vital.systolic, 0)}/${safeNumber(vital.diastolic, 0)}`,
    heartRate: safeNumber(vital.heart_rate, 0),
    temperature: Number(safeNumber(vital.temperature, 0).toFixed(1)),
    spO2: safeNumber(vital.spo2, 0),
    respRate: safeNumber(vital.respiratory_rate, 0),
    bmi: bmi !== null ? Number(bmi.toFixed(1)) : null,
    visitType: "Check-up",
    staffName: vital.recorded_by || "Admin Staff",
  };
}

export function calculateVitalAverages(vitals) {
  if (!vitals.length) {
    return {
      avgSystolic: 0,
      avgDiastolic: 0,
      avgHeartRate: 0,
      avgTemp: 0,
      avgSpO2: 0,
      avgBMI: 0,
    };
  }

  const sums = vitals.reduce(
    (acc, vital) => {
      const bmi = calculateBmi(vital.weight, vital.height);

      acc.systolic += safeNumber(vital.systolic, 0);
      acc.diastolic += safeNumber(vital.diastolic, 0);
      acc.heartRate += safeNumber(vital.heart_rate, 0);
      acc.temperature += safeNumber(vital.temperature, 0);
      acc.spo2 += safeNumber(vital.spo2, 0);
      acc.bmi += bmi !== null ? bmi : 0;
      acc.bmiCount += bmi !== null ? 1 : 0;
      return acc;
    },
    {
      systolic: 0,
      diastolic: 0,
      heartRate: 0,
      temperature: 0,
      spo2: 0,
      bmi: 0,
      bmiCount: 0,
    }
  );

  const count = vitals.length;
  return {
    avgSystolic: Math.round(sums.systolic / count),
    avgDiastolic: Math.round(sums.diastolic / count),
    avgHeartRate: Math.round(sums.heartRate / count),
    avgTemp: Number((sums.temperature / count).toFixed(1)),
    avgSpO2: Number((sums.spo2 / count).toFixed(1)),
    avgBMI: sums.bmiCount ? Number((sums.bmi / sums.bmiCount).toFixed(1)) : 0,
  };
}

export function buildMetricSeries(vitals) {
  const sorted = [...vitals].sort((a, b) => {
    const aDate = toDateTime(a.date, a.time || "00:00").getTime();
    const bDate = toDateTime(b.date, b.time || "00:00").getTime();
    return aDate - bDate;
  });

  return {
    BP: sorted.map((vital) => ({
      date: formatChartLabel(vital.date),
      timestamp: toDateTime(vital.date, vital.time || "00:00").getTime(),
      systolic: safeNumber(vital.systolic, 0),
      diastolic: safeNumber(vital.diastolic, 0),
    })),
    "Heart Rate": sorted.map((vital) => ({
      date: formatChartLabel(vital.date),
      timestamp: toDateTime(vital.date, vital.time || "00:00").getTime(),
      value: safeNumber(vital.heart_rate, 0),
    })),
    Weight: sorted
      .filter((vital) => safeNumber(vital.weight, 0) > 0)
      .map((vital) => ({
        date: formatChartLabel(vital.date),
        timestamp: toDateTime(vital.date, vital.time || "00:00").getTime(),
        value: Number(safeNumber(vital.weight, 0).toFixed(1)),
      })),
    SpO2: sorted
      .filter((vital) => safeNumber(vital.spo2, 0) > 0)
      .map((vital) => ({
        date: formatChartLabel(vital.date),
        timestamp: toDateTime(vital.date, vital.time || "00:00").getTime(),
        value: safeNumber(vital.spo2, 0),
      })),
  };
}

export function filterMetricDataByRange(metricData, range) {
  if (!metricData.length || range === "All") {
    return metricData;
  }

  const now = Date.now();
  const rangeToDays = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
  };

  const days = rangeToDays[range];
  if (!days) {
    return metricData;
  }

  const cutoff = now - days * DAY_IN_MS;
  return metricData.filter((point) => point.timestamp >= cutoff);
}

export function getDateStartIsoForRange(range) {
  if (range === "All") {
    return "";
  }

  const rangeToDays = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
  };

  const days = rangeToDays[range];
  if (!days) {
    return "";
  }

  const startDate = new Date(Date.now() - days * DAY_IN_MS);
  return startDate.toISOString().split("T")[0];
}
