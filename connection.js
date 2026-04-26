const bookClosed = document.getElementById("bookClosed");
const bookOpen = document.getElementById("bookOpen");
const closeBtn = document.getElementById("closeBtn");
const welcomeForm = document.getElementById("welcomeForm");
const successMsg = document.getElementById("successMsg");
const emailInput = document.getElementById("email");
const nameInput = document.getElementById("name");

// Ouvrir le livre
bookClosed.addEventListener("click", () => {
  bookOpen.classList.add("active");
});

// Fermer le livre
closeBtn.addEventListener("click", () => {
  bookOpen.classList.remove("active");
  welcomeForm.reset();
  successMsg.style.display = "none";
});

// Soumettre le formulaire
welcomeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;

  // Afficher le message de succès
  successMsg.textContent = `✓ Bienvenue ${name}! Vos recettes vous attendent... 🍳`;
  successMsg.style.display = "block";

  // Désactiver le formulaire temporairement
  welcomeForm.style.opacity = "0.5";
  welcomeForm.style.pointerEvents = "none";

  // Après 2 secondes, réinitialiser
  setTimeout(() => {
    welcomeForm.reset();
    successMsg.style.display = "none";
    welcomeForm.style.opacity = "1";
    welcomeForm.style.pointerEvents = "auto";
  }, 2000);
});
