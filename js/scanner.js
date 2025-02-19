const scannerDiv = document.querySelector(".scanner");

const camera = scannerDiv.querySelector("h1 .fa-camera");
const stopCam = scannerDiv.querySelector("h1 .fa-circle-stop");

const form = scannerDiv.querySelector(".scanner-form");
const fileInput = form.querySelector("input");
const p = form.querySelector("p");
const img = form.querySelector("img");
const video = form.querySelector("video");
const content = form.querySelector(".content");

const textarea = scannerDiv.querySelector(".scanner-details textarea");
const copyBtn = scannerDiv.querySelector(".scanner-details .copy");
const closeBtn = scannerDiv.querySelector(".scanner-details .close");

form.addEventListener("click", () => fileInput.click());

const cameraSelect = document.createElement("select"); // Dropdown kamera
cameraSelect.style.display = "block";
document.body.prepend(cameraSelect); // Tambahkan ke halaman


fileInput.addEventListener("change", e => {
    let file = e.target.files[0];
    if (!file) return;
    fetchRequest(file);
})

function fetchRequest(file){
    let formData = new FormData();
    formData.append("file", file);

    p.innerText = "Scanning QR Code...";

    fetch(`http://api.qrserver.com/v1/read-qr-code/`, {
        method: "POST", body: formData
    }).then(res => res.json()).then(result => {
        let text = result[0].symbol[0].data;

        if (!text)
            return p.innerText = "Tidak bisa scan QR Code :("
        
        scannerDiv.classList.add("active");
        form.classList.add("active-img");

        img.src = URL.createObjectURL(file);
        textarea.innerText = text;
    })
}

let scanner;

camera.addEventListener("click", async () => {
    camera.style.display = "none";
    form.classList.add("pointerEvents");
    p.innerText = "Scanning QR Code...";

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");

        if (videoDevices.length === 0) {
            console.log("Kamera tidak ditemukan :(");
            return;
        }

        // Tambahkan opsi kamera ke dropdown
        cameraSelect.innerHTML = "";
        videoDevices.forEach((device, index) => {
            let option = document.createElement("option");
            option.value = device.deviceId;
            option.text = device.label || `Camera ${index + 1}`;
            cameraSelect.appendChild(option);
        });

        // Pilih kamera belakang secara default jika ada
        let backCamera = videoDevices.find(device => device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("environment"));
        let selectedCameraId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;

        // Akses kamera yang dipilih
        await startCamera(selectedCameraId);

    } catch (error) {
        console.error("Gagal mendapatkan daftar kamera:", error);
    }
});

// Fungsi untuk memulai kamera
async function startCamera(deviceId) {
    try {
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        form.classList.add('active-video');
        stopCam.style.display = "inline-block";

        // Gunakan instascan untuk mendeteksi QR dari stream video
        scanner = new Instascan.Scanner({ video: video });
        scanner.start();

        scanner.addListener("scan", c => {
            scannerDiv.classList.add("active");
            textarea.innerText = c;
        });

    } catch (error) {
        console.error("Gagal mengakses kamera:", error);
    }
}

// Ubah kamera berdasarkan pilihan dropdown
cameraSelect.addEventListener("change", async () => {
    let selectedCameraId = cameraSelect.value;
    await startCamera(selectedCameraId);
});

copyBtn.addEventListener("click", () => {
    let text = textarea.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification("Text telah disalin!");
    }).catch(err => {
        console.error("Gagal menyalin :(", err);
    });
});

function showNotification(message) {
    const notification = document.querySelector(".notification");
    notification.innerText = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 2000);
}

closeBtn.addEventListener("click", () => stopScan());
stopCam.addEventListener("click", () => stopScan());

function stopScan(){
    p.innerText = "Upload QR Code untuk Scan!";

    camera.style.display = "inline-block";
    stopCam.style.display = "none";

    form.classList.remove("active-video", "active-img", "pointerEvents");
    scannerDiv.classList.remove("active");

    if (scanner) scanner.stop();
}
