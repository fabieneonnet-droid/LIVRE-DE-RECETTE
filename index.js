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
  const password = document.getElementById("passeword").value;

  // Tentative de connexion via l'authentification Supabase
  const { data, error } = await _supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert("Erreur : " + error.message);
  } else {
    const successMsg = document.getElementById("successMsg");
    if (successMsg) successMsg.style.display = "block";

    // --- UTULISATION DU TOKEN DE SESSION ---
    // Supabase stocke automatiquement la session, mais on s'assure qu'elle est bien là
    localStorage.setItem("session_active", "true");

    // Redirection immédiate vers la page des recettes après 1,5 seconde
    setTimeout(() => {
      window.location.href = "recettes.html";
    }, 1500);
  }
});
