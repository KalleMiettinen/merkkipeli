const videoInput = document.getElementById("videoInput");
const fileName = document.getElementById("fileName");
const form = document.getElementById("analysisForm");
const promptInput = document.getElementById("promptInput");
const resultCard = document.getElementById("resultCard");
const loader = document.getElementById("loader");
const resultContent = document.getElementById("resultContent");

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];

  if (!file) {
    fileName.textContent = "MP4, MOV tai muu selaimen tukema videotiedosto";
    return;
  }

  fileName.textContent = `${file.name} (${formatBytes(file.size)})`;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const file = videoInput.files[0];
  const prompt = promptInput.value.trim();

  if (!file) {
    showResult("Valitse ensin videotiedosto.", "error");
    return;
  }

  if (!prompt) {
    showResult("Kirjoita mitä haluat selvittää videosta.", "error");
    return;
  }

  resultCard.classList.remove("hidden");
  loader.classList.remove("hidden");
  resultContent.innerHTML = "";

  setTimeout(() => {
    loader.classList.add("hidden");

    resultContent.innerHTML = `
      <p class="eyebrow">Prototyyppitulos</p>
      <h3>Analyysipyyntö vastaanotettu</h3>
      <p><strong>Video:</strong> ${escapeHtml(file.name)}</p>
      <p><strong>Pyyntö:</strong> ${escapeHtml(prompt)}</p>
      <p>
        Tässä prototyypissä videota ei vielä lähetetä tekoälylle.
        Seuraava kehitysvaihe on backend, joka ottaa videon vastaan,
        tallentaa sen ja kutsuu AI-rajapintaa analyysin tekemiseen.
      </p>
    `;
  }, 1000);
});

function showResult(message, type = "info") {
  resultCard.classList.remove("hidden");
  loader.classList.add("hidden");
  resultContent.innerHTML = `<p class="${type}">${escapeHtml(message)}</p>`;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(1)} ${units[index]}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
