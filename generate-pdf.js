function setMessage(message) {
  const output = document.getElementById('output');
  console.log(message);
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
  
  let pdf = new jspdf.jsPDF({ unit: "in" });
  pdf = await processImages(images, pdf, frameHeight, leftPadding);
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
  let updatedPdf = pdf; // Assuming pdf is an object that should be updated
  for (let i = 0; i < images.length; i++) {
    await new Promise((resolve) => {
      setTimeout(() => {
        // Assuming processImage can now return an updated pdf or status
        const result = processImage(
          images[i],
          i,
          updatedPdf,
          frameHeight,
          leftPadding,
          images.length
        );
        updatedPdf = result; // Update the reference if necessary
        resolve();
      }, 0);
    });
  }
  return updatedPdf; // Return the updated PDF object
}



function processImage(img, imgIndex, pdf, frameHeight, leftPadding, totalImages) {
  const message = `processing image ${imgIndex + 1} / ${totalImages}`;
  setMessage(message);
  const pageHeight = 10;
  const oWidth = img.width;
  const oHeight = img.height;
  const aRatio = oWidth/oHeight;
  const margin = 0.5;
  const marginX = 0.0;
  const marginY = 0.0;
  const numRows = Math.floor(pageHeight/frameHeight);
  const imgHeight = frameHeight;
  const imgWidth = imgHeight * aRatio;

  const frameWidth = imgWidth + leftPadding;
  const frameXOffset = frameWidth + marginX;
  const frameYOffset = imgHeight + marginY;
  const numCols = Math.floor((8.5 - 2 * margin) / frameWidth);
  const numUp = numCols * numRows;

  const rolledIndex = imgIndex % numUp;

  if (rolledIndex != imgIndex && rolledIndex === 0) {
    setMessage("adding page");
    pdf.addPage();
  }
  // Calculate the position based on the index
  const columnIndex = rolledIndex % numCols;
  const rowIndex = Math.floor(rolledIndex / numCols);

  const xPosition = margin + leftPadding + columnIndex * frameXOffset;

  const yPosition = margin + rowIndex * frameYOffset;

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

  return pdf;
};