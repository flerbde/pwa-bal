import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC8BN2SbDOUjeaqkzZc8eHAgZp8uPVz9PE",
    authDomain: "pwa-bal.firebaseapp.com",
    projectId: "pwa-bal",
    storageBucket: "pwa-bal.firebasestorage.app",
    messagingSenderId: "1039412823107",
    appId: "1:1039412823107:web:1008f77f3635ef967680f6"
};

// ✅ Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 Fonction pour générer le billet et envoyer l'email
document.getElementById("vente-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const prenom = document.getElementById("prenom").value.trim();
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const typeEntree = document.getElementById("type").value;
    const typePaiement = document.getElementById("payment-type").value;

    if (!prenom || !nom || !email || !typeEntree || !typePaiement) {
        alert("❌ Tous les champs doivent être remplis !");
        return;
    }

    try {
        // 🆔 Générer un ID unique (UUID basé sur timestamp)
        const billetId = `billet-${Date.now()}`;

        // 📝 Ajouter le participant dans Firestore
        await setDoc(doc(db, "participants", billetId), {
            id: billetId,
            prenom,
            nom,
            email,
            type_entree: typeEntree,
            type_paiement: typePaiement,
            solde: 0,
        });

        // 🔳 Génération du QR Code
        const qrcodeContainer = document.getElementById("qrcode");
        qrcodeContainer.innerHTML = ""; // Nettoyer le conteneur avant de générer le QR
        const qr = new QRCode(qrcodeContainer, {
            text: billetId,
            width: 200,
            height: 200
        });

        setTimeout(() => {
            const canvas = qrcodeContainer.querySelector("canvas");
            if (canvas) {

                console.log("QR Code généré avec succès !");
                const imgData = canvas.toDataURL("image/png");

                // 📧 Envoi de l'email avec Brevo (Sendinblue)
                sendEmail(prenom, nom, email, typeEntree, billetId, imgData);

                // 🧹 Vider le formulaire pour une nouvelle vente
                document.getElementById("vente-form").reset();
                document.getElementById("prenom").focus();
            }
        }, 2000);
    } catch (error) {
        console.error("❌ Erreur :", error);
        alert("❌ Une erreur s'est produite (avant envoi du mail) !");
    }
});

// 📧 Fonction pour envoyer un email avec Mailjet
async function sendEmail(prenom, nom, email, typeEntree, billetId, qrImage) {
    try {
        const response = await fetch("https://envoyeremail-6mciotfgxq-uc.a.run.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prenom, nom, email, typeEntree, billetId, qrImage })
        });

        const result = await response.json();
        console.log("✅ Email envoyé :", result.message);
        alert("✅ Email envoyé")
    } catch (error) {
        console.error("❌ Erreur envoi email :", error);
        alert("❌ Erreur envoi email")
    }
}
