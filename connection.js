const book = document.getElementById("recipeBook");

book.addEventListener("click", (e) => {
  // Si on clique sur un champ ou le bouton, on ne fait rien
  if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;

  // Sinon, on ouvre ou on ferme
  book.classList.toggle("open");
});
