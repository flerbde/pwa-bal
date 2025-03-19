// Importation Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, query, deleteDoc, where, } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC8BN2SbDOUjeaqkzZc8eHAgZp8uPVz9PE",
    authDomain: "pwa-bal.firebaseapp.com",
    projectId: "pwa-bal",
    storageBucket: "pwa-bal.firebasestorage.app",
    messagingSenderId: "1039412823107",
    appId: "1:1039412823107:web:1008f77f3635ef967680f6"
 }; 

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mot de passe défini en dur
const ADMIN_PASSWORD = "flerbde";

// Éléments DOM
const loginDiv = document.getElementById("admin-login");
const panelDiv = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logout");

const entriesCount = document.getElementById("entries-count");
const totalConso = document.getElementById("total-conso");

const scanBtn = document.getElementById("scan-qr");
const participantInfo = document.getElementById("participant-info");
const pNom = document.getElementById("p-nom");
const pPrenom = document.getElementById("p-prenom");
const pType = document.getElementById("p-type");
const pSolde = document.getElementById("p-solde");
const resetSoldeBtn = document.getElementById("reset-solde");
const resetTicketBtn = document.getElementById("reset-ticket");




const deleteTicketBtn = document.getElementById("delete-ticket");

let currentParticipantId = null;

// Connexion admin
loginBtn.addEventListener("click", () => {
    if (passwordInput.value === ADMIN_PASSWORD) {
        loginDiv.style.display = "none";
        panelDiv.style.display = "block";
        loadStats();
    } else {
        alert("Mot de passe incorrect !");
    }
});

// Déconnexion
logoutBtn.addEventListener("click", () => {
    panelDiv.style.display = "none";
    loginDiv.style.display = "block";
    passwordInput.value = "";
});


// Charger les stats globales
async function loadStats() {
    const participantsSnapshot = await getDocs(collection(db, "participants"));
    let scannedCount = 0;
    let totalConsos = 0;

    participantsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.scanned) scannedCount++;
        if (data.solde) totalConsos += data.solde;
    });

    entriesCount.textContent = scannedCount;
    totalConso.textContent = totalConsos;
}

// Scanner un QR Code
// Afficher le scanner de QR Code
scanBtn.addEventListener("click", () => {
    const scannerDiv = document.createElement("div");
    scannerDiv.id = "qr-reader";
    document.body.appendChild(scannerDiv);

    const html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
        { facingMode: "environment" }, // Caméra arrière
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            html5QrCode.stop();
            document.body.removeChild(scannerDiv);
            loadParticipant(decodedText);
        },
        (errorMessage) => {
            console.log(errorMessage); // Erreur de lecture
        }
    ).catch((err) => {
        console.log("Erreur d'initialisation du scanner : " + err);
    });
});


// Charger un participant
async function loadParticipant(id) {
    const docRef = doc(db, "participants", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        alert("Participant non trouvé !");
        return;
    }

    const data = docSnap.data();
    currentParticipantId = id;

    pNom.textContent = data.nom || "Inconnu";
    pPrenom.textContent = data.prenom || "Inconnu";
    pType.textContent = data.type_entree || "Inconnu";
    pSolde.textContent = data.solde || 0;

    participantInfo.style.display = "block";
}

async function updateEntriesCount() {
    const participantsRef = collection(db, "participants");
    const scannedQuery = query(participantsRef, where("scanned", "==", true));
    const querySnapshot = await getDocs(scannedQuery);
    
    const entriesCount = querySnapshot.size; // Nombre de billets scannés
    document.getElementById("entries-count").textContent = entriesCount;
}

// Remettre solde à 0
resetSoldeBtn.addEventListener("click", async () => {
    if (!currentParticipantId) return;
    const docRef = doc(db, "participants", currentParticipantId);
    await updateDoc(docRef, { solde: 0 });
    pSolde.textContent = 0;
    alert("Solde réinitialisé !");
});

resetTicketBtn.addEventListener("click", async () => {
    if (!currentParticipantId) return alert("Aucun participant sélectionné !");
    
    const docRef = doc(db, "participants", currentParticipantId);
    await updateDoc(docRef, { scanned: false });

    alert("Billet remis en non scanné !");
    updateEntriesCount(); // Mise à jour du compteur
});
document.addEventListener("DOMContentLoaded", () => {
    updateEntriesCount();
});

