import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Initialisation de Firebase
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

const scanner = new Html5Qrcode("qr-reader");

// ✅ Fonction pour gérer le scan
async function onScanSuccess(decodedText) {
    console.log("QR Code détecté :", decodedText);
    scanner.stop();

    const participantRef = doc(db, "participants", decodedText);
    const participantSnap = await getDoc(participantRef);

    if (participantSnap.exists()) {
        const now = new Date();
        const heureActuelle = now.toLocaleString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        await updateDoc(participantRef, {
            heure_scan: heureActuelle
        });

        console.log(`✅ Billet mis à jour avec heure de scan: ${heureActuelle}`);
    } else {
        console.log("❌ ID non trouvé dans Firestore !");
    }

    window.location.href = `verification.html?id=${encodeURIComponent(decodedText)}`;
}

// ✅ Fonction pour démarrer le scanner
function startScanner() {
    scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => onScanSuccess(decodedText), // ✅ Appel de la fonction async
        (errorMessage) => console.log("Erreur de scan :", errorMessage)
    ).catch(err => console.error("Erreur lors du démarrage du scanner", err));
}

// ✅ Ajustement de la vidéo
setTimeout(() => {
    let video = document.querySelector("#qr-reader video");
    if (video) {
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
    }
}, 2000);

document.addEventListener("DOMContentLoaded", () => {
    startScanner();
});
