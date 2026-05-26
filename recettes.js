// --- SÉCURITÉ : VÉRIFICATION DE LA CONNEXION ---
// Si l'utilisateur n'a pas de session active, on le renvoie au livre de connexion
if (localStorage.getItem("session_active") !== "true") {
  window.location.href = "connection.html";
}
const supabaseUrl = "https://nyyrwsnzqvxcbbevfymo.supabase.co";
const supabaseKey = "sb_publishable_oG4jPZy_5eyd9PfznFCqwg_9XwUWxWt";
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const listeElement = document.getElementById("listeRecettes");
const barreRecherche = document.getElementById("recherche");
const menuCategories = document.getElementById("categories");
const itemsCategories = document.querySelectorAll(".cat-item");

const modal = document.getElementById("modalRecette");
const modalDetails = document.getElementById("modalDetails");
const closeModalBtn = document.querySelector(".close-modal");

let toutesLesRecettes = [];

async function chargerRecettes() {
  const { data, error } = await _supabase.from("RECETTES").select("*");
  if (error) {
    console.error("Erreur de chargement Supabase:", error);
  } else {
    toutesLesRecettes = data;
    afficherRecettes(toutesLesRecettes);
  }
}

// On lance le chargement
chargerRecettes();

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

  // 1. On injecte le HTML (Ajout d'id "pdf-..." sur les images et d'un id "zone-pdf" sur le contenu)
  modalDetails.innerHTML = `
    <div id="zone-pdf" style="padding: 10px;">
      <h2 style="text-align: center; margin-top: 0;">${recette.nom}</h2>
      <p style="text-align: center;"><strong>Catégorie :</strong> ${recette.categorie}</p>

      <div class="logo-pdf" id="actions-recette">  
        <img id="pdf-imprimer" src="./assets/symbol/print_24dp_F19E39_FILL0_wght400_GRAD0_opsz24.png" style="padding: 10px 40px; cursor: pointer;" title="Imprimer">
        <img id="pdf-partager" src="./assets/symbol/share_24dp_F19E39_FILL0_wght400_GRAD0_opsz24.png" style="padding: 10px 40px; cursor: pointer;" title="Partager">
        <img id="pdf-telecharger" src="./assets/symbol/download_24dp_F19E39_FILL0_wght400_GRAD0_opsz24.png" style="padding: 10px 40px; cursor: pointer;" title="Télécharger">
      </div>
      <hr>
      <h3>Ingrédients :</h3>
      <div class="container-liste">
        <ul class="ma-liste-rectte">
            ${lesIngredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
      </div>
      <hr>
      <h3>Instructions :</h3>
      <p class="instruction-texte" style="white-space: pre-line;">${recette.instruction}</p>
    </div>
  `;

  modal.style.display = "block";

  // 2. Configuration pour l'export PDF
  const elementAElements = document.getElementById("zone-pdf");
  const options = {
    margin: 5,
    filename: `${recette.nom.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true }, // scale: 2 évite le flou
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    ignoreElements: (el) => el.id === "actions-recette", // Masque les boutons d'action sur le PDF imprimé !
  };

  // 3. Liaison des actions aux boutons fraîchement créés

  // ACTION : TÉLÉCHARGER
  document.getElementById("pdf-telecharger").addEventListener("click", () => {
    html2pdf().set(options).from(elementAElements).save();
  });

  // ACTION : IMPRIMER
  document.getElementById("pdf-imprimer").addEventListener("click", () => {
    html2pdf()
      .set(options)
      .from(elementAElements)
      .outputPdf("bloburl")
      .then((pdfUrl) => {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = pdfUrl;
        document.body.appendChild(iframe);
        iframe.contentWindow.print();
      });
  });

  // ACTION : PARTAGER
  document
    .getElementById("pdf-partager")
    .addEventListener("click", async () => {
      const pdfBlob = await html2pdf()
        .set(options)
        .from(elementAElements)
        .output("blob");
      const file = new File([pdfBlob], `${recette.nom}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Recette : ${recette.nom}`,
            text: `Voici la recette pour réaliser : ${recette.nom}`,
          });
        } catch (error) {
          console.error("Erreur de partage :", error);
        }
      } else {
        alert(
          "Le partage direct n'est pas disponible sur ce navigateur. Vous pouvez télécharger le PDF.",
        );
      }
    });
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
  // Dans ton welcomeForm.addEventListener('submit', ...), remplace le fetch par :
  async function sauvegarderRecette(nouvelleRecette) {
    const { data, error } = await _supabase
      .from("RECETTES")
      .insert([nouvelleRecette]);
    if (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } else {
      alert("Recette enregistrée dans le Cloud !");
      location.reload();
    }
  }

  // Appelle cette fonction à la place de ton ancien fetch()
  sauvegarderRecette(nouvelleRecette);
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
