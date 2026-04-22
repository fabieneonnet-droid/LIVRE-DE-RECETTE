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
  })
  .catch((err) => console.error("Erreur chargement:", err));

// 2. Recherche
barreRecherche.addEventListener("input", (e) => {
  const saisie = e.target.value.toLowerCase();

  if (saisie.length > 0) {
    menuCategories.style.display = "none";
  } else {
    menuCategories.style.display = "";
  }

  const filtre = toutesLesRecettes.filter((recette) =>
    recette.nom.toLowerCase().includes(saisie),
  );
  afficherRecettes(filtre);
});
// 3. Clic sur les catégories (Version unifiée)
itemsCategories.forEach((item) => {
  item.addEventListener("click", () => {
    const catNom = item.textContent.trim().toLowerCase();

    const filtre = toutesLesRecettes.filter((recette) => {
      // On compare sans accent pour être sûr
      const catRecette = recette.categorie
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const catCible = catNom.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return catRecette === catCible;
    });

    barreRecherche.value = "";
    menuCategories.style.display = "";
    afficherRecettes(filtre);
    listeElement.scrollIntoView({ behavior: "smooth" });
  });
});

function afficherRecettes(recettes) {
  listeElement.innerHTML = "";
  recettes.forEach((recette) => {
    const ingredientsArr = recette.ingredients || recette.ingredient || [];
    const card = document.createElement("div");
    card.className = "recette-card";
    card.innerHTML = `
        <h3>${recette.nom}</h3>
        <p>${ingredientsArr.slice(0, 3).join(", ")}...</p> 
        <p><em>Cliquez pour voir la suite</em></p>
    `;
    card.addEventListener("click", () => ouvrirModale(recette));
    listeElement.appendChild(card);
  });
}

function ouvrirModale(recette) {
  const lesIngredients = recette.ingredients || recette.ingredient || [];

  modalDetails.innerHTML = `
      <h2 style="text-align: center;">${recette.nom}</h2>
      <p style="text-align: center;"><strong>Catégorie :</strong> ${recette.categorie}</p>
      <hr>
      <h3>Ingrédients :</h3>
      <div class="container-liste">
        <ul class="ma-liste-rectte">
            ${lesIngredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
      </div>
      <hr>
      <h3>Instructions :</h3>
      <p class="instruction-texte">${recette.instruction}</p>
  `;
  modal.style.display = "block";
}
// Gestion des modales (Fermeture)
closeModalBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === document.getElementById("recipeModal"))
    document.getElementById("recipeModal").style.display = "none";
};

// --- AJOUT DE RECETTE ---
const modalAjout = document.getElementById("recipeModal");
const btnAjout = document.getElementById("addRecipeBtn");
const closeAjout = document.querySelector(".close");
const recipeForm = document.getElementById("recipeForm");

btnAjout.onclick = () => (modalAjout.style.display = "block");
closeAjout.onclick = () => (modalAjout.style.display = "none");

recipeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nom = document.getElementById("recipeName").value;
  const cat = document.getElementById("categorie").value;
  const ingredientsBruts = document.getElementById("recipeIngredient").value;
  const instruction = document.getElementById("recipeInstruction").value;

  if (!nom || !instruction) {
    alert("Veuillez remplir le nom et les instructions.");
    return;
  }

  const ingredientsArray = ingredientsBruts
    .split(/[,\n]/)
    .map((i) => i.trim())
    .filter((i) => i !== "");
  const nouvelId = genererProchainID(cat);

  const nouvelleRecette = {
    id: nouvelId,
    categorie: cat,
    nom: nom,
    tag: [cat],
    ingredients: ingredientsArray,
    instruction: instruction,
  };

  fetch("http://localhost:3000/ajouter-recette", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nouvelleRecette),
  })
    .then((res) => res.json())
    .then((response) => {
      alert("Recette ajoutée !");
      location.reload();
    });
});

function genererProchainID(categorie) {
  const tranches = {
    boulangerie: 0,
    pâtisserie: 1000,
    confiserie: 2000,
    viennoiserie: 3000,
    chocolaterie: 4000,
    glacerie: 5000,
  };

  const min = tranches[categorie] !== undefined ? tranches[categorie] : 9000;
  const max = min + 999;

  const idsExistants = toutesLesRecettes
    .filter((r) => r.id >= min && r.id <= max)
    .map((r) => r.id);

  return idsExistants.length === 0 ? min : Math.max(...idsExistants) + 1;
}
