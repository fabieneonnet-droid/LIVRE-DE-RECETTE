const listeElement = document.getElementById("listeRecettes");
const barreRecherche = document.getElementById("recherche");
const menuCategories = document.getElementById("categories");
const itemsCategories = document.querySelectorAll(".cat-item");

const modal = document.getElementById("modalRecette");
const modalDetails = document.getElementById("modalDetails");
const closeModalBtn = document.querySelector(".close-modal");

let toutesLesRecettes = [];

// 1. Chargement des données
fetch("http://localhost:3000/recettes")
  .then((res) => res.json())
  .then((data) => {
    toutesLesRecettes = data;
    afficherRecettes(toutesLesRecettes);
  });

// 2. Événement de recherche
barreRecherche.addEventListener("input", (e) => {
  const saisie = e.target.value.toLowerCase();

  // On cache/affiche les catégories proprement
  menuCategories.style.display = saisie.length > 0 ? "none" : "grid";

  const filtre = toutesLesRecettes.filter((recette) =>
    recette.nom.toLowerCase().includes(saisie),
  );
  afficherRecettes(filtre);
});

// 3. Clic sur les catégories
itemsCategories.forEach((item) => {
  item.addEventListener("click", () => {
    const catNom = item.textContent.trim().toLowerCase();
    const filtre = toutesLesRecettes.filter((recette) => {
      if (recette.categorie) {
        return recette.categorie.toLowerCase() === catNom;
      }
      return false;
    });

    afficherRecettes(filtre);

    barreRecherche.value = ""; // On vide la barre
    menuCategories.style.display = "grid"; // On garde le menu
    afficherRecettes(filtre);
    listeElement.scrollIntoView({ behavior: "smooth" });
  });
});

// 4. Fonction pour afficher les recettes
function afficherRecettes(recettes) {
  listeElement.innerHTML = "";

  recettes.forEach((recette) => {
    // Sécurité orthographe JSON
    const ingredientsArr = recette.ingredients || recette.ingredient || [];

    // Création de l'élément div proprement
    const card = document.createElement("div");
    card.className = "recette-card";
    card.innerHTML = `
        <h3>${recette.nom}</h3>
        <p>${ingredientsArr.slice(0, 3).join(",")}...</p> 
        <p><em>Cliquez pour voir la suite</em></p>
    `;

    // --- LA RÉPONSE À TON PROBLÈME ---
    // On ajoute l'événement directement sur la card qu'on vient de créer
    card.addEventListener("click", () => {
      ouvrirModale(recette);
    });

    listeElement.appendChild(card);
  });
}

// 5. Ouverture de la modale
function ouvrirModale(recette) {
  const lesIngredients = recette.ingredients || recette.ingredient || [];

  modalDetails.innerHTML = `
      <h2 >${recette.nom}</h2>
      <p><strong>Catégorie :</strong> ${recette.categorie}</p>
      <hr>
      <h3>Ingrédients :</h3>
      <ul style="list-style: none;padding-left:200px; display : block;line-height:2px;">
          ${lesIngredients
            .map(
              (ing) =>
                `<li style="font-size : 1.5rem;width:100%; text-align:left;padding:20px; margin-bottom: 5px;">${ing}</li>`,
            )
            .join("")}
      </ul>
      <hr>
      <h3>Instructions :</h3>
      <p>${recette.instruction}</p>
  `;
  modal.style.display = "block";
}

// 6. Fermeture de la modale
closeModalBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});
//----------------------------------------------------------------------------------

itemsCategories.forEach((item) => {
  item.addEventListener("click", () => {
    const catNom = item.textContent.trim().toLowerCase();

    const tranches = {
      boulangerie: { min: 0, max: 999 },
      pâtisserie: { min: 1000, max: 1999 },
      confiserie: { min: 2000, max: 2999 },
      viennoiserie: { min: 3000, max: 3999 },
      chocolaterie: { min: 4000, max: 4500 },
      glacerie: { min: 5000, max: 5999 },
    };

    const limite = tranches[catNom];

    const filtre = toutesLesRecettes.filter((recette) => {
      if (limite) {
        return recette.id >= limite.min && recette.id <= limite.max;
      }
      return false;
    });

    afficherRecettes(filtre);

    barreRecherche.value = "";
    menuCategories.style.display = "grid";
    listeElement.scrollIntoView({ behavior: "smooth" });
  });
});

//-------------------------------------------------------------------------------------------
const modals = document.getElementById("recipeModal");
const btn = document.getElementById("addRecipeBtn");
const span = document.getElementsByClassName("close")[0];

// Ouvrir la fenêtre au clic
btn.onclick = function () {
  modals.style.display = "block";
};

// Fermer au clic sur le X
span.onclick = function () {
  modals.style.display = "none";
};

// Fermer si on clique en dehors de la fenêtre
window.onclick = function (event) {
  if (event.target == modals) {
    modals.style.display = "none";
  }
};

//------------------------------------------------------------------------------------------------
// --- GESTION DE L'AJOUT DE RECETTE ---
const recipeForm = document.getElementById("recipeForm");

recipeForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Empêche le rechargement de la page

  // 1. Récupérer les valeurs
  const nom = document.getElementById("recipeName").value;
  const cat = document.getElementById("categorie").value;
  const ingredientsBruts = document.getElementById("recipeIngredient").value;
  const instruction = document.getElementById("recipeInstruction").value;

  if (!nom || !instruction) {
    alert("Veuillez remplir au moins le nom et les instructions.");
    return;
  }

  // 2. Transformer le texte des ingrédients en tableau
  // On sépare par ligne ou par virgule
  const ingredientsArray = ingredientsBruts
    .split(/[,\n]/)
    .map((ing) => ing.trim())
    .filter((ing) => ing !== "");

  // 3. Générer l'ID automatique selon tes tranches
  const nouvelId = genererProchainID(cat);

  // 4. Créer l'objet recette
  const nouvelleRecette = {
    id: nouvelId,
    categorie: cat,
    nom: nom,
    tag: [cat], // Tag par défaut
    ingredients: ingredientsArray,
    instruction: instruction,
  };

  // Remplace ton ancienne logique d'enregistrement par celle-ci :
  fetch("http://localhost:3000/ajouter-recette", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nouvelleRecette),
  })
    .then((res) => res.json())
    .then((response) => {
      alert(response.message);
      location.reload(); // Recharge la page pour voir la nouvelle liste
    });

  // On ferme la modale
  modals.style.display = "none";
  recipeForm.reset();

  // On affiche la catégorie pour voir notre nouvelle recette
  const filtre = toutesLesRecettes.filter((r) => r.id === nouvelId);
  afficherRecettes(filtre);

  alert(`Recette ajoutée avec succès ! ID attribué : ${nouvelId}`);
  console.log("Fichier JSON virtuel mis à jour :", toutesLesRecettes);
});

// Fonction pour calculer l'ID selon tes tranches existantes
function genererProchainID(categorie) {
  const tranches = {
    boulangerie: 0,
    patisserie: 1000,
    confiserie: 2000,
    viennoiserie: 3000,
    chocolaterie: 4000,
    glacerie: 5000,
  };

  const min = tranches[categorie] || 9000;
  const max = min + 999;

  // Trouver les IDs de cette catégorie
  const idsExistants = toutesLesRecettes
    .filter((r) => r.id >= min && r.id <= max)
    .map((r) => r.id);

  if (idsExistants.length === 0) return min;

  return Math.max(...idsExistants) + 1;
}
