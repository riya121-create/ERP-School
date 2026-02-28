export const normalizeSubject = (value = "") =>
  value
    .toString()
    .toUpperCase()
    .replace(/\s+/g, "")   // remove spaces
    .replace(/\+/g, "PLUS"); // C++ → CPLUSPLUS
