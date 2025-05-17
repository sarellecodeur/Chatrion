// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBDHLE2anBnzQNZw2iI-SwJeONNdoNa5ak",
  authDomain: "server-f0278.firebaseapp.com",
  databaseURL: "https://server-f0278-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "server-f0278",
  storageBucket: "server-f0278.appspot.com",
  messagingSenderId: "884960024576",
  appId: "1:884960024576:web:b99e2021ab90bce132a0e5",
  measurementId: "G-T49MZ5R8V5"
};

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // ✅ L'utilisateur est connecté
    const username = user.displayName;
    const pfp = user.photoURL;

    // Stocker dans le localStorage si jamais
    localStorage.setItem("username", username);
    localStorage.setItem("pfp", pfp);

    // Afficher les infos dans l'UI
    document.getElementById("username").value = username;
    document.getElementById("username").disabled = true;

    // 💬 Charger les messages après être connecté
    listenForMessages();
  } else {
    // ❌ Pas connecté
    alert("Tu n'es pas connecté ! Clique sur le bouton pour te connecter.");
  }
});


function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(error => {
    alert("Erreur de connexion: " + error.message);
  });
}

function initUser(user) {
  document.getElementById("username").value = user.displayName;
  document.getElementById("username").disabled = true;

  if (localStorage.getItem("pfp")) {
    document.getElementById("pfp").value = localStorage.getItem("pfp");
  } else {
    localStorage.setItem("pfp", user.photoURL);
    document.getElementById("pfp").value = user.photoURL;
  }

  listenForMessages();
}

// Sauvegarde du pseudo et de l’image de profil
function saveSettings() {
  const newName = document.getElementById("newUsername").value;
  const newPfp = document.getElementById("pfp").value;
  if (newName) {
    document.getElementById("username").value = newName;
    localStorage.setItem("username", newName);
  }
  if (newPfp) {
    localStorage.setItem("pfp", newPfp);
  }
  alert("✅ Paramètres enregistrés !");
}

// Envoi d’un message
function sendMessage() {
  const username =
    localStorage.getItem("username") || document.getElementById("username").value;
  const text = document.getElementById("message").value;
  const pfp = localStorage.getItem("pfp") || "";

  if (!text.trim()) return;

  db.ref("messages").push({
    username,
    text,
    pfp,
    timestamp: Date.now()
  });

  document.getElementById("message").value = "";
}

// Écoute des messages
function listenForMessages() {
  const chat = document.getElementById("chat");
  db.ref("messages").on("value", snapshot => {
    chat.innerHTML = "";
    const data = snapshot.val();
    if (data) {
      Object.values(data)
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach(msg => {
          const msgEl = document.createElement("div");
          msgEl.className = "message";

          const img = document.createElement("img");
          img.src = msg.pfp || "https://i.imgur.com/placeholder.png";

          const text = document.createElement("div");
          text.innerHTML = `💬 <b>${msg.username}</b>: ${escapeHTML(msg.text)}`;

          msgEl.appendChild(img);
          msgEl.appendChild(text);
          chat.appendChild(msgEl);
        });
      chat.scrollTop = chat.scrollHeight;
    }
  });
}

// Empêche les scripts via le chat
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, match => {
    const escapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return escapes[match];
  });
}
