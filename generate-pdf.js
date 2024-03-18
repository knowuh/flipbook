function setMessage(message) {
  const output = document.getElementById('output');
  output.innerText = message;
}
function generatePDF() {
  const input = document.getElementById('imageInput');
  const files = input.files;
  console.log(files);
  if (files.length < 2 ) {
      alert('You must upload at least 2 png files');
      return;
  }
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
              const oWidth = img.width;
              const oHeight = img.height;
              const aratio = oWidth/oHeight;
              const margin = 0.5;
              const marginX = 0.0;
              const marginY = 0.0;
              const numRows = 5;
              const imgHeight = 10/numRows - marginY;
              const imgWidth = imgHeight * aratio;
              const offWidth = imgWidth * 0.5;
              const xPosition = margin + offWidth + (fileIndex % 2) * (imgWidth + marginX + offWidth);
              const yPosition = margin + Math.floor(fileIndex % 10 / 2) * (imgHeight + marginY);

              pdf.setFontSize(9);
              pdf.setLineWidth(0.005);

              pdf.addImage(this, 'PNG', xPosition, yPosition, imgWidth, imgHeight);

              pdf.text(
                `${fileIndex+1}`,
                xPosition - offWidth + 0.25,
                yPosition + imgHeight - 0.25,
                {angle:90}
              );

              pdf.line(
                xPosition - offWidth,
                yPosition,
                xPosition - offWidth + 0.125,
                yPosition
              );
              pdf.line(
                xPosition - offWidth,
                yPosition,
                xPosition - offWidth,
                yPosition + 0.125
              );

              pdf.line(
                xPosition - offWidth,
                yPosition + imgHeight,
                xPosition - offWidth + 0.125,
                yPosition + imgHeight
              );
              pdf.line(
                xPosition - offWidth,
                yPosition + imgHeight,
                xPosition - offWidth,
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
              if (fileIndex % 10 === 0
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