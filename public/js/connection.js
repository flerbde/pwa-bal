document.addEventListener("DOMContentLoaded", () => {
    const offlineMessage = document.getElementById("offline-message");

    function updateOnlineStatus() {
        if (navigator.onLine) {
            offlineMessage.classList.add("hidden");
        } else {
            offlineMessage.classList.remove("hidden");
        }
    }

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    updateOnlineStatus();
});
