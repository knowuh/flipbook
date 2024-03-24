function setMessage(message) {
  const output = document.getElementById('output');
  output.innerText = message;
}

async function generatePDF() {
  const input = document.getElementById('imageInput');
  if (input.files.length < 2) {
    alert('You must upload at least 2 png files');
    return;
  }

  const frameHeight = parseFloat(document.getElementById('frameHeight').value);
  const leftPadding = parseFloat(document.getElementById('leftPadding').value);
  const files = Array.from(input.files).sort(filenameSort);
  const images = await loadImages(files);
  
  const pdf = new jspdf.jsPDF({ unit: "in" });
  await processImages(images, pdf, frameHeight, leftPadding);
  pdf.save("download.pdf");
  setMessage("Done saving PDF");
}

function filenameSort(a, b) {
  return a.name.localeCompare(b.name);
}

async function loadImages(files) {
  const images = [];
  for (let file of files) {
    const img = await loadImage(file);
    images.push(img);
  }
  return images;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function processImages(images, pdf, frameHeight, leftPadding) {
  // Wrap the setTimeout in a Promise
  const processImagePromises = images.map((img, index) => new Promise((resolve) => {
    setTimeout(() => {
      processImage(
        img,
        index,
        pdf,
        frameHeight,
        leftPadding,
        images.length
      );
      resolve(); // Resolve the promise once the timeout function is called
    }, 0);
  }));
  // Wait for all the promises to resolve
  await Promise.all(processImagePromises);
}


function processImage(img, imgIndex, pdf, frameHeight, leftPadding, totalImages) {
  const message = `processing image ${imgIndex + 1} / ${totalImages}`;
  console.log(message);
  setMessage(message);
  const pageHeight = 10;
  const oWidth = img.width;
  const oHeight = img.height;
  const aratio = oWidth/oHeight;
  const margin = 0.5;
  const marginX = 0.0;
  const marginY = 0.0;
  const numRows = pageHeight/frameHeight;
  const imgHeight = frameHeight;
  const imgWidth = imgHeight * aratio;

  const frameWidth = imgWidth + leftPadding;
  const numCols = Math.floor((8.5 - 2 * margin) / frameWidth);

  const xPosition =
      margin +
      leftPadding +
      (imgIndex % numCols) * (imgWidth + marginX + leftPadding);

  const yPosition =
    margin +
    Math.floor(
      imgIndex % (numCols * numRows)
      / numCols
    ) * (imgHeight + marginY);

  pdf.setFontSize(9);
  pdf.setLineWidth(0.005);

  pdf.addImage(img, 'PNG', xPosition, yPosition, imgWidth, imgHeight);

  const frameName = `${imgIndex+1}`;
  pdf.text(
    frameName,
    xPosition - leftPadding + 0.25,
    yPosition + imgHeight - 0.25,
    {angle:90}
  );

  pdf.line(
    xPosition - leftPadding,
    yPosition,
    xPosition - leftPadding + 0.125,
    yPosition
  );
  pdf.line(
    xPosition - leftPadding,
    yPosition,
    xPosition - leftPadding,
    yPosition + 0.125
  );

  pdf.line(
    xPosition - leftPadding,
    yPosition + imgHeight,
    xPosition - leftPadding + 0.125,
    yPosition + imgHeight
  );
  pdf.line(
    xPosition - leftPadding,
    yPosition + imgHeight,
    xPosition - leftPadding,
    yPosition + imgHeight - 0.125
  );
  pdf.line(
    xPosition + imgWidth,
    yPosition,
    xPosition + imgWidth - 0.125,
    yPosition
  );
  pdf.line(
    xPosition + imgWidth,
    yPosition,
    xPosition + imgWidth,
    yPosition + 0.125
  );
  pdf.line(
    xPosition + imgWidth,
    yPosition + imgHeight,
    xPosition + imgWidth - 0.125,
    yPosition + imgHeight
  );
  pdf.line(
    xPosition + imgWidth,
    yPosition + imgHeight,
    xPosition + imgWidth,
    yPosition + imgHeight - 0.125
  );

  if (imgIndex % (numCols * numRows) === 0
    && imgIndex !== 0
    && imgIndex !== images.length) {
      pdf.addPage();
  }

};