
async function processVideo() {
    const fileInput = document.getElementById('videoFile');
    const frameCountInput = document.getElementById('frameCount');
    if (!fileInput.files.length) {
        alert('Please select a video file.');
        return;
    }

    const videoFile = fileInput.files[0];

    const frameHeight = parseFloat(document.getElementById('frameHeight').value);
    const leftPadding = parseFloat(document.getElementById('leftPadding').value);

    if (videoFile.size > 50 * 1024 * 1024) { // 50MB size limit
        alert('File size exceeds the 50MB limit.');
        return;
    }

    const frameCount = parseInt(frameCountInput.value);
    if (isNaN(frameCount) || frameCount < 1 || frameCount > 60) {
        alert('Invalid frame count. Please enter a number between 1 and 60.');
        return;
    }
    console.log("Starting conversion ...");

    const pdf = new jspdf.jsPDF({ unit: "in" });
    const images = await extractFramesFromVideo(videoFile, frameCount);

    // NOTE !!: Expects processImages defined in generate-pdf.js
    // must be on page before video.js
    await processImages(images, pdf, frameHeight, leftPadding);

    pdf.save("download.pdf");
    setMessage("Done saving PDF");
}

function loadVideoMetadata(videoElement) {
    return new Promise((resolve) => {
        videoElement.addEventListener('loadedmetadata', resolve, { once: true });
    });
}

function seekToTime(videoElement, time) {
    return new Promise((resolve) => {
        videoElement.currentTime = time;
        videoElement.addEventListener('seeked', resolve, { once: true });
    });
}

function captureFrame(videoElement, canvas, context) {
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
}

function dataUrlToImage(dataUrl) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });
}

async function extractFramesFromVideo(videoFile, frameCount) {
    const videoUrl = URL.createObjectURL(videoFile);
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;

    await loadVideoMetadata(videoElement);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const images = [];
    const duration = videoElement.duration;
    const interval = duration / frameCount;

    for (let i = 0; i < frameCount; i++) {
        const currentTime = i * interval;
        await seekToTime(videoElement, currentTime);
        const dataUrl = captureFrame(videoElement, canvas, context);
        const img = await dataUrlToImage(dataUrl);
        images.push(img);
    }

    console.log("Frames extraction and conversion done.");
    return images; // This will be an array of Image objects
}
