const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT
        bookings.id,
        bookings.check_in_date,
        bookings.check_out_date,
        bookings.total_amount,
        bookings.status,
        bookings.created_at,
        guests.full_name,
        guests.phone,
        rooms.room_number,
        rooms.room_type
      FROM bookings
      JOIN guests ON bookings.guest_id = guests.id
      JOIN rooms ON bookings.room_id = rooms.id
      ORDER BY bookings.created_at DESC
    `);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch bookings." });
  }
});

router.post("/", async (req, res) => {
  const { guestId, roomId, checkInDate, checkOutDate } = req.body;

  if (!guestId || !roomId || !checkInDate || !checkOutDate) {
    return res.status(400).json({
      message: "Guest, room, check-in date, and check-out date are required."
    });
  }

  const checkIn = new Date(`${checkInDate}T00:00:00`);
  const checkOut = new Date(`${checkOutDate}T00:00:00`);
  const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

  if (!Number.isInteger(nights) || nights <= 0) {
    return res.status(400).json({
      message: "Check-out date must be after check-in date."
    });
  }

  try {
    const [roomRows] = await pool.query(
      "SELECT * FROM rooms WHERE id = ?",
      [roomId]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({ message: "Room not found." });
    }

    const room = roomRows[0];

    if (room.status === "maintenance") {
      return res.status(400).json({
        message: "This room is under maintenance."
      });
    }

    const [overlappingBookings] = await pool.query(
      `
        SELECT id FROM bookings
        WHERE room_id = ?
        AND status IN ('booked', 'checked_in')
        AND check_in_date < ?
        AND check_out_date > ?
      `,
      [roomId, checkOutDate, checkInDate]
    );

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        message: "This room is already booked for the selected dates."
      });
    }

    const totalAmount = nights * Number(room.price_per_night);

    const [result] = await pool.query(
      `
        INSERT INTO bookings
        (guest_id, room_id, check_in_date, check_out_date, total_amount)
        VALUES (?, ?, ?, ?, ?)
      `,
      [guestId, roomId, checkInDate, checkOutDate, totalAmount]
    );

    res.status(201).json({
      message: "Booking created successfully.",
      bookingId: result.insertId,
      totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create booking." });
  }
});

router.put("/:id/check-in", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.query(
      "SELECT * FROM bookings WHERE id = ?",
      [req.params.id]
    );

    if (bookingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = bookingRows[0];

    if (booking.status !== "booked") {
      await connection.rollback();
      return res.status(400).json({
        message: "Only a booked reservation can be checked in."
      });
    }

    await connection.query(
      "UPDATE bookings SET status = 'checked_in' WHERE id = ?",
      [req.params.id]
    );
  
await connection.commit();
res.json({ message: "Guest checked in successfully." }); 

    // await connection.query(
    //   "UPDATE rooms SET status = 'occupied' WHERE id = ?",
    //   [booking.room_id]
    // );
//    await connection.query(
//   "UPDATE bookings SET status = 'checked_in' WHERE id = ?",
//   [req.params.id]
// );

//     await connection.commit();
//     res.json({ message: "Guest checked in successfully." });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Could not check in guest." });
  } finally {
    connection.release();
  }
});

router.put("/:id/check-out", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.query(
      "SELECT * FROM bookings WHERE id = ?",
      [req.params.id]
    );

    if (bookingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = bookingRows[0];

    if (booking.status !== "checked_in") {
      await connection.rollback();
      return res.status(400).json({
        message: "Only checked-in guests can be checked out."
      });
    }

    await connection.query(
      "UPDATE bookings SET status = 'checked_out' WHERE id = ?",
      [req.params.id]
    );

    // await connection.query(
    //   "UPDATE rooms SET status = 'available' WHERE id = ?",
    //   [booking.room_id]
    // );
//   await connection.query(
//   "UPDATE bookings SET status = 'checked_out' WHERE id = ?",
//   [req.params.id]
// );

// await connection.commit();
// res.json({ message: "Guest checked out successfully." });
    await connection.commit();
    res.json({ message: "Guest checked out successfully." });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Could not check out guest." });
  } finally {
    connection.release();
  }
});

router.put("/:id/cancel", async (req, res) => {
  try {
    const [result] = await pool.query(
      `
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = ? AND status = 'booked'
      `,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Only booked reservations can be cancelled."
      });
    }

    res.json({ message: "Booking cancelled successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not cancel booking." });
  }
});

module.exports = router;