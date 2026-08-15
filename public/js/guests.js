const guestForm = document.getElementById("guestForm");

guestForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const guest = {
    fullName: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    idProofNumber: document.getElementById("idProofNumber").value
  };

  try {
    const response = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guest)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage("guestMessage", data.message, "error");
      return;
    }

    showMessage("guestMessage", data.message);
    guestForm.reset();
    loadGuests();
  } catch (error) {
    showMessage("guestMessage", "Could not add guest.", "error");
  }
});

async function loadGuests() {
  try {
    const response = await fetch("/api/guests");
    const guests = await response.json();

    const tableBody = document.getElementById("guestsBody");

    if (guests.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4">No guests added yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = guests.map((guest) => `
      <tr>
        <td>${guest.full_name}</td>
        <td>${guest.phone}</td>
        <td>${guest.email || "-"}</td>
        <td>${guest.id_proof_number || "-"}</td>
      </tr>
    `).join("");
  } catch (error) {
    showMessage("guestMessage", "Could not load guests.", "error");
  }
}

loadGuests();