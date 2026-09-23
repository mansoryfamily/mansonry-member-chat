const SUPABASE_URL = "https://rsinxyyxjyasapophbgv.supabase.co";

const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY_HERE";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentUser = null;
let currentConversationId = null;


// ==============================
// PAGE LOAD
// ==============================

document.addEventListener("DOMContentLoaded", async () => {

  const {
    data: {
      session
    }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    showLogin();
    return;
  }

  currentUser = session.user;

  await checkAdmin();

});


// ==============================
// ADMIN CHECK
// ==============================

async function checkAdmin() {

  const {
    data: profile,
    error
  } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  if (error || !profile) {

    alert("Administrator profile not found.");

    await supabaseClient.auth.signOut();

    showLogin();

    return;
  }

  if (profile.role !== "admin") {

    alert("Access denied. Administrator account required.");

    await supabaseClient.auth.signOut();

    showLogin();

    return;
  }

  await loadMembers();

  setupRealtime();

}


// ==============================
// LOGIN SCREEN
// ==============================

function showLogin() {

  document.body.innerHTML = `

    <div style="
      max-width:420px;
      margin:80px auto;
      padding:25px;
      font-family:Arial;
    ">

      <h2>Mansonry Family Administrator</h2>

      <p>Administrator Login</p>

      <input
        id="adminEmail"
        type="email"
        placeholder="Administrator email"
        style="
          width:100%;
          padding:12px;
          margin:8px 0;
          box-sizing:border-box;
        "
      >

      <input
        id="adminPassword"
        type="password"
        placeholder="Password"
        style="
          width:100%;
          padding:12px;
          margin:8px 0;
          box-sizing:border-box;
        "
      >

      <button
        onclick="adminLogin()"
        style="
          width:100%;
          padding:12px;
          margin-top:10px;
        "
      >
        Login
      </button>

      <p id="loginStatus"></p>

    </div>

  `;

}


// ==============================
// ADMIN LOGIN
// ==============================

async function adminLogin() {

  const email =
    document.getElementById("adminEmail").value.trim();

  const password =
    document.getElementById("adminPassword").value;

  const status =
    document.getElementById("loginStatus");

  status.textContent = "Logging in...";

  const {
    data,
    error
  } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {

    status.textContent =
      "Login failed: " + error.message;

    return;
  }

  currentUser = data.user;

  window.location.reload();

}


// ==============================
// LOAD MEMBERS
// ==============================

async function loadMembers() {

  const memberList =
    document.getElementById("memberList");

  if (!memberList) return;

  memberList.innerHTML =
    "<p>Loading members...</p>";


  const {
    data: profiles,
    error: profileError
  } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("role", "member")
    .order("created_at", {
      ascending: true
    });


  if (profileError) {

    memberList.innerHTML =
      "<p>Could not load members.</p>";

    console.error(profileError);

    return;
  }


  const {
    data: conversations,
    error: conversationError
  } = await supabaseClient
    .from("conversations")
    .select("*");


  if (conversationError) {

    memberList.innerHTML =
      "<p>Could not load conversations.</p>";

    console.error(conversationError);

    return;
  }


  memberList.innerHTML = "";


  profiles.forEach(profile => {

    const conversation =
      conversations.find(
        c => c.member_id === profile.id
      );


    const button =
      document.createElement("button");

    button.type = "button";

    button.style.width = "100%";
    button.style.textAlign = "left";
    button.style.padding = "14px";
    button.style.marginBottom = "5px";
    button.style.cursor = "pointer";


    button.innerHTML = `

      <strong>
        ${escapeHtml(profile.full_name)}
      </strong>

      <br>

      <small>
        ${escapeHtml(profile.member_id || "")}
      </small>

    `;


    button.onclick = () => {

      if (!conversation) {

        alert(
          "This member has not started a conversation yet."
        );

        return;
      }

      openConversation(
        conversation.id,
        profile
      );

    };


    memberList.appendChild(button);

  });


  if (profiles.length === 0) {

    memberList.innerHTML =
      "<p>No members found.</p>";

  }

}


// ==============================
// OPEN CONVERSATION
// ==============================

async function openConversation(
  conversationId,
  profile
) {

  currentConversationId =
    conversationId;


  document.getElementById(
    "selectedMember"
  ).textContent =
    profile.full_name;


  await loadMessages(
    conversationId
  );

}


// ==============================
// LOAD MESSAGES
// ==============================

async function loadMessages(
  conversationId
) {

  const messagesBox =
    document.getElementById(
      "adminMessages"
    );


  messagesBox.innerHTML =
    "<p>Loading messages...</p>";


  const {
    data: messages,
    error
  } = await supabaseClient
    .from("messages")
    .select("*")
    .eq(
      "conversation_id",
      conversationId
    )
    .order("created_at", {
      ascending: true
    });


  if (error) {

    messagesBox.innerHTML =
      "<p>Could not load messages.</p>";

    console.error(error);

    return;
  }


  messagesBox.innerHTML = "";


  if (messages.length === 0) {

    messagesBox.innerHTML = `

      <div class="welcome-message">

        <p>
          No messages yet.
        </p>

      </div>

    `;

    return;
  }


  messages.forEach(message => {

    displayMessage(message);

  });


  messagesBox.scrollTop =
    messagesBox.scrollHeight;

}


// ==============================
// DISPLAY MESSAGE
// ==============================

function displayMessage(message) {

  const messagesBox =
    document.getElementById(
      "adminMessages"
    );


  const messageDiv =
    document.createElement("div");


  const isAdmin =
    message.sender_id === currentUser.id;


  messageDiv.style.marginBottom = "12px";
  messageDiv.style.padding = "10px";
  messageDiv.style.borderRadius = "8px";


  if (isAdmin) {

    messageDiv.style.marginLeft = "20%";
    messageDiv.style.background = "#e8f5e9";

  } else {

    messageDiv.style.marginRight = "20%";
    messageDiv.style.background = "#f1f1f1";

  }


  const date =
    new Date(
      message.created_at
    ).toLocaleString();


  messageDiv.innerHTML = `

    <div>
      ${escapeHtml(message.body)}
    </div>

    <small>
      ${date}
    </small>

  `;


  messagesBox.appendChild(
    messageDiv
  );

}


// ==============================
// SEND ADMIN MESSAGE
// ==============================

async function sendAdminMessage(event) {

  event.preventDefault();


  if (!currentConversationId) {

    alert(
      "Please select a member first."
    );

    return;
  }


  const input =
    document.getElementById(
      "adminMessage"
    );


  const body =
    input.value.trim();


  if (!body) return;


  const {
    error
  } = await supabaseClient
    .from("messages")
    .insert({

      conversation_id:
        currentConversationId,

      sender_id:
        currentUser.id,

      body:
        body

    });


  if (error) {

    alert(
      "Message failed: " +
      error.message
    );

    console.error(error);

    return;
  }


  input.value = "";

  await loadMessages(
    currentConversationId
  );

}


// ==============================
// REALTIME MESSAGES
// ==============================

function setupRealtime() {

  supabaseClient
    .channel("admin-messages")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages"
      },
      async payload => {

        await loadMembers();


        if (
          currentConversationId &&
          payload.new.conversation_id ===
          currentConversationId
        ) {

          await loadMessages(
            currentConversationId
          );

        }

      }
    )
    .subscribe();

}


// ==============================
// HTML SAFETY
// ==============================

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

             }
