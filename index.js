const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, "log.txt");

const USERNAME = "gus";
const PASSWORD = "gus";

// middleware to validate username and password from query parameters
const authenticate = (req, res, next) => {
  const { user, pass } = req.query;

  if (user === USERNAME && pass === PASSWORD) {
    return next();
  }

  res.status(403).send("Forbidden: Invalid credentials.");
};

// route 1: /alert - logs the current time to log.txt
app.get("/alert", authenticate, (req, res) => {
  const currentTime = new Date()
    .toLocaleString("pt-br", { timeZone: "America/Sao_Paulo" })
    .replace(",", "");
  fs.appendFile(LOG_FILE, `${currentTime}\n`, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
      return res.status(500).send("Error logging the alert");
    }
    res.send("Alert logged successfully");
  });
});

// route 2: / (homepage) - displays the log.txt content
app.get("/", (req, res) => {
  fs.readFile(LOG_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the log file:", err);
      return res.status(500).send("Error reading the log file");
    }

    const logEntries = data
      .trim()
      .split("\n")
      .filter((e) => e !== ""); // filter is needed otherwise will be [''] if file is empty

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Arduino Door Alert System</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 20px;
          }
          h1 {
            text-align: center;
          }
          table {
            width: 50%;
            margin: 0 auto;
            border-collapse: collapse;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          td {
            width: 50%;
          }
          th, td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #504caf;
            color: white;
          }
          tr:hover {
            background-color: lightgray;
          }
        </style>
      </head>
      <body>
        <h1>Arduino Door Alert System</h1>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            ${logEntries
              .map(
                (entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    res.send(html);
  });
});

app.get("/test", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  // console.log(`Server running at http://localhost:${PORT}`);
  const ipAddress = getLocalIP();
  console.log(`Server running at http://${ipAddress}:${PORT}`);
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost"; // Fallback if no IP address is found
}
