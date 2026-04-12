export function getStatus(systolic, diastolic) {
  if (systolic >= 140 || diastolic >= 90) return "High Risk";
  if (systolic >= 130 || diastolic >= 85) return "Hypertensive";
  return "Normal";
}

export function calculateBMI(weight, heightCm) {
  if (!weight || !heightCm || heightCm <= 0) return "N/A";
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  return bmi.toFixed(1);
}

export function getStatusStyle(status) {
  const styles = {
    Normal: { bg: "rgba(46,88,149,0.1)", text: "#2E5895" },
    Hypertensive: { bg: "rgba(255,195,43,0.15)", text: "#b8820a" },
    "High Risk": { bg: "rgba(194,59,33,0.1)", text: "#C23B21" },
    "No Data": { bg: "rgba(160,160,160,0.15)", text: "#6b7280" },
  };
  return styles[status] || styles["No Data"];
}
