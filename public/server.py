from flask import Flask, request, jsonify
import qrcode
from fpdf import FPDF
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os

app = Flask(__name__)

# 📧 Config e-mail (MODIFIE AVEC TES INFOS)
EMAIL_SENDER = "flerbde@gmail.com"
EMAIL_PASSWORD = "ucul kqag vfpm lpmm"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# 📌 Fonction pour générer le QR Code
def generate_qr(qr_data, id):
    qr = qrcode.make(qr_data)
    qr_path = f"qrcodes/{id}.png"
    qr.save(qr_path)
    return qr_path

# 🎫 Fonction pour générer le billet PDF
def generate_ticket(id, nom, prenom, type_entree, qr_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    
    pdf.cell(200, 10, "🎟️ Billet de Bal 🎟️", ln=True, align="C")
    pdf.ln(10)

    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, f"🎫 ID: {id}", ln=True)
    pdf.cell(200, 10, f"👤 Nom: {nom}", ln=True)
    pdf.cell(200, 10, f"📝 Prénom: {prenom}", ln=True)
    pdf.cell(200, 10, f"🎟️ Type d'entrée: {type_entree}", ln=True)
    pdf.ln(10)

    pdf.image(qr_path, x=75, y=100, w=60)

    ticket_path = f"tickets/{id}.pdf"
    pdf.output(ticket_path)
    return ticket_path

# 📧 Fonction pour envoyer l'email avec le billet
def send_email(email, nom, ticket_path):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER
    msg["To"] = email
    msg["Subject"] = "🎫 Votre billet pour le Bal"

    body = f"Bonjour {nom},\n\nVoici votre billet pour le bal !\n\nPrésentez ce QR Code à l'entrée.\n\nÀ bientôt !"
    msg.attach(MIMEText(body, "plain"))

    with open(ticket_path, "rb") as attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(ticket_path)}")
        msg.attach(part)

    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(EMAIL_SENDER, EMAIL_PASSWORD)
    server.sendmail(EMAIL_SENDER, email, msg.as_string())
    server.quit()

# 🔥 API pour recevoir les données et envoyer le billet
@app.route("/send_ticket", methods=["POST"])
def send_ticket():
    data = request.json
    id = data["id"]
    nom = data["nom"]
    prenom = data["prenom"]
    type_entree = data["type_entree"]
    email = data["email"]
    qr_data = data["qrData"]

    try:
        os.makedirs("qrcodes", exist_ok=True)
        os.makedirs("tickets", exist_ok=True)

        qr_path = generate_qr(qr_data, id)
        ticket_path = generate_ticket(id, nom, prenom, type_entree, qr_path)
        send_email(email, nom, ticket_path)

        return jsonify({"message": "Billet envoyé avec succès"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
