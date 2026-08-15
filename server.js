require("dotenv").config();

const express = require("express");
const path = require("path");

const roomRoutes = require("./routes/rooms");
const guestRoutes = require("./routes/guests");
const bookingRoutes = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/rooms", roomRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

// app.listen(PORT, () => {
//   console.log(`HotelEase is running at http://localhost:${PORT}`);
// });
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`HotelEase is running at http://localhost:${PORT}`);
  });
}

module.exports = app;