const http = require("http");

const doRequest = (options, body) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
};

(async () => {
  try {
    const root = await doRequest({
      host: "localhost",
      port: 5000,
      path: "/",
      method: "GET",
    });
    console.log("ROOT", root.statusCode, root.body);
  } catch (err) {
    console.error("ROOT_ERROR", err.message);
  }

  try {
    const deps = await doRequest({
      host: "localhost",
      port: 5000,
      path: "/api/departments",
      method: "GET",
    });
    console.log("DEPARTMENTS", deps.statusCode, deps.body.slice(0, 1000));
  } catch (err) {
    console.error("DEPARTMENTS_ERROR", err.message);
  }

  try {
    const docs = await doRequest({
      host: "localhost",
      port: 5000,
      path: "/api/doctors",
      method: "GET",
    });
    console.log("DOCTORS", docs.statusCode, docs.body.slice(0, 1000));
  } catch (err) {
    console.error("DOCTORS_ERROR", err.message);
  }

  const payload = JSON.stringify({
    patient_first_name: "Test",
    patient_last_name: "User",
    phone: "9999999999",
    email: "test@hospital.com",
    department_id: 1,
    doctor_id: 8,
    chief_complaints: "Fever",
    diagnosis: "Viral",
    notes: "Testing OPD API",
  });

  try {
    const opd = await doRequest(
      {
        host: "localhost",
        port: 5000,
        path: "/api/opd",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      payload,
    );
    console.log("OPD_POST", opd.statusCode, opd.body);
  } catch (err) {
    console.error("OPD_POST_ERROR", err.message);
  }
})();
