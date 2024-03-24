
function processVideo() {
    const fileInput = document.getElementById('videoFile');
    const frameCountInput = document.getElementById('frameCount');
    if (!fileInput.files.length) {
        alert('Please select a video file.');
        return;
    }

    const videoFile = fileInput.files[0];

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
    extractFramesFromVideo(videoFile, frameCount);
}

function extractFramesFromVideo(videoFile, frameCount) {
    const videoUrl = URL.createObjectURL(videoFile);
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    let framesExtracted = 0;
    const framesDataUrls = [];

    videoElement.addEventListener('loadedmetadata', () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
    });

    videoElement.addEventListener('loadeddata', () => {
        const duration = videoElement.duration;
        const interval = duration / frameCount;

        function captureFrame() {
            if (framesExtracted < frameCount && videoElement.currentTime < duration) {
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                framesDataUrls.push(dataUrl);
                framesExtracted++;
                videoElement.currentTime = Math.min(duration, videoElement.currentTime + interval);
            } else {
                videoElement.pause();
                console.log("done.");
            }
        }

        videoElement.addEventListener('seeked', captureFrame);

        videoElement.currentTime = 0; // Start capturing frames from the beginning
    });
}