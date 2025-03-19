const scanner = new Html5Qrcode("qr-reader");

function startScanner() {
    scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            console.log("QR Code détecté :", decodedText);
            scanner.stop();
            window.location.href = `conso.html?id=${decodedText}`;
        },
        (errorMessage) => {
            console.log("Erreur de scan :", errorMessage);
        }
    ).catch(err => console.error("Erreur lors du démarrage du scanner", err));
}

document.addEventListener("DOMContentLoaded", () => {
    startScanner();
});
