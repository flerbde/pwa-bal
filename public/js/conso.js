// Importation des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC8BN2SbDOUjeaqkzZc8eHAgZp8uPVz9PE",
    authDomain: "pwa-bal.firebaseapp.com",
    projectId: "pwa-bal",
    storageBucket: "pwa-bal.firebasestorage.app",
    messagingSenderId: "1039412823107",
    appId: "1:1039412823107:web:1008f77f3635ef967680f6"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Récupération de l'ID depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const participantId = urlParams.get("id");

if (participantId) {
    loadParticipantData(participantId);
}

// Fonction pour charger les informations du participant
async function loadParticipantData(id) {
    const docRef = doc(db, "participants", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById("participant-name").innerText = `${data.prenom} ${data.nom}`;
        document.getElementById("participant-type").innerText = data.type_entree;
        document.getElementById("solde").innerText = data.solde || 0;
    } else {
        document.getElementById("message").innerText = "❌ Participant non trouvé !";
    }
}

// Fonction pour modifier le solde des consommations
async function updateSolde(id, increment) {
    const docRef = doc(db, "participants", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        let solde = docSnap.data().solde || 0;
        solde += increment;

        if (solde < 0) solde = 0; // Empêcher les valeurs négatives

        await updateDoc(docRef, { solde: solde });
        document.getElementById("solde").innerText = solde;
    } else {
        document.getElementById("message").innerText = "❌ Erreur : participant introuvable !";
    }
}

// Événements des boutons
document.getElementById("add-conso").addEventListener("click", () => {
    updateSolde(participantId, 1);
});

document.getElementById("remove-conso").addEventListener("click", () => {
    updateSolde(participantId, -1);
});
