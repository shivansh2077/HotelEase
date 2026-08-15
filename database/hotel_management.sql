CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS rooms;

CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  room_type ENUM('Single', 'Double', 'Suite') NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  status ENUM('available', 'occupied', 'maintenance') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  id_proof_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guest_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('booked', 'checked_in', 'checked_out', 'cancelled')
    NOT NULL DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (guest_id) REFERENCES guests(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

INSERT INTO rooms (room_number, room_type, price_per_night, status) VALUES
('101', 'Single', 1500.00, 'available'),
('102', 'Single', 1500.00, 'available'),
('103', 'Single', 1500.00, 'available'),
('201', 'Double', 2500.00, 'available'),
('202', 'Double', 2500.00, 'available'),
('203', 'Double', 2500.00, 'available'),
('301', 'Suite', 4500.00, 'available'),
('302', 'Suite', 4500.00, 'available'),
('401', 'Single', 1500.00, 'maintenance'),
('402', 'Double', 2500.00, 'available');

USE hotel_management;

DROP TRIGGER IF EXISTS update_room_status_after_booking_change;

DELIMITER $$

CREATE TRIGGER update_room_status_after_booking_change
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN

    IF NEW.status = 'checked_in' THEN
      UPDATE rooms
      SET status = 'occupied'
      WHERE id = NEW.room_id;

    ELSEIF NEW.status = 'checked_out' THEN
      UPDATE rooms
      SET status = 'available'
      WHERE id = NEW.room_id;

    END IF;

  END IF;
END$$

DELIMITER ;