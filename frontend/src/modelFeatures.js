/**
 * Must match `feature_names_in_` on the trained StandardScaler inside
 * `models/full_pipeline.pkl` (order and count). Do not add/remove/reorder
 * without retraining the model artifact.
 */
export const MODEL_FEATURES = [
  { key: "age", label: "Age", type: "number", step: "1", hint: "Years" },
  { key: "sex", label: "Sex", type: "select", options: [
    { value: "0", label: "Female (0)" },
    { value: "1", label: "Male (1)" },
  ]},
  { key: "cp", label: "Chest pain type (cp)", type: "select", options: [
    { value: "0", label: "Typical angina (0)" },
    { value: "1", label: "Atypical angina (1)" },
    { value: "2", label: "Non-anginal pain (2)" },
    { value: "3", label: "Asymptomatic (3)" },
  ]},
  { key: "trestbps", label: "Resting blood pressure (trestbps)", type: "number", hint: "mm Hg at rest" },
  { key: "chol", label: "Serum cholesterol (chol)", type: "number", hint: "mg/dl" },
  { key: "fbs", label: "Fasting blood sugar > 120 mg/dl (fbs)", type: "select", options: [
    { value: "0", label: "No (0)" },
    { value: "1", label: "Yes (1)" },
  ]},
  { key: "restecg", label: "Resting ECG (restecg)", type: "select", options: [
    { value: "0", label: "Normal (0)" },
    { value: "1", label: "ST-T abnormality (1)" },
    { value: "2", label: "Left ventricular hypertrophy (2)" },
  ]},
  { key: "thalach", label: "Max heart rate achieved (thalach)", type: "number", hint: "BPM" },
  { key: "exang", label: "Exercise induced angina (exang)", type: "select", options: [
    { value: "0", label: "No (0)" },
    { value: "1", label: "Yes (1)" },
  ]},
  { key: "oldpeak", label: "ST depression (oldpeak)", type: "number", step: "0.1", hint: "Depression vs rest" },
  { key: "slope", label: "Slope of ST segment (slope)", type: "select", options: [
    { value: "0", label: "Upsloping (0)" },
    { value: "1", label: "Flat (1)" },
    { value: "2", label: "Downsloping (2)" },
  ]},
];

export const initialModelFormState = () =>
  MODEL_FEATURES.reduce((acc, f) => {
    if (f.type === "select" && f.options?.length) {
      acc[f.key] = f.options[0].value;
    } else {
      acc[f.key] = "";
    }
    return acc;
  }, {});