// Supprimer un billet de Firestore
// Suppression du billet
deleteTicketBtn.addEventListener("click", async () => {
    if (!currentParticipantId) {
        alert("Aucun participant sélectionné !");
        return;
    }

    // Créer une référence au document à supprimer
    const docRef = doc(db, "participants", currentParticipantId);  // Assure-toi que currentParticipantId contient bien l'ID du participant

    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce billet de la base de données ?");
    if (confirmation) {
        try {
            await deleteDoc(docRef);  // Supprimer le document Firestore
            alert("Billet supprimé de la base de données !");
            updateEntriesCount(); // Mettre à jour le nombre d'entrées
            participantInfo.style.display = "none";  // Masquer les informations du participant
        } catch (error) {
            console.error("Erreur lors de la suppression du billet :", error);
            alert("Une erreur est survenue lors de la suppression du billet.");
        }
    }
});
// Ajoute un écouteur d'événement sur le bouton de recherche
// Assurez-vous que vous avez les bonnes références pour chaque bouton
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-id");
const searchResultsContainer = document.getElementById("search-results-container");

// Recherche d'un participant
searchBtn.addEventListener("click", async () => {
    const searchQuery = searchInput.value.trim().toLowerCase();

    if (!searchQuery) {
        alert("Veuillez entrer un ID ou un nom.");
        return;
    }

    const participantsSnapshot = await getDocs(collection(db, "participants"));
    let participantFound = false;

    searchResultsContainer.innerHTML = ''; // Vider les anciens résultats

    participantsSnapshot.forEach(doc => {
        const data = doc.data();

        if (data.nom.toLowerCase().includes(searchQuery) || doc.id === searchQuery) {
            participantFound = true;

            // Créer un conteneur pour le participant trouvé
            const participantContainer = document.createElement("div");
            participantContainer.classList.add("search-result-container");

            const name = document.createElement("div");
            name.textContent = `Nom :${data.nom} ${data.prenom}`;
            participantContainer.appendChild(name);

            const details = document.createElement("div");
            details.classList.add("details");
            details.innerHTML = `
                <p><strong>Nom :</strong> ${data.nom}</p>
                <p><strong>Prénom :</strong> ${data.prenom}</p>
                <p><strong>Type :</strong> ${data.type_entree}</p>
                <p><strong>Solde :</strong> ${data.solde}</p>
                <p><strong>Email :</strong> ${data.email}</p>
                <p><strong>Billet scanné :</strong> ${data.scanned ? "✅ Oui" : "❌ Non"}</p>
                <p><strong>Heure de scan :</strong> ${data.heure_scan ? data.heure_scan : "Jamais"}</p>
                <button class="btn danger" data-id="${doc.id}" id="reset-solde-btn">Réinitialiser le solde</button>
                <button class="btn danger" data-id="${doc.id}" id="reset-ticket-btn">Remettre le billet "non scanné"</button>
                <button class="btn danger" data-id="${doc.id}" id="delete-ticket-btn">🗑️ Supprimer le billet</button>
            `;
            participantContainer.appendChild(details);
            searchResultsContainer.appendChild(participantContainer);

            // Ajouter un événement de clic pour déplier/replier les détails
            participantContainer.addEventListener("click", () => {
                participantContainer.classList.toggle("open");
            });
        }
    });

    if (!participantFound) {
        alert("Aucun participant trouvé !");
    }
});

// Fonction pour réinitialiser le solde
async function resetSolde(id) {
    const participantRef = doc(db, "participants", id);
    await updateDoc(participantRef, {
        solde: 0
    });
    alert("Le solde a été réinitialisé.");
    searchBtn.click();
}

// Fonction pour remettre le billet en "non scanné"
async function resetTicket(id) {
    const participantRef = doc(db, "participants", id);
    await updateDoc(participantRef, {
        scanned: false  // Assurez-vous que vous avez un champ "scan" pour cela
    });
    alert("Le billet a été remis en 'non scanné'.");
    searchBtn.click();
}


// Fonction pour supprimer le billet et actualiser la liste
async function deleteTicket(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce billet ? Cette action est irréversible.")) {
        const participantRef = doc(db, "participants", id);
        await deleteDoc(participantRef);
        alert("Le billet a été supprimé.");
        
        // 🔄 Actualiser la liste après suppression
        searchBtn.click();
    }
}

// Ajouter les événements de clic pour chaque bouton
document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "reset-solde-btn") {
        const participantId = event.target.getAttribute("data-id");
        resetSolde(participantId);
    }

    if (event.target && event.target.id === "reset-ticket-btn") {
        const participantId = event.target.getAttribute("data-id");
        resetTicket(participantId);
    }

    if (event.target && event.target.id === "delete-ticket-btn") {
        const participantId = event.target.getAttribute("data-id");
        deleteTicket(participantId);
    }
});
