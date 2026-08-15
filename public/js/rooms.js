async function loadRooms() {
  try {
    const response = await fetch("/api/rooms");
    const rooms = await response.json();

    const tableBody = document.getElementById("roomsBody");

    tableBody.innerHTML = rooms.map((room) => `
      <tr>
        <td>${room.room_number}</td>
        <td>${room.room_type}</td>
        <td>${formatMoney(room.price_per_night)}</td>
        <td><span class="badge ${room.status}">${room.status}</span></td>
        <td>
          <select onchange="updateRoomStatus(${room.id}, this.value)">
            <option value="available" ${room.status === "available" ? "selected" : ""}>Available</option>
            <option value="occupied" ${room.status === "occupied" ? "selected" : ""}>Occupied</option>
            <option value="maintenance" ${room.status === "maintenance" ? "selected" : ""}>Maintenance</option>
          </select>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    showMessage("roomMessage", "Could not load rooms.", "error");
  }
}

async function updateRoomStatus(roomId, status) {
  try {
    const response = await fetch(`/api/rooms/${roomId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage("roomMessage", data.message, "error");
      return;
    }

    showMessage("roomMessage", data.message);
    loadRooms();
  } catch (error) {
    showMessage("roomMessage", "Could not update room.", "error");
  }
}

loadRooms();