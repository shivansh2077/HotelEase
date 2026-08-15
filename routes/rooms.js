const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rooms] = await pool.query(
      "SELECT * FROM rooms ORDER BY room_number"
    );

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch rooms." });
  }
});

router.get("/available", async (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({
      message: "Check-in and check-out dates are required."
    });
  }

  try {
    const [rooms] = await pool.query(
      `
       SELECT * FROM rooms
        WHERE status = 'available'
        AND id NOT IN ( 
          SELECT room_id
          FROM bookings
          WHERE status IN ('booked', 'checked_in')
          AND check_in_date < ?
          AND check_out_date > ?
        )
        ORDER BY room_number
      `,
      [checkOut, checkIn]
    );

    res.json(rooms);
//   } catch (error) {
//     res.status(500).json({ message: "Could not find available rooms." });
//   }
// });
  } catch (error) {
  console.error("GET /api/rooms failed:", error);
  res.status(500).json({ message: "Could not fetch rooms." });
}
});
router.put("/:id/status", async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["available", "occupied", "maintenance"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid room status." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE rooms SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found." });
    }

    res.json({ message: "Room status updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not update room status." });
  }
});

module.exports = router;
