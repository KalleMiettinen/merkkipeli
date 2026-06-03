const videoInput = document.getElementById("videoInput");
const fileName = document.getElementById("fileName");
const form = document.getElementById("analysisForm");
const promptInput = document.getElementById("promptInput");
const targetInput = document.getElementById("targetInput");
const basePathInput = document.getElementById("basePathInput");
const resultCard = document.getElementById("resultCard");
const loader = document.getElementById("loader");
const resultContent = document.getElementById("resultContent");

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];

  if (!file) {
    fileName.textContent = "Esim. MP4, MOV tai muu videotiedosto";
    return;
  }

  fileName.textContent = `${file.name} (${formatBytes(file.size)})`;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const file = videoInput.files[0];
  const prompt = promptInput.value.trim();
  const target = targetInput.value;
  const basePath = basePathInput.value;

  if (!file) {
    showResult("Valitse ensin pelivideo.", "error");
    return;
  }

  resultCard.classList.remove("hidden");
  loader.classList.remove("hidden");
  resultContent.innerHTML = "";

  setTimeout(() => {
    loader.classList.add("hidden");

    resultContent.innerHTML = `
      <p class="eyebrow">Prototyyppitulos</p>
      <h3>Analyysipyyntö muodostettu</h3>
      <p><strong>Video:</strong> ${escapeHtml(file.name)}</p>
      <p><strong>Kohde:</strong> ${escapeHtml(target)}</p>
      <p><strong>Pesäväli:</strong> ${escapeHtml(basePath)}</p>
      <p><strong>Lisäohje:</strong> ${escapeHtml(prompt || "Ei lisäohjetta")}</p>

      <table class="analysis-table">
        <thead>
          <tr>
            <th>Aikaleima</th>
            <th>Tilanne</th>
            <th>Viuhkan/käsien asento</th>
            <th>Päätelmä</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>00:12:34</td>
            <td>Etenijä lähtee 1–2-välille</td>
            <td>Viuhka oikealla alhaalla, vasen käsi nousee</td>
            <td>Mahdollinen lähtömerkki</td>
          </tr>
          <tr>
            <td>00:28:10</td>
            <td>Etenijä ei lähde</td>
            <td>Viuhka keskellä, molemmat kädet alhaalla</td>
            <td>Ei lähtömerkkiä</td>
          </tr>
          <tr>
            <td>01:05:42</td>
            <td>Etenijä lähtee 2–3-välille</td>
            <td>Viuhka vasemmalla, oikea käsi käy rinnalla</td>
            <td>Mahdollinen toistuva kaava</td>
          </tr>
        </tbody>
      </table>

      <p>
        Huom: nämä ovat esimerkkirivejä. Varsinainen analyysi vaatii backendin ja AI-videokäsittelyn.
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
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
