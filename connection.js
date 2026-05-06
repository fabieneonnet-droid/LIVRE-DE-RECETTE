// Initialisation de Supabase
const supabaseUrl = "https://nyyrwsnzqvxcbbevfymo.supabase.co";
const supabaseKey = "sb_publishable_oG4jPZy_5eyd9PfznFCqwg_9XwUWxWt";

// Utilise 'supabase.createClient' si tu as chargé le script via CDN
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const book = document.getElementById("recipeBook");
const welcomeForm = document.getElementById("welcomeForm");

// --- GESTION DE L'OUVERTURE DU LIVRE ---
book.addEventListener("click", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
  book.classList.toggle("open"); //
});

// --- GESTION DE LA CONNEXION ---
welcomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("passeword").value; // Respecte l'ID de ton HTML

  // Tentative de connexion via l'authentification Supabase
  const { data, error } = await _supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert("Erreur : " + error.message);
  } else {
    const successMsg = document.getElementById("successMsg");
    successMsg.style.display = "block";
    successMsg.textContent = "✓ Connexion réussie !";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  }
});
