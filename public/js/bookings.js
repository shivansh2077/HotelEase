const bookingForm = document.getElementById("bookingForm");
const guestSelect = document.getElementById("guestId");
const roomSelect = document.getElementById("roomId");
const checkInInput = document.getElementById("checkInDate");
const checkOutInput = document.getElementById("checkOutDate");
const estimatedAmountInput = document.getElementById("estimatedAmount");

let availableRooms = [];

function setMinimumDate() {
  const today = new Date().toISOString().split("T")[0];
  checkInInput.min = today;
  checkOutInput.min = today;
}

async function loadGuestOptions() {
  try {
    const response = await fetch("/api/guests");
    const guests = await response.json();

    guestSelect.innerHTML = `
      <option value="">Select a guest</option>
      ${guests.map((guest) => `
        <option value="${guest.id}">
          ${guest.full_name} — ${guest.phone}
        </option>
      `).join("")}
    `;
  } catch (error) {
    showMessage("bookingMessage", "Could not load guests.", "error");
  }
}

async function findAvailableRooms() {
  const checkIn = checkInInput.value;
  const checkOut = checkOutInput.value;

  if (!checkIn || !checkOut) {
    showMessage("bookingMessage", "Please select both dates.", "error");
    return;
  }

  if (checkOut <= checkIn) {
    showMessage(
      "bookingMessage",
      "Check-out date must be after check-in date.",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(
      `/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`
    );

    availableRooms = await response.json();

    roomSelect.disabled = false;
    roomSelect.innerHTML = `
      <option value="">Select an available room</option>
      ${availableRooms.map((room) => `
        <option value="${room.id}">
          Room ${room.room_number} — ${room.room_type} (${formatMoney(room.price_per_night)}/night)
        </option>
      `).join("")}
    `;

    estimatedAmountInput.value = "₹0.00";

    if (availableRooms.length === 0) {
      showMessage("bookingMessage", "No rooms are available for these dates.", "error");
    } else {
      showMessage("bookingMessage", `${availableRooms.length} room(s) available.`);
    }
  } catch (error) {
    showMessage("bookingMessage", "Could not find rooms.", "error");
  }
}

function updateEstimatedAmount() {
  const room = availableRooms.find(
    (item) => item.id === Number(roomSelect.value)
  );

  const checkIn = new Date(`${checkInInput.value}T00:00:00`);
  const checkOut = new Date(`${checkOutInput.value}T00:00:00`);
  const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

  if (!room || nights <= 0 || !Number.isInteger(nights)) {
    estimatedAmountInput.value = "₹0.00";
    return;
  }

  estimatedAmountInput.value = formatMoney(nights * Number(room.price_per_night));
}

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const booking = {
    guestId: guestSelect.value,
    roomId: roomSelect.value,
    checkInDate: checkInInput.value,
    checkOutDate: checkOutInput.value
  };

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage("bookingMessage", data.message, "error");
      return;
    }

    showMessage(
      "bookingMessage",
      `${data.message} Total: ${formatMoney(data.totalAmount)}`
    );

    bookingForm.reset();
    roomSelect.disabled = true;
    roomSelect.innerHTML = `<option value="">Select dates first</option>`;
    estimatedAmountInput.value = "₹0.00";

    loadBookings();
  } catch (error) {
    showMessage("bookingMessage", "Could not create booking.", "error");
  }
});

async function loadBookings() {
  try {
    const response = await fetch("/api/bookings");
    const bookings = await response.json();
    const tableBody = document.getElementById("bookingsBody");

    if (bookings.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6">No bookings created yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = bookings.map((booking) => {
      let actionButtons = "";

      if (booking.status === "booked") {
        actionButtons = `
          <button onclick="checkIn(${booking.id})">Check In</button>
          <button class="danger" onclick="cancelBooking(${booking.id})">Cancel</button>
        `;
      } else if (booking.status === "checked_in") {
        actionButtons = `
          <button onclick="checkOut(${booking.id})">Check Out</button>
        `;
      } else {
        actionButtons = "-";
      }

      return `
        <tr>
          <td>${booking.full_name}<br><small>${booking.phone}</small></td>
          <td>${booking.room_number}<br><small>${booking.room_type}</small></td>
          <td>
            ${formatDate(booking.check_in_date)}
            <br>to<br>
            ${formatDate(booking.check_out_date)}
          </td>
          <td>${formatMoney(booking.total_amount)}</td>
          <td>
            <span class="badge ${booking.status}">
              ${booking.status.replace("_", " ")}
            </span>
          </td>
          <td><div class="actions">${actionButtons}</div></td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    showMessage("bookingMessage", "Could not load bookings.", "error");
  }
}

async function checkIn(bookingId) {
  await updateBookingStatus(bookingId, "check-in", "Guest checked in.");
}

async function checkOut(bookingId) {
  await updateBookingStatus(bookingId, "check-out", "Guest checked out.");
}

async function cancelBooking(bookingId) {
  if (!confirm("Cancel this booking?")) {
    return;
  }

  try {
    const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "PUT"
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage("bookingMessage", data.message, "error");
      return;
    }

    showMessage("bookingMessage", data.message);
    loadBookings();
  } catch (error) {
    showMessage("bookingMessage", "Could not cancel booking.", "error");
  }
}

async function updateBookingStatus(bookingId, action, successMessage) {
  try {
    const response = await fetch(`/api/bookings/${bookingId}/${action}`, {
      method: "PUT"
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage("bookingMessage", data.message, "error");
      return;
    }

    showMessage("bookingMessage", successMessage);
    loadBookings();
  } catch (error) {
    showMessage("bookingMessage", "Could not update booking.", "error");
  }
}

document.getElementById("findRoomsButton").addEventListener("click", findAvailableRooms);
roomSelect.addEventListener("change", updateEstimatedAmount);
checkInInput.addEventListener("change", () => {
  checkOutInput.min = checkInInput.value;
});
checkOutInput.addEventListener("change", updateEstimatedAmount);

setMinimumDate();
loadGuestOptions();
loadBookings();