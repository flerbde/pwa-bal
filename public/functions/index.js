const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const FormData = require('form-data');
const cors = require('cors')({ origin: true });  // Autoriser toutes les origines

admin.initializeApp();

const CLOUDINARY_UPLOAD_PRESET = 'qr-code-upload';  // Remplace par ton preset Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dwy6xf6fz';  // Remplace par ton nom de cloud Cloudinary

// Fonction pour uploader le QR Code sur Cloudinary
async function uploadToCloudinary(qrCodeBuffer) {
    const form = new FormData();
    form.append('file', qrCodeBuffer, { filename: 'qr_code.png' });
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, form, {
        headers: form.getHeaders(),
    });

    return response.data.secure_url;  // Retourne l'URL publique de l'image
}

exports.envoyerEmail = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {  // Appliquer cors
        if (req.method !== "POST") {
            return res.status(405).json({ message: "Méthode non autorisée" });
        }

        const { prenom, nom, email, typeEntree, billetId, qrImage } = req.body;

        if (!prenom || !nom || !email || !typeEntree || !billetId || !qrImage) {
            return res.status(400).json({ message: "Données manquantes" });
        }

        try {
            const qrCodeBuffer = Buffer.from(qrImage.split(",")[1], 'base64');  // Enlever le préfixe "data:image/png;base64,"
            const qrCodeUrl = await uploadToCloudinary(qrCodeBuffer);  // Upload sur Cloudinary et récupérer l'URL
            const mailjetResponse = await axios.post(
                "https://api.mailjet.com/v3.1/send",
                
                {
                    Messages: [
                        {
                            From: { Email: "flerbde@gmail.com", Name: "Fler BDE" },
                            To: [{ Email: email }],
                            Subject: "🎉 Votre Billet pour le Bal de Promo 🎉 ",
                            HTMLPart: `
                            
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Votre Billet pour le Bal de Promo</title>
                                <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@500&family=Montserrat:wght@500&family=Quicksand:wght@500&display=swap" rel="stylesheet">
                                <style>
                                    body {
                                        font-family: 'Quicksand', sans-serif;
                                        background-color: #f0f8ff;
                                        margin: 0;
                                        padding: 0;
                                    }
                        
                                    .container {
                                        width: 100%;
                                        max-width: 600px;
                                        margin: 0 auto;
                                        padding: 20px;
                                        background-color: #ffffff;
                                        border-radius: 10px;
                                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                                    }
                        
                                    .header {
                                        text-align: center;
                                        background-color: #ff6347;
                                        color: white;
                                        padding: 20px;
                                        border-radius: 10px 10px 0 0;
                                    }
                        
                                    .header h1 {
                                        margin: 0;
                                        font-size: 40px;
                                        font-family: 'Roboto Slab', serif;
                                    }
                        
                                    .content {
                                        padding: 20px;
                                        color: #333;
                                        font-family: 'Montserrat', sans-serif;
                                    }
                        
                                    .content h2 {
                                        font-size: 28px;
                                        color: #ff6347;
                                        font-family: 'Roboto Slab', serif;
                                    }
                        
                                    .info p {
                                        font-size: 16px;
                                        line-height: 1.5;
                                        margin: 10px 0;
                                    }
                        
                                    .info span {
                                        font-weight: bold;
                                        color: #ff6347;
                                    }
                        
                                    .qrcode-container {
                                        text-align: center;
                                        margin: 40px 0;
                                    }
                        
                                    .qrcode-container img {
                                        width: 180px;
                                        height: 180px;
                                        border-radius: 5px;
                                    }
                        
                                    .footer {
                                        background-color: #f1f1f1;
                                        padding: 15px;
                                        text-align: center;
                                        font-size: 14px;
                                        color: #777777;
                                        border-radius: 0 0 10px 10px;
                                    }
                        
                                    .footer a {
                                        color: #ff6347;
                                        text-decoration: none;
                                    }
                        
                                    .button {
                                        display: inline-block;
                                        padding: 12px 20px;
                                        background-color: #28a745;
                                        color: #ffffff;
                                        font-size: 16px;
                                        text-align: center;
                                        text-decoration: none;
                                        border-radius: 5px;
                                        margin-top: 20px;
                                    }
                        
                                    .button:hover {
                                        background-color: #218838;
                                    }
                        
                                    .decoration {
                                        background: url('https://cdn.pixabay.com/photo/2016/10/14/15/44/celebration-1736967_960_720.jpg') center center no-repeat;
                                        background-size: cover;
                                        padding: 50px;
                                        text-align: center;
                                        color: white;
                                        font-size: 24px;
                                        border-radius: 5px;
                                        margin-top: 20px;
                                    }
                        
                                    .google-maps-button {
                                        text-align: center;
                                        margin-top: 20px;
                                    }
                        
                                    .google-maps-button a {
                                        display: inline-block;
                                        padding: 12px 20px;
                                        background-color: #007bff;
                                        color: white;
                                        font-size: 16px;
                                        text-align: center;
                                        text-decoration: none;
                                        border-radius: 5px;
                                    }
                        
                                    .google-maps-button a:hover {
                                        background-color: #0056b3;
                                    }
                                </style>
                            </head>
                            
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <h1>Votre Billet pour le Bal de Fler BDE</h1>
                                    </div>
                        
                                    <div class="content">
                                        <h2>🎉 Le grand événement de l'année approche ! 🎉</h2>
                                        <div class="info">
                                            <p><strong>Nom : </strong>${nom}</p>
                                            <p><strong>Prénom : </strong>${prenom}</p>
                                            <p><strong>Email : </strong>${email}</p>
                                            <p><strong>Type d'entrée : </strong>${typeEntree}</p>
                                        </div>
                        
                                        <h2>📅 Détails de l'événement</h2>
                                        <div class="info">
                                            <p><strong>Nom de l'événement : </strong>Bal de Fin d'Année 2025 🎉</p>
                                            <p><strong>Date : </strong>2 Juillet 2025</p>
                                            <p><strong>Heure : </strong>19h00</p>
                                            <p><strong>Lieu : </strong>Alvéole 12, Base sous-marine, Saint-Nazaire 🚢</p>
                                            <div class="google-maps-button">
                                                <a href="https://www.google.com/maps?q=Alvéole+12,+Base+sous-marine,+Saint-Nazaire" target="_blank">Accéder à l'événement sur Google Maps</a>
                                            </div>
                                        </div>
                        
                                        <div class="qrcode-container">
                                        <p><strong>Voici votre QR Code d'entrée pour l'événement :</strong></p>
                                        <img src="${qrCodeUrl}" alt="QR Code">
                                    </div>
                        
                                        <p><strong>N'oubliez pas d'apporter votre billet le jour J, sur votre téléphone ! Il est impératif pour accéder à la soirée. 🎶✨</strong></p>
                                    </div>
                        
                                    <div class="footer">
                                        <p>Si vous avez des questions, contactez-nous à <a href="mailto:flerbde@gmail.com">flerbde@gmail.com</a>.</p>
                                        <p>Suivez-nous pour plus d'infos et d'actualités sur nos réseaux sociaux ! 📱</p>
                                    </div>
                                </div>
                            </body>
                            `,
                            Attachments: [
                                {
                                    ContentType: "image/png",  // Type MIME de l'image
                                    Filename: "qr_code.png",   // Nom du fichier attaché
                                    Base64Content: qrCodeBuffer.toString('base64'),  // Contenu de l'image encodé en base64
                                },
                            ],
                        },
                    ],
                },
                {
                    auth: {
                        username: "3a7611ed748090a354618398c0cee607",
                        password: "2c017356f2620a9b555482d219a483c2",
                    },
                }
            );

            return res.status(200).json({ message: "Email envoyé avec succès !" });
        } catch (error) {
            console.error("Erreur envoi email :", error);
            return res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
        }
    });
});
