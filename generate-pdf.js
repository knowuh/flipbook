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

  const pdf = new jspdf.jsPDF({unit: "in"});
  pdf.setFontSize(9);
  pdf.setLineWidth(0.005);

  let fileIndex = 0;
  const loadImage = (file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
          const img = new Image();
          img.onload = function () {
              // Adjust these values as needed to fit the images on the PDF pages
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
              // const leftPadding = leftPadding

              const frameWidth = imgWidth + leftPadding;
              const numCols = Math.floor((8.5 - 2 * margin) / frameWidth);

              const xPosition =
                 margin +
                 leftPadding +
                 (fileIndex % numCols) * (imgWidth + marginX + leftPadding);

              const yPosition =
                margin +
                Math.floor(
                  fileIndex % (numCols * numRows)
                  / numCols
                ) * (imgHeight + marginY);

              pdf.setFontSize(9);
              pdf.setLineWidth(0.005);

              pdf.addImage(this, 'PNG', xPosition, yPosition, imgWidth, imgHeight);

              // const frameName = `${file.name} - ${fileIndex+1}`;
              const frameName = `${fileIndex+1}`;
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

              fileIndex++;
              const message =`processing file ${fileIndex + 1} / ${files.length}`;
              console.log(message);
              setMessage(message)
              if (fileIndex < files.length) {
                  loadImage(files[fileIndex]);
              } else {
                  pdf.save("download.pdf");
                  setMessage("Done saving PDF");
              }
              if (fileIndex % (numCols * numRows) === 0
                && fileIndex !== 0
                && fileIndex !== files.length) {
                  pdf.addPage();
              }
          };
          img.src = e.target.result;
      };
      reader.readAsDataURL(file);
  };

  loadImage(files[0]);
}