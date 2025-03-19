import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 📌 Fonction pour générer un billet
async function generateTicket() {
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const type = document.getElementById("type").value;
    const qrcodeContainer = document.getElementById("qrcode");
    const downloadContainer = document.getElementById("download-container");
    const emailContainer = document.getElementById("email-container");

    if (!nom || !prenom || !email) {
        alert("❌ Veuillez remplir tous les champs !");
        return;
    }

    try {
        // 📝 Ajout du participant dans Firestore
        const docRef = await addDoc(collection(db, "participants"), {
            nom: nom,
            prenom: prenom,
            email: email,
            type_entree: type,
            solde: 0,  
            scanned: false  
        });

        const uniqueID = docRef.id; // 🔥 ID Firestore unique

        // 🔥 Mise à jour du document pour ajouter l'ID à l'intérieur du document
        await updateDoc(doc(db, "participants", uniqueID), {
            id: uniqueID
        });

        // ✅ Suppression du QR Code précédent s'il y en a un
        qrcodeContainer.innerHTML = "";

        // 🔳 Génération du QR Code
        const qr = new QRCode(qrcodeContainer, {
            text: uniqueID,
            width: 200,
            height: 200
        });

        setTimeout(() => {
            const canvas = qrcodeContainer.querySelector("canvas");
            if (canvas) {
                const imgData = canvas.toDataURL("image/png");

                // 📥 Bouton de téléchargement (modifié pour être un bouton)
                const downloadButton = document.createElement("button");
                downloadButton.innerText = "📥 Télécharger le billet";
                downloadButton.classList.add("btn");

                // Ajoute l'événement pour télécharger le fichier quand on clique sur le bouton
                downloadButton.addEventListener("click", () => {
                    const link = document.createElement("a");
                    link.href = imgData;
                    link.download = `billet_${nom}_${prenom}.png`;
                    link.click(); // Déclenche le téléchargement
                });

                // Vider le conteneur et ajouter le bouton de téléchargement
                downloadContainer.innerHTML = "";
                downloadContainer.appendChild(downloadButton);

                // 📧 Bouton pour envoyer par email avec le QR code en image dans le mail
                const emailButton = document.createElement("button");
                emailButton.innerText = "📧 Envoyer par email";
                emailButton.classList.add("btn");
                emailButton.addEventListener("click", () => sendEmail(nom, prenom, email, uniqueID, imgData));

                emailContainer.innerHTML = "";
                emailContainer.appendChild(emailButton);

                // ✅ Affichage des boutons
                downloadContainer.style.display = "block";
                emailContainer.style.display = "block";
            }
        }, 500);

        alert("✅ Billet généré avec succès !");
    } catch (error) {
        console.error("❌ Erreur :", error);
        alert("❌ Une erreur est survenue !");
    }
}

// 📌 Fonction pour envoyer un email avec l'image du QR code
function sendEmail(nom, prenom, email, uniqueID, qrImage) {
    console.log("Email:", email);

    emailjs.init("37otOAql8dSxtQbQC");
    emailjs.send("service_l5sqtyb", "template_4djgr4o", {
        nom: nom,
        prenom: prenom,
        email: email,
        qrImage: qrImage,

    }).then(() => {
        alert("✅ Email envoyé avec succès !");
    }).catch((error) => {
        console.error("❌ Erreur lors de l'envoi de l'email", error);
        alert("❌ Impossible d'envoyer l'email.");
    });
}

// 📌 Ajout de l'événement sur le bouton "Générer"
document.getElementById("generate-btn").addEventListener("click", generateTicket);

// 🔴 Cacher les boutons au démarrage
document.getElementById("download-container").style.display = "none";
document.getElementById("email-container").style.display = "none";
