const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 3000;

// --- CONFIGURATION SUPABASE ---
const supabaseUrl = "https://nyyrwsnzqvxcbbevfymo.supabase.co";
const supabaseKey = "sb_publishable_oG4jPZy_5eyd9PfznFCqwg_9XwUWxWt";
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());

// 1. Route pour lire les recettes depuis Supabase
app.get("/recettes", async (req, res) => {
  const { data, error } = await supabase.from("RECETTES").select("*");

  if (error) return res.status(500).json(error);
  res.send(data);
});

// 2. Route pour ajouter une recette sur Supabase
app.post("/ajouter-recette", async (req, res) => {
  const nouvelleRecette = req.body;

  const { data, error } = await supabase
    .from("RECETTES")
    .insert([nouvelleRecette]);

  if (error) return res.status(500).json(error);
  res.send({ message: "Recette enregistrée dans le Cloud !", data });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
