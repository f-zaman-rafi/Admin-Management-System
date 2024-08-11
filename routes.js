document.addEventListener("DOMContentLoaded", function () {
    function navigate() {
        const sections = document.querySelectorAll(".main");
        const currentHash = window.location.hash || "#dashboard"; // Default to Dashboard

        sections.forEach(section => {
            if (`#${section.id}` === currentHash) {
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        });
    }

    // Initial navigation on page load
    navigate();

    // Navigate to the appropriate section on hash change
    window.addEventListener("hashchange", navigate);
});
