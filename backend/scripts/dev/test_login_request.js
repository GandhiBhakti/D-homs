const http = require("http");

const doRequest = (port, path, method = "GET", body = null) =>
  new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (body) {
      options.headers["Content-Length"] = Buffer.byteLength(body);
    }
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    req.on("error", (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });

(async () => {
  const body = JSON.stringify({
    email: "admin@hospital.com",
    password: "admin123",
  });
  for (const port of [5000, 5001]) {
    try {
      const root = await doRequest(port, "/");
      console.log(`PORT ${port} ROOT ${root.statusCode}`, root.body);
    } catch (err) {
      console.error(`PORT ${port} ROOT ERR`, err.message);
    }
    try {
      const auth = await doRequest(port, "/api/auth/login", "POST", body);
      console.log(`PORT ${port} LOGIN ${auth.statusCode}`, auth.body);
    } catch (err) {
      console.error(`PORT ${port} LOGIN ERR`, err.message);
    }
  }
})();
