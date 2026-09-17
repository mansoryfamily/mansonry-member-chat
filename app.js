// Mansonry Family Private Member Chat

function startChat() {
  const name = document.getElementById("name").value.trim();
  const memberId = document.getElementById("memberId").value.trim();

  if (!name || !memberId) {
    alert("Please enter your full name and Member ID.");
    return;
  }

  // Save member information on this device
  localStorage.setItem(
    "mansonryMember",
    JSON.stringify({
      name: name,
      memberId: memberId
    })
  );

  // Hide login
  document.getElementById("login").classList.add("hidden");

  // Show chat
  document.getElementById("chat").classList.remove("hidden");

  // Display member information
  document.getElementById("memberLabel").textContent =
    name + " · " + memberId;

  // Create member avatar
  const avatar = document.querySelector(".member-avatar");

  if (avatar) {
    avatar.textContent =
      name.charAt(0).toUpperCase();
  }
}


function sendMessage(event) {
  event.preventDefault();

  const input =
    document.getElementById("message");

  const text = input.value.trim();

  if (!text) return;

  const messages =
    document.getElementById("messages");

  const message =
    document.createElement("div");

  message.className = "message member";

  message.textContent = text;

  messages.appendChild(message);

  // Clear input
  input.value = "";

  // Scroll to newest message
  messages.scrollTop =
    messages.scrollHeight;

  /*
    IMPORTANT:
    This is currently a front-end demonstration.

    Later we will connect this function
    to a secure database so the message
    is actually delivered to the administrator.
  */
}


function logout() {
  localStorage.removeItem("mansonryMember");

  location.reload();
}


// Check whether the member is already logged in
window.addEventListener(
  "DOMContentLoaded",
  function() {

    const savedMember =
      localStorage.getItem("mansonryMember");

    if (!savedMember) return;

    try {

      const member =
        JSON.parse(savedMember);

      if (member.name && member.memberId) {

        document
          .getElementById("login")
          .classList
          .add("hidden");

        document
          .getElementById("chat")
          .classList
          .remove("hidden");

        document
          .getElementById("memberLabel")
          .textContent =
          member.name +
          " · " +
          member.memberId;

        const avatar =
          document.querySelector(
            ".member-avatar"
          );

        if (avatar) {
          avatar.textContent =
            member.name
              .charAt(0)
              .toUpperCase();
        }
      }

    } catch (error) {

      localStorage.removeItem(
        "mansonryMember"
      );

    }
  }
);
