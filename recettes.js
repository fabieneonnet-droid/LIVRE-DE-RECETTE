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
  // 1. On charge les recettes
  const { data: recettes, error: errRecettes } = await _supabase
    .from("RECETTES")
    .select("*");

  if (errRecettes) {
    console.error("Erreur recettes:", errRecettes);
    return;
  }

  // 2. On charge les liaisons
  const { data: liaisons, error: errLiaisons } = await _supabase
    .from("composition_recette")
    .select("*");

  if (errLiaisons) {
    console.error("Erreur liaisons:", errLiaisons);
    toutesLesRecettes = recettes;
    afficherRecettes(toutesLesRecettes);
    return;
  }

  // --- LE DÉTECTEUR (LOGS DE DÉBOGAGE) ---
  // console.log("--- VÉRIFICATION DES DONNÉES SUPABASE ---");
  // console.log("Liste de TOUTES les recettes chargées :", recettes);
  // console.log("Liste de TOUTES les liaisons chargées :", liaisons);
  // ---------------------------------------

  // 3. Assemblage en forçant les types
  toutesLesRecettes = recettes.map((recette) => {
    // On cherche les liaisons pour cette recette
    const liens = liaisons.filter(
      (l) =>
        String(l.recette_principale_id).trim() === String(recette.id).trim(),
    );

    recette.composition = liens
      .map((lien) => {
        const sousRecette = recettes.find(
          (r) => String(r.id).trim() === String(lien.sous_recette_id).trim(),
        );
        return {
          ordre_montage: lien.ordre_montage,
          sous_recette: sousRecette,
        };
      })
      .sort((a, b) => a.ordre_montage - b.ordre_montage);

    return recette;
  });

  afficherRecettes(toutesLesRecettes);
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

  // 1. On prépare le HTML des sous-recettes de manière ultra-sécurisée
  let composantsHTML = "";
  if (recette && recette.composition && recette.composition.length > 0) {
    const sousRecettesValides = recette.composition.filter(
      (item) => item && item.sous_recette,
    );

    if (sousRecettesValides.length > 0) {
      composantsHTML = `
      <hr>
      <h3 style="color: #F19E39;">Composants à préparer :</h3>
    `;

      sousRecettesValides.forEach((item) => {
        const sub = item.sous_recette;

        // --- SÉCURISATION ACCENT / SANS ACCENT ---
        // On récupère les ingrédients qu'ils soient stockés avec ou sans accent
        const donneesIngredients = sub.ingrédients || sub.ingredients;

        let subIngHtml = "";
        if (donneesIngredients) {
          let subIngList = [];

          if (typeof donneesIngredients === "string") {
            try {
              subIngList = JSON.parse(donneesIngredients);
            } catch (e) {
              subIngList = [donneesIngredients];
            }
          } else if (Array.isArray(donneesIngredients)) {
            subIngList = donneesIngredients;
          }

          if (Array.isArray(subIngList) && subIngList.length > 0) {
            subIngHtml = subIngList
              .map((ing) => {
                if (typeof ing === "object" && ing !== null) {
                  return `<li>${ing.quantite ? ing.quantite + " " : ""}${ing.nom || ""}</li>`;
                }
                return `<li>${ing}</li>`;
              })
              .join("");
          }
        }
        // -----------------------------------------------------------------

        composantsHTML += `
        <div class="sous-recette-bloc" style="margin-left: 15px; margin-bottom: 25px; padding: 10px; border-left: 3px solid #F19E39; background-color: #fafafa;">
          <h4 style="margin-top: 0; margin-bottom: 5px; font-size: 1.3rem;">
            ${item.ordre_montage}. ${sub.nom}
          </h4>
          
          <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Ingrédients pour le composant :</strong></p>
          <ul style="list-style-type: none; padding-left: 20px; margin-bottom: 5px;font-size: 0.10rem;">
            ${subIngHtml || "<li>Aucun ingrédient spécifié</li>"}
          </ul>
          
          <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Procédé :</strong></p>
          <p style="white-space: pre-line; margin-top: 5px; font-size: 1rem; color: #444;">${sub.instruction || "Aucune instruction"}</p>
        </div>
      `;
      });
    }
  }
  // 2. On injecte le HTML global (Inchangé, composantsHTML est maintenant beaucoup plus complet)
  modalDetails.innerHTML = `
  <div id="zone-pdf" style="padding: 0px;">
    <h2 style="text-align: center; margin-top: 0;">${recette.nom || ""}</h2>
    <p style="text-align: center;"><strong>Catégorie :</strong> ${recette.categorie || ""}</p>

    <div class="logo-pdf" id="actions-recette">  
      <img id="pdf-imprimer" src="./assets/symbol/print_24dp_F19E39_FILL0_wght400_GRAD0_opsz24.png" style="padding: 10px 40px; cursor: pointer;" title="Imprimer">
      <img id="pdf-partager" src="./assets/symbol/share_24dp_F19E39_FILL0_wght400_GRAD0_opsz24.png" style="padding: 10px 40px; cursor: pointer;" title="Partager">
      <img id="pdf-telecharger" src="./assets/symbol/download_24dp_F19E39_FILL0_wght400_GRAD0_opsz24.png" style="padding: 10px 40px; cursor: pointer;" title="Télécharger">
    </div>
    <hr>
    <h3>Ingrédients :</h3>
    <div class="container-liste">
      <ul class="ma-liste-rectte">
          ${Array.isArray(lesIngredients) ? lesIngredients.map((ing) => `<li>${ing}</li>`).join("") : ""}
      </ul>
    </div>
    
    <!-- Ici vont s'afficher les recettes complètes de la génoise, de la mousse, etc. -->
    ${composantsHTML}
    
    <hr>
    <h3>Instructions (Montage) :</h3>
    <p class="instruction-texte" style="white-space: pre-line; font-size: 1.2rem">${recette.instruction || ""}</p>
  </div>
`;

  modal.style.display = "block";
  // 2. Configuration pour l'export PDF
  const elementAElements = document.getElementById("zone-pdf");
  const options = {
    margin: 15, // Marges de 15mm tout autour du papier A4
    filename: `${recette.nom.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      type: "print", // <-- FORCE HTML2PDF À UTILISER LE STYLE @MEDIA PRINT
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css"] },
    ignoreElements: (el) => el.id === "actions-recette",
  };
  // 3. Liaison des actions
  document.getElementById("pdf-telecharger").addEventListener("click", () => {
    html2pdf().set(options).from(elementAElements).save();
  });

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
          "Le partage direct n'est pas disponible. Vous pouvez télécharger le PDF.",
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
