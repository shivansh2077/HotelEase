require("dotenv").config();

const express = require("express");
const path = require("path");

const roomRoutes = require("./routes/rooms");
const guestRoutes = require("./routes/guests");
const bookingRoutes = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/api/ping", (req, res) => {
  res.json({
    ok: true,
    message: "Express server is running on Vercel"
  });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/rooms", roomRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/test-db", async (req, res) => {
  try {
    const [[result]] = await pool.query(
      "SELECT DATABASE() AS databaseName, VERSION() AS mysqlVersion"
    );

    res.json({
      ok: true,
      database: result.databaseName,
      mysqlVersion: result.mysqlVersion
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      errorCode: error.code || "UNKNOWN_ERROR",
      errorName: error.name
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HotelEase is running at http://localhost:${PORT}`);
  });
}

module.exports = app;

// require("dotenv").config();

// const express = require("express");
// app.get("/api/ping", (req, res) => {
//   res.json({ ok: true, message: "Express server is running on Vercel" });
// });
// const path = require("path");

// const roomRoutes = require("./routes/rooms");
// const guestRoutes = require("./routes/guests");
// const bookingRoutes = require("./routes/bookings");
// const dashboardRoutes = require("./routes/dashboard");
// const pool = require("./config/db");

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));

// app.use("/api/rooms", roomRoutes);
// app.use("/api/guests", guestRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// app.get("/api/test-db", async (req, res) => {
//   try {
//     const [[result]] = await pool.query(
//       "SELECT DATABASE() AS databaseName, VERSION() AS mysqlVersion"
//     );

//     res.json({
//       ok: true,
//       database: result.databaseName,
//       mysqlVersion: result.mysqlVersion
//     });
//   } catch (error) {
//     res.status(500).json({
//       ok: false,
//       errorCode: error.code || "UNKNOWN_ERROR",
//       errorName: error.name
//     });
//   }
// });

// // app.listen(PORT, () => {
// //   console.log(`HotelEase is running at http://localhost:${PORT}`);
// // });
// if (require.main === module) {
//   app.listen(PORT, () => {
//     console.log(`HotelEase is running at http://localhost:${PORT}`);
//   });
// }

// module.exports = app;
