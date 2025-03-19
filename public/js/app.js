function checkInternetConnection() {
    if (!navigator.onLine) {
        alert("Pas de connexion, impossible de se connecter ❌");
    }
}

// Vérifier la connexion au chargement
window.addEventListener("load", checkInternetConnection);

// Vérifier en temps réel si la connexion change
window.addEventListener("online", () => alert("Connexion rétablie ✅"));
window.addEventListener("offline", () => alert("Pas de connexion ❌"));
