function showMessage(elementId, message, type = "success") {
  const messageBox = document.getElementById(elementId);

  messageBox.textContent = message;
  messageBox.className = `message ${type}`;

  setTimeout(() => {
    messageBox.className = "message";
    messageBox.textContent = "";
  }, 4000);
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-IN");
}

function formatMoney(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}