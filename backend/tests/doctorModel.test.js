const test = require("node:test");
const assert = require("node:assert/strict");
const Doctor = require("../models/Doctor");

test("normalizeDoctorPayload converts empty values safely for database writes", () => {
  const normalized = Doctor.normalizeDoctorPayload({
    user_id: "",
    department_id: "",
    designation_id: "",
    experience_years: "",
    consultation_fee: "",
    is_available: "false",
    first_name: "  John  ",
    last_name: "  Doe  ",
    email: "john@example.com",
  });

  assert.equal(normalized.user_id, null);
  assert.equal(normalized.department_id, null);
  assert.equal(normalized.designation_id, null);
  assert.equal(normalized.experience_years, null);
  assert.equal(normalized.consultation_fee, null);
  assert.equal(normalized.is_available, false);
  assert.equal(normalized.first_name, "John");
  assert.equal(normalized.last_name, "Doe");
  assert.equal(normalized.email, "john@example.com");
});
