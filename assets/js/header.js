/* ========================================
   HEADER.JS - Injection automatique du header
   ======================================== */

(function () {

  /* --- Configuration à surcharger dans chaque page --- */
  const APP_NAME = window.APP_NAME || "Application";
  const BASE_PATH = window.BASE_PATH || "../../";

  /* --- Construction du HTML du header --- */
  function buildHeader() {
    const header = document.createElement("header");
    header.id = "app-header";

    // Colonne 1 : logo
    const logoLink = document.createElement("a");
    logoLink.href = "https://lyceecleusmeur.net/";
    logoLink.target = "_blank";
    logoLink.rel = "noopener noreferrer";
    logoLink.className = "header-logo-link";
    const logoImg = document.createElement("img");
    logoImg.src = BASE_PATH + "assets/icones/Logo.svg";
    logoImg.alt = "Logo du Lycée Le Cleusmeur";
    logoLink.appendChild(logoImg);

    // Colonne 2 : nom du lycée
    const schoolName = document.createElement("span");
    schoolName.className = "header-school-name";
    schoolName.textContent = "Le Cleusmeur";

    // Colonne 3 : nom de l'application
    const titles = document.createElement("div");
    titles.className = "header-titles";
    const appName = document.createElement("span");
    appName.className = "header-app-name";
    appName.textContent = window.APP_NAME || "Application";
    titles.appendChild(appName);

    // Colonne 4 : QR + toggle
    const right = document.createElement("div");
    right.className = "header-right";

    const qrWrapper = document.createElement("div");
    qrWrapper.className = "qr-wrapper";
    qrWrapper.title = "Cliquer pour agrandir le QR Code";
    qrWrapper.id = "qr-mini"; // ← corrigé : était "qr-small"

    const toggleWrapper = document.createElement("div");
    toggleWrapper.className = "toggle-wrapper";
    const iconSun = document.createElement("span");
    iconSun.className = "toggle-icon";
    iconSun.textContent = "☀️";
    const label = document.createElement("label");
    label.className = "toggle-switch";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = "dark-toggle";
    const slider = document.createElement("span");
    slider.className = "toggle-slider";
    label.appendChild(input);
    label.appendChild(slider);
    const iconMoon = document.createElement("span");
    iconMoon.className = "toggle-icon";
    iconMoon.textContent = "🌙";
    toggleWrapper.appendChild(iconSun);
    toggleWrapper.appendChild(label);
    toggleWrapper.appendChild(iconMoon);

    right.appendChild(qrWrapper);
    right.appendChild(toggleWrapper);

    // Assemblage
    header.appendChild(logoLink);
    header.appendChild(schoolName);
    header.appendChild(titles);
    header.appendChild(right);

    return header;
  }

  /* --- Modal QR Code --- */
  function buildModal() {
    const modal = document.createElement("div");
    modal.id = "qr-modal";
    modal.innerHTML = `
      <div class="qr-modal-content">
        <button class="qr-modal-close" id="qr-modal-close" title="Fermer">✕</button>
        <div id="qr-large"></div>
        <p id="qr-url"></p>
      </div>
    `;
    return modal;
  }

  /* --- Génération QR Code via bibliothèque locale --- */
  function generateQRCodes(url) {
    // Mini QR dans le header
    new QRCode(document.getElementById("qr-mini"), {
      text: url,
      width: 48,
      height: 48,
      correctLevel: QRCode.CorrectLevel.M
    });

    // Grand QR dans la modal
    new QRCode(document.getElementById("qr-large"), {
      text: url,
      width: 220,
      height: 220,
      correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById("qr-url").textContent = url;
  }

  /* --- Gestion de la modal --- */
  function setupModal() {
    const modal = document.getElementById("qr-modal");
    const miniQR = document.getElementById("qr-mini");
    const closeBtn = document.getElementById("qr-modal-close");

    function openModal() { modal.classList.add("open"); }
    function closeModal() { modal.classList.remove("open"); }

    miniQR.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);

    // Clic en dehors
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    // Touche Echap
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  /* --- Gestion du toggle dark mode --- */
  function setupDarkMode() {
    const toggle = document.getElementById("dark-toggle");

    // Mode clair par défaut, pas de mémorisation
    document.documentElement.removeAttribute("data-theme");

    toggle.addEventListener("change", function () {
      if (this.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    });
  }

  /* --- Chargement de la bibliothèque QRCode puis initialisation --- */
  function loadQRLibAndInit() {
    const script = document.createElement("script");
    script.src = BASE_PATH + "assets/js/qrcode.min.js";
    script.onload = function () {
      const url = window.location.href;
      generateQRCodes(url);
      setupModal();
    };
    script.onerror = function () {
      console.warn("Bibliothèque QRCode non trouvée à : " + script.src);
    };
    document.head.appendChild(script);
  }

  /* --- Point d'entrée --- */
  function init() {
    // Favicon
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = BASE_PATH + "assets/icones/Logo.svg";
    favicon.type = "image/svg+xml";
    document.head.appendChild(favicon);
    // Lien vers la charte CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = BASE_PATH + "assets/css/charte.css";
    document.head.prepend(link);

    // Injection du header et de la modal
    const header = buildHeader();
    const modal = buildModal();
    document.body.prepend(modal);
    document.body.prepend(header);

    // Dark mode
    setupDarkMode();

    // QR Code
    loadQRLibAndInit();
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
