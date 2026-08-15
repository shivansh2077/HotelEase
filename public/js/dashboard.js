async function loadDashboard() {
  try {
    const response = await fetch("/api/dashboard/stats");
    const data = await response.json();

    document.getElementById("totalRooms").textContent = data.totalRooms || 0;
    document.getElementById("availableRooms").textContent = data.availableRooms || 0;
    document.getElementById("occupiedRooms").textContent = data.occupiedRooms || 0;
    document.getElementById("activeBookings").textContent = data.activeBookings || 0;

    const tableBody = document.getElementById("recentBookingsBody");

    if (data.recentBookings.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5">No bookings yet. <br /> <br />Use Guests Tab to Add a guest then Book room</td></tr>`;
      return;
    }

    tableBody.innerHTML = data.recentBookings.map((booking) => `
      <tr>
        <td>${booking.full_name}</td>
        <td>${booking.room_number}</td>
        <td>${formatDate(booking.check_in_date)}</td>
        <td>${formatDate(booking.check_out_date)}</td>
        <td><span class="badge ${booking.status}">${booking.status.replace("_", " ")}</span></td>
      </tr>
    `).join("");
  } catch (error) {
    console.error(error);
  }
}

loadDashboard();