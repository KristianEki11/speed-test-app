// --- Objek Terjemahan ---
const translations = {
  en: {
    title: "Realtime Speed Test (Simulation)",
    your_speed: "Your Internet Speed (Mbps):",
    set_button: "Set",
    simulation_notice: "This application runs in simulation mode. Adjust the speed above for calibration.",
    download_label: "Download",
    upload_label: "Upload",
    latency_label: "Latency / Ping",
    avg_title: "Average Measurement",
    avg_download_label: "Avg. Download",
    avg_upload_label: "Avg. Upload",
    avg_latency_label: "Avg. Latency",
    status_initializing: "Initializing measurement...",
    status_simulating_download: "Simulating Download Speed...",
    status_simulating_upload: "Simulating Upload Speed...",
    status_simulating_latency: "Simulating Latency / Ping...",
    status_next_cycle: "Waiting for next cycle..."
  },
  id: {
    title: "Speed Test Realtime (Simulasi)",
    your_speed: "Kecepatan Internet Anda (Mbps):",
    set_button: "Atur",
    simulation_notice: "Aplikasi ini berjalan dalam mode simulasi. Atur kecepatan di atas untuk kalibrasi.",
    download_label: "Download",
    upload_label: "Upload",
    latency_label: "Latency / Ping",
    avg_title: "Rata-rata Pengukuran",
    avg_download_label: "Avg. Download",
    avg_upload_label: "Avg. Upload",
    avg_latency_label: "Avg. Latency",
    status_initializing: "Menginisialisasi pengukuran...",
    status_simulating_download: "Mensimulasikan Kecepatan Download...",
    status_simulating_upload: "Mensimulasikan Kecepatan Upload...",
    status_simulating_latency: "Mensimulasikan Latency / Ping...",
    status_next_cycle: "Menunggu siklus berikutnya..."
  }
};

// --- Referensi Elemen DOM ---
const downloadSpeedEl = document.getElementById('download-speed');
const uploadSpeedEl = document.getElementById('upload-speed');
const latencyEl = document.getElementById('latency');

const avgDownloadEl = document.getElementById('avg-download');
const avgUploadEl = document.getElementById('avg-upload');
const avgLatencyEl = document.getElementById('avg-latency');

const statusTextEl = document.getElementById('status-text');

const downloadCard = document.getElementById('download-card');
const uploadCard = document.getElementById('upload-card');
const latencyPingCard = document.getElementById('latency-ping-card');

const speedInputEl = document.getElementById('speed-input');
const setSpeedBtn = document.getElementById('set-speed-btn');
const langSwitchBtn = document.getElementById('lang-switch-btn');

// --- Variabel State & Konfigurasi ---
let downloadHistory = [];
let uploadHistory = [];
let latencyHistory = [];
let isTesting = false;
let targetDownloadSpeed = 100;
let currentLanguage = localStorage.getItem('language') || 'id';

// --- Fungsi Utama ---

function adjustFontSize(numberEl) {
    const wrapper = numberEl.parentElement;
    const container = wrapper.parentElement;
    const maxFontSize = window.innerWidth >= 1024 ? 48 : 36;
    numberEl.style.fontSize = `${maxFontSize}px`;
    while (wrapper.scrollWidth > container.clientWidth && parseFloat(numberEl.style.fontSize) > 18) {
        const currentSize = parseFloat(numberEl.style.fontSize);
        numberEl.style.fontSize = `${currentSize - 1}px`;
    }
}

function updateUIMetric(type, value) {
    let element, history, avgElement;
    const validValue = isFinite(value) ? value : 0;
    const formattedValue = (type === 'latency') ? Math.round(validValue) : validValue.toFixed(2);

    switch (type) {
        case 'download': element = downloadSpeedEl; history = downloadHistory; avgElement = avgDownloadEl; break;
        case 'upload': element = uploadSpeedEl; history = uploadHistory; avgElement = avgUploadEl; break;
        case 'latency': element = latencyEl; history = latencyHistory; avgElement = avgLatencyEl; break;
        default: return;
    }
    
    element.style.opacity = '0';
    setTimeout(() => {
        element.textContent = formattedValue;
        adjustFontSize(element);
        element.style.opacity = '1';
    }, 100);

    history.push(validValue);
    const average = history.reduce((a, b) => a + b, 0) / history.length;
    const avgFormatted = (type === 'latency') ? Math.round(average) : average.toFixed(2);
    avgElement.textContent = (history.length > 0) ? avgFormatted : (type === 'latency' ? '--' : '0.00');
}

function getSimulatedLatency() { return 15 + Math.random() * 135; }

function getSimulatedDownloadSpeed() {
    const baseSpeed = targetDownloadSpeed * 0.8;
    const fluctuation = targetDownloadSpeed * 0.4;
    return baseSpeed + Math.random() * fluctuation;
}

function getSimulatedUploadSpeed() {
    const uploadTarget = targetDownloadSpeed * 0.2;
    const baseSpeed = uploadTarget * 0.7;
    const fluctuation = uploadTarget * 0.6;
    return Math.max(0.5, baseSpeed + Math.random() * fluctuation);
}

function setStatus(statusKey, activeCardId = null) {
    statusTextEl.style.opacity = '0';
    setTimeout(() => {
        statusTextEl.textContent = translations[currentLanguage][statusKey];
        statusTextEl.style.opacity = '1';
    }, 300);

    [downloadCard, uploadCard, latencyPingCard].forEach(card => card.classList.remove('testing-glow'));
    if (activeCardId) {
        document.getElementById(activeCardId).classList.add('testing-glow');
    }
}

async function runTestCycle() {
    if (isTesting) return; 
    isTesting = true;

    setStatus('status_simulating_download', 'download-card');
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    updateUIMetric('download', getSimulatedDownloadSpeed());

    setStatus('status_simulating_upload', 'upload-card');
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    updateUIMetric('upload', getSimulatedUploadSpeed());

    setStatus('status_simulating_latency', 'latency-ping-card');
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    updateUIMetric('latency', getSimulatedLatency());

    setStatus('status_next_cycle', null);
    isTesting = false;

    setTimeout(runTestCycle, 3000);
}

function setTargetSpeed() {
    const newSpeed = parseFloat(speedInputEl.value);
    if (!isNaN(newSpeed) && newSpeed > 0) {
        targetDownloadSpeed = newSpeed;
        downloadHistory = [];
        uploadHistory = [];
        latencyHistory = [];
        updateUIMetric('download', 0);
        updateUIMetric('upload', 0);
        latencyEl.textContent = '--';
        avgLatencyEl.textContent = '--';
        adjustFontSize(latencyEl);
        avgDownloadEl.textContent = "0.00";
        avgUploadEl.textContent = "0.00";
    }
}

// --- Fungsi Bahasa ---
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang); // Simpan pilihan bahasa
    
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    langSwitchBtn.textContent = lang === 'id' ? 'EN' : 'ID';
}

// --- Event Listeners & Inisialisasi ---
window.addEventListener('resize', () => {
    adjustFontSize(downloadSpeedEl);
    adjustFontSize(uploadSpeedEl);
    adjustFontSize(latencyEl);
});

langSwitchBtn.addEventListener('click', () => {
    const newLang = currentLanguage === 'id' ? 'en' : 'id';
    setLanguage(newLang);
});

window.onload = () => {
    lucide.createIcons();
    setSpeedBtn.addEventListener('click', setTargetSpeed);
    speedInputEl.addEventListener('change', setTargetSpeed);
    
    setLanguage(currentLanguage); // Atur bahasa saat halaman dimuat
    setTargetSpeed(); 
    runTestCycle();
};
