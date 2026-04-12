const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Route pour lire les recettes
app.get("/recettes", (req, res) => {
  fs.readFile("recettes.json", "utf8", (err, data) => {
    if (err) return res.status(500).send(err);
    res.send(JSON.parse(data));
  });
});

// Route pour ajouter une recette et SAUVEGARDER dans le fichier
app.post("/ajouter-recette", (req, res) => {
  fs.readFile("recettes.json", "utf8", (err, data) => {
    if (err) return res.status(500).send(err);

    const recettes = JSON.parse(data);
    const nouvelleRecette = req.body;
    recettes.push(nouvelleRecette);

    fs.writeFile("recettes.json", JSON.stringify(recettes, null, 2), (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "Recette enregistrée sur le disque !" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
