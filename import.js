// const { createClient } = require("@supabase/supabase-js");
// const fs = require("fs");

// // 1. Tes accès Supabase
// const supabase = createClient("https://supabase.com/dashboard/project/nyyrwsnzqvxcbbevfymo/settings", "sb_publishable_oG4jPZy_5eyd9PfznFCqwg_9XwUWxWt");

// // 2. Lire ton fichier local
// const recettes = JSON.parse(fs.readFileSync("recettes.json", "utf8"));

// async function importerDonnees() {
//   console.log(`Début de l'importation de ${recettes.length} recettes...`);

//   // On prépare les données pour Supabase
//   // On retire l'ID si tu veux que Supabase les génère automatiquement
//   const donneesAImporter = recettes.map((r) => ({
//     nom: r.nom,
//     categorie: r.categorie,
//     ingredients: r.ingredients, // Sera stocké en JSONB automatiquement
//     instruction: r.instruction,
//   }));

//   const { data, error } = await supabase
//     .from("recettes")
//     .insert(donneesAImporter);

//   if (error) {
//     console.error("Erreur d'import :", error);
//   } else {
//     console.log("Importation réussie !");
//   }
// }

// importerDonnees();
