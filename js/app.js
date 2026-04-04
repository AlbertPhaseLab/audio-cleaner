// ---------------- TRANSLATIONS ----------------

const translations = {
    es: {
        title: "🎧 Audio Cleaner",
        subtitle: "Mejora automáticamente la calidad de tus audios",
        button: "Limpiar audio",
        processing: "⏳ Procesando...",
        done: "✅ Audio listo!",
        error: "❌ Error procesando audio",
        preset: "Preset",
        selectFile: "Selecciona un archivo",
        clickOnSelect: "Seleccionar archivo",
        dropText: "Arrastra y suelta tu archivo aquí",
        pro: "🚀 Disponible en versión PRO (archivos grandes)",

        options: {
            default: "🎛 Default",
            podcast: "🎙 Podcast",
            voz: "🗣 Voz",
            reunion: "👥 Reunión"
        }
    },
    en: {
        title: "🎧 Audio Cleaner",
        subtitle: "Automatically improve your audio quality",
        button: "Clean audio",
        processing: "⏳ Processing...",
        done: "✅ Audio ready!",
        error: "❌ Error processing audio",
        preset: "Preset",
        dropText: "Drag & drop your file here",
        selectFile: "Select a file",
        clickOnSelect: "Select file",
        pro: "🚀 Available in PRO version (large files)",

        options: {
            default: "🎛 Default",
            podcast: "🎙 Podcast",
            voz: "🗣 Voice",
            reunion: "👥 Meeting"
        }
    }
};

let currentLang = "es";

// Detect environment
const API_URL = window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000/clean-audio/"
    : "https://audio-cleaner-backend.onrender.com/clean-audio/";

// ---------------- UI STATE ----------------

function setLoadingState(btn) {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
    btn.innerText = translations[currentLang].processing;
}

function resetButton(btn) {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
    btn.innerText = translations[currentLang].button;
}

// ---------------- LANGUAGE ----------------

function updateUI() {
    const t = translations[currentLang];

    document.getElementById("title").innerText = t.title;
    document.getElementById("subtitle").innerText = t.subtitle;
    document.getElementById("btn").innerText = t.button;
    document.getElementById("presetLabel").innerText = t.preset;

    const presetSelect = document.getElementById("preset");
    presetSelect.options[0].text = t.options.default;
    presetSelect.options[1].text = t.options.podcast;
    presetSelect.options[2].text = t.options.voz;
    presetSelect.options[3].text = t.options.reunion;
}

function changeLang() {
    currentLang = document.getElementById("lang").value;
    updateUI();
}

// Initialize UI
window.onload = () => {
    updateUI();
};

// ---------------- DRAG & DROP ----------------

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");

// Click → open file dialog
dropArea.addEventListener("click", () => fileInput.click());

// Drag events
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("hover");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("hover");
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("hover");

    const files = e.dataTransfer.files;
    fileInput.files = files;

    updateFileName();
});

// Show selected file name
fileInput.addEventListener("change", updateFileName);

function updateFileName() {
    if (fileInput.files.length > 0) {
        fileName.innerText = fileInput.files[0].name;
    }
}

// ---------------- MAIN UPLOAD ----------------

async function upload() {
    const btn = document.getElementById("btn");
    const fileInput = document.getElementById("fileInput");
    const preset = document.getElementById("preset").value;
    const status = document.getElementById("status");
    const progressBar = document.getElementById("progress-bar");
    const result = document.getElementById("result");
    const audioPlayer = document.getElementById("audioPlayer");
    const downloadBtn = document.getElementById("downloadBtn");

    if (!fileInput.files.length) {
        alert(translations[currentLang].selectFile);
        return;
    }

    const file = fileInput.files[0];

    // 🚀 FREE LIMIT
    if (file.size > 50 * 1024 * 1024) {
        status.innerText = translations[currentLang].pro;
        return;
    }

    setLoadingState(btn);
    status.innerText = translations[currentLang].processing;
    result.style.display = "none";
    progressBar.style.width = "0%";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("preset", preset);

    const xhr = new XMLHttpRequest();

    // 📊 Upload progress (0–50%)
    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 50;
            progressBar.style.width = percent + "%";
        }
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                simulateProcessing(xhr.response, progressBar, audioPlayer, downloadBtn, result, status, btn);
            } else {
                handleError(status, btn);
            }

        }
    };

    xhr.open("POST", API_URL);
    xhr.responseType = "blob";
    xhr.send(formData);
}

// ---------------- HELPERS ----------------

function simulateProcessing(response, progressBar, audioPlayer, downloadBtn, result, status, btn) {
    let progress = 50;

    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);

            const url = URL.createObjectURL(response);

            audioPlayer.src = url;
            downloadBtn.href = url;
            result.style.display = "block";

            status.innerText = translations[currentLang].done;

            resetButton(btn);
        }
    }, 200);
}

function handleError(status, btn) {
    status.innerText = translations[currentLang].error;
    resetButton(btn);
}