import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Config Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC8BN2SbDOUjeaqkzZc8eHAgZp8uPVz9PE",
    authDomain: "pwa-bal.firebaseapp.com",
    projectId: "pwa-bal",
    storageBucket: "pwa-bal.firebasestorage.app",
    messagingSenderId: "1039412823107",
    appId: "1:1039412823107:web:1008f77f3635ef967680f6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sélection de l'élément où afficher le message
const messageBox = document.getElementById("verification-message");

// 🔍 Fonction de vérification du billet
async function verifyTicket(id) {
    if (!messageBox) {
        console.error("❌ Élément #verification-message introuvable !");
        return;
    }

    // Afficher un message de chargement
    messageBox.innerHTML = "⏳ Vérification en cours...";

    // Récupération du document
    const docRef = doc(db, "participants", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        messageBox.innerHTML = "❌ Billet non valide - ID non trouvée";
        return;
    }

    const data = docSnap.data();

    if (data.scanned) {
        messageBox.innerHTML = "⚠️ Billet déjà scanné, entrée non valide";
    } else {
        await updateDoc(docRef, { scanned: true });
        messageBox.innerHTML = `
            ✅ Accès autorisé ! Bienvenue !<br>
            <strong>Nom :</strong> ${data.nom} <br>
            <strong>Prénom :</strong> ${data.prenom} <br>
            <strong>Type d’entrée :</strong> ${data.type_entree}
        `;
    }
}

// 📌 Vérifier l'ID passé en paramètre
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const scannedId = urlParams.get("id");

    if (scannedId) {
        verifyTicket(scannedId);
    } else {
        messageBox.innerHTML = "⚠️ Aucun ID détecté";
    }
});
