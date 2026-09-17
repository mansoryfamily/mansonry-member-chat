// Mansonry Family Administrator Messages

const members = [
  {
    name: "Example Member",
    memberId: "MF001"
  }
];

function loadMembers() {
  const memberList = document.getElementById("memberList");

  if (!memberList) return;

  memberList.innerHTML = "";

  members.forEach(function(member) {
    const item = document.createElement("div");

    item.className = "member";

    item.textContent =
      member.name + " · " + member.memberId;

    item.onclick = function() {
      selectMember(member);
    };

    memberList.appendChild(item);
  });
}

function selectMember(member) {
  const selectedMember =
    document.getElementById("selectedMember");

  if (selectedMember) {
    selectedMember.textContent =
      member.name + " · " + member.memberId;
  }
}

function sendAdminMessage(event) {
  event.preventDefault();

  const input =
    document.getElementById("adminMessage");

  const messages =
    document.getElementById("adminMessages");

  if (!input || !messages) return;

  const text = input.value.trim();

  if (!text) return;

  const message =
    document.createElement("div");

  message.className = "message admin";

  message.textContent = text;

  messages.appendChild(message);

  input.value = "";

  messages.scrollTop =
    messages.scrollHeight;

  /*
    IMPORTANT:
    This is currently a demonstration.
    Later we will connect this to a
    secure database so the administrator
    can receive and reply to real messages.
  */
}

window.addEventListener(
  "DOMContentLoaded",
  function() {
    loadMembers();
  }
);
