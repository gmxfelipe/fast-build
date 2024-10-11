function loadComponent(selector, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.querySelector(selector).innerHTML = data;
    })
    .catch(error => console.error('Erro ao carregar o componente:', error));
}

document.addEventListener("DOMContentLoaded", function () {
  loadComponent("#navbar-placeholder", "navbar.html");
  loadComponent("#footer-placeholder", "footer.html");
});




