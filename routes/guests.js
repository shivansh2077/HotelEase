const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [guests] = await pool.query(
      "SELECT * FROM guests ORDER BY created_at DESC"
    );

    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch guests." });
  }
});

router.post("/", async (req, res) => {
  const { fullName, phone, email, address, idProofNumber } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({
      message: "Guest name and phone number are required."
    });
  }

  try {
    const [result] = await pool.query(
      `
        INSERT INTO guests
        (full_name, phone, email, address, id_proof_number)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        fullName.trim(),
        phone.trim(),
        email?.trim() || null,
        address?.trim() || null,
        idProofNumber?.trim() || null
      ]
    );

    res.status(201).json({
      message: "Guest added successfully.",
      guestId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: "Could not add guest." });
  }
});

module.exports = router;