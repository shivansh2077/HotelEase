const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const [[roomStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalRooms,
        SUM(status = 'available') AS availableRooms,
        SUM(status = 'occupied') AS occupiedRooms,
        SUM(status = 'maintenance') AS maintenanceRooms
      FROM rooms
    `);

    const [[bookingStats]] = await pool.query(`
      SELECT COUNT(*) AS activeBookings
      FROM bookings
      WHERE status IN ('booked', 'checked_in')
    `);

    const [recentBookings] = await pool.query(`
      SELECT
        bookings.id,
        bookings.check_in_date,
        bookings.check_out_date,
        bookings.status,
        guests.full_name,
        rooms.room_number
      FROM bookings
      JOIN guests ON bookings.guest_id = guests.id
      JOIN rooms ON bookings.room_id = rooms.id
      ORDER BY bookings.created_at DESC
      LIMIT 5
    `);

    res.json({
      ...roomStats,
      ...bookingStats,
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch dashboard data." });
  }
});

module.exports = router;