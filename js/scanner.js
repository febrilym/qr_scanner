const video = document.querySelector("video");
const scannerDiv = document.querySelector(".scanner");
const camera = scannerDiv.querySelector("h1 .fa-camera");
const stopCam = scannerDiv.querySelector("h1 .fa-circle-stop");
const textarea = scannerDiv.querySelector(".scanner-details textarea");

// Cek apakah browser mendukung BarcodeDetector
async function checkBarcodeDetector() {
    if (!("BarcodeDetector" in window)) {
        alert("Browser tidak mendukung BarcodeDetector! Gunakan Chrome atau Edge terbaru.");
        return false;
    }
    return true;
}

// Fungsi untuk memulai kamera belakang
async function startCamera() {
    if (!await checkBarcodeDetector()) return;

    try {
        const constraints = {
            video: {
                facingMode: { exact: "environment" } // Paksa gunakan kamera belakang
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play();
        scanQRCode(video); // Mulai pemindaian QR Code

        camera.style.display = "none";
        stopCam.style.display = "inline-block";

    } catch (error) {
        console.error("Gagal mengakses kamera belakang:", error);
        alert("Kamera belakang tidak ditemukan! Coba pilih kamera lain.");
    }
}

// Fungsi untuk mendeteksi QR Code
async function scanQRCode(videoElement) {
    const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });

    const scan = async () => {
        try {
            const barcodes = await barcodeDetector.detect(videoElement);
            if (barcodes.length > 0) {
                textarea.innerText = barcodes[0].rawValue; // Tampilkan hasil scan
                scannerDiv.classList.add("active");
            }
        } catch (error) {
            console.error("Gagal mendeteksi QR Code:", error);
        }
        requestAnimationFrame(scan); // Scan terus-menerus
    };

    scan(); // Mulai scanning
}

// Fungsi untuk menghentikan kamera
function stopCamera() {
    let stream = video.srcObject;
    if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }

    camera.style.display = "inline-block";
    stopCam.style.display = "none";
    video.srcObject = null;
}

// Event listener tombol kamera
camera.addEventListener("click", startCamera);
stopCam.addEventListener("click", stopCamera);
