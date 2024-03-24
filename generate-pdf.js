function setMessage(message) {
  const output = document.getElementById('output');
  output.innerText = message;
}

function generatePDF() {
  const input = document.getElementById('imageInput');
  const filenameSort = (a,b) => {
      if(a.name < b.name) { return -1 }
      if(a.name > b.name) { return 1 }
      return 0;
  }

  const frameHeight = parseFloat(document.getElementById('frameHeight').value);
  const leftPadding = parseFloat(document.getElementById('leftPadding').value);

  if (input.files.length < 2 ) {
    alert('You must upload at least 2 png files');
    return;
  }

  const files = Array.from(input.files).sort(filenameSort);
  const images = [];

  const pdf = new jspdf.jsPDF({unit: "in"});
  pdf.setFontSize(9);
  pdf.setLineWidth(0.005);

  let fileIndex = 0;

  const loadImage = (file) => {
    console.log("asking to load an image");
    const reader = new FileReader();
    reader.onload = function (e) {
      console.log("loadImage");
      const img = new Image();
      img.onload = function () {
        images.push(img);
        if (fileIndex < files.length) {
          loadImage(files[fileIndex]);
          fileIndex++;
        } else {
          // Process images into PDF
          processImages();
        }
      }
      img.src = e.target.result;
    }
    reader.readAsDataURL(file);
  };

  loadImage(files[0]);

  const processImages = () => {
    for (let index = 0; index < images.length; index++) {
      const img = images[index];
      processImage(img, index);
    }
    pdf.save("download.pdf");
    setMessage("Done saving PDF");
  }

  const processImage = (img, imgIndex) => {
    const message =`processing file ${imgIndex + 1} / ${images.length}`;
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

    // const frameName = `${file.name} - ${imgIndex+1}`;
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
};
