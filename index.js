const listeElement = document.getElementById("listeRecettes");
const barreRecherche = document.getElementById("recherche");
const menuCategories = document.getElementById("categories");
const itemsCategories = document.querySelectorAll(".cat-item");

const modal = document.getElementById("modalRecette");
const modalDetails = document.getElementById("modalDetails");
const closeModalBtn = document.querySelector(".close-modal");

let toutesLesRecettes = [];

// 1. Chargement des données
fetch("recettes.json")
  .then((res) => res.json())
  .then((data) => {
    toutesLesRecettes = data;
    afficherRecettes(toutesLesRecettes);
  })
  .catch((err) => console.error("Problème de chargement :", err));

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
      if (recette.catégorie) {
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
// let recettes = JSON.parse(localStorage.getItem("recettes")) || [];

// function sauvegarder() {
//     localStorage.setItem("recettes", JSON.stringify(recettes));
// }

// function ajouterRecette() {
//     let nom = document.getElementById("nom").value;
//     let categorie = document.getElementById("categorie").value;
//     let ingredients = document.getElementById("ingredients").value;
//     let etapes = document.getElementById("etapes").value;

//     let recette = {
//         nom,
//         categorie,
//         ingredients,
//         etapes
//     };

//     recettes.push(recette);
//     sauvegarder();
//     afficherRecettes();
// }

// function afficherRecettes() {
//     let liste = document.getElementById("listeRecettes");
//     liste.innerHTML = "";

//     recettes.forEach((r, index) => {
//         liste.innerHTML += `
//             <div class="recette">
//                 <h3>${r.nom} (${r.categorie})</h3>
//                 <p><strong>Ingrédients :</strong><br>${r.ingredients}</p>
//                 <p><strong>Étapes :</strong><br>${r.etapes}</p>
//                 <button onclick="supprimerRecette(${index})">❌ Supprimer</button>
//             </div>
//         `;
//     });
// }

// function supprimerRecette(index) {
//     recettes.splice(index, 1);
//     sauvegarder();
//     afficherRecettes();
// }

// afficherRecettes();
//-------------------------//
