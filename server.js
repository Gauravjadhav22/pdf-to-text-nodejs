const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3005;

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

// Function to format Hindi text (your logic)

// function formatHindiText(text) {
//   // Start from 'निर्वाचक का नाम' or 'क्र०'
//   const startIndex =
//     text.indexOf("निर्वाचक का नाम") !== -1
//       ? text.indexOf("निर्वाचक का नाम")
//       : text.indexOf("क्र०");

//   if (startIndex === -1) {
//     return { columns: [], rows: [] }; // Return empty if neither 'निर्वाचक का नाम' nor 'क्र०' is found
//   }

//   // Trim text to start from the desired index
//   text = text.substring(startIndex);

//   // Replace unwanted markers and normalize spacing
//   text = text.replace(/सं०|क्र०/g, "").replace(/\n+/g, "\n").trim();

//   // Extract column headers
//   const columnsEndIndex = text.indexOf("\n"); // Assume the first line after 'निर्वाचक का नाम' contains column headers
//   const columnsText = text.substring(0, columnsEndIndex).trim();
//   let columns = columnsText
//     .split("|")
//     .map((col) => col.trim())
//     .filter(
//       (col) =>
//         col &&
//         !["to", "अईता", "तिथि", "को उम्र", "पुरुष/ महिला/ अन्य"].includes(col)
//     ); // Remove unwanted columns

//   // Correct grouped columns like 'अईता तिथि को उम्र'
//   columns = columns.map((col) =>
//     col === "अईता" || col === "तिथि" || col === "को उम्र" ? "अईता तिथि को उम्र" : col
//   );

//   // Extract rows
//   const rowsText = text.substring(columnsEndIndex).trim();
//   const rawRows = rowsText.split(/(?=पुरूष|महिला|अन्य)/); // Split rows by gender markers
//   const rows = [];

//   rawRows.forEach((rawRow) => {
//     // Normalize and split row data
//     const cells = rawRow
//       .trim()
//       .split(/\n| {2,}/) // Split by newline or multiple spaces
//       .map((cell) => cell.trim())
//       .filter(Boolean);

//     if (cells.length > 1) {
//       // Move gender marker to the end
//       const gender = cells.find((cell) =>
//         ["पुरूष", "महिला", "अन्य"].includes(cell)
//       );
//       if (gender) {
//         cells.splice(cells.indexOf(gender), 1); // Remove gender from its original position
//         cells.push(gender); // Add gender to the end
//       }

//       rows.push(cells);
//     }
//   });

//   return { columns, rows };
// }
function splitRowsByGender(rows) {
  const result = [];
  let currentChunk = [];

  rows.forEach((cell) => {
    // Trim the cell to avoid whitespace issues
    const trimmedCell = cell.trim();
    currentChunk.push(trimmedCell);

    // Check for gender markers (पुरुष or महिला)
    if (trimmedCell === "पुरूष" || trimmedCell === "महिला") {
      result.push(currentChunk); // Push the current chunk to the result
      currentChunk = []; // Start a new chunk
    }
  });

  // If there's remaining data in `currentChunk`, push it as well
  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }

  return result;
}
function formatHindiText(text) {
  // Start from 'निर्वाचक का नाम' or 'क्र०'
  const startIndex =
    text.indexOf("निर्वाचक का नाम") !== -1
      ? text.indexOf("निर्वाचक का नाम")
      : text.indexOf("क्र०");

  if (startIndex === -1) {
    return []; // Return empty if neither 'निर्वाचक का नाम' nor 'क्र०' is found
  }

  text = text.substring(startIndex);

  // Replace unwanted markers
  text = text
    .replace(/सं०/g, "")
    .replace(/क्र०/g, "")
    .replace(/\|\s*[_]*\s*[०-९]+\+?\s*[_]*\s*\|/g, "")
    .trim();

  // Split text by rows using \n\n\n+ (more than two \n\n as row separator)
  const rawRows = text.split(/\n\n\n+/); // Split by multiple \n\n\n for rows
  const rows = [];
  const columns = [
    "निर्वाचक का नाम|",
    "पिता /माता /पति का नाम",
    "पता (साधारणतया निवास का स्थान)",
    "योग्यता",
    "पेशा",
    "अईता तिथि को उम्र",
    "पुरुष/ महिला/ अन्य",
    "निर्वाचक की ईपिक संख्या (यदि हो)",
    "निर्वाचक का फोटो",
    
  ];
  rawRows.forEach((rawRow) => {
    const cells = rawRow
      .split(/\n\n/) // Split by exactly two \n\n for cells within a row
      .map((cell) =>
        cell
          .trim()
          .replace(/\n/g, " ") // Normalize newlines to spaces
          .replace(/\|\s*[_]*[०-९]+\s*[_]*\|/g, "") // Remove patterns like "| _ ६+ |"
          .replace(/^\d+$/g, "") // Remove cells with just a number like "4" or "40"
          .trim()
      ) // Normalize and trim cells
      .filter((cell) => cell && !columns.includes(cell)); // Remove empty cells

    if (cells.length > 0) {
      rows.push(cells); // Add the row if it contains any cells
    }
  });

  const twoDRows = [];

  rows.forEach((row) => {
  

    twoDRows.push(splitRowsByGender(row))
  });

  return { rows: twoDRows, columns };
}
// Function to convert PDF to images
function convertPdfToImages(pdfPath, outputBasePath) {
  return new Promise((resolve, reject) => {
    const command = `pdftoppm -png ${pdfPath} ${outputBasePath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`PDF to Image conversion failed: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Function to run Tesseract OCR
function runTesseract(imagePath) {
  return new Promise((resolve, reject) => {
    const command = `tesseract ${imagePath} stdout -l hin`; // Use only Hindi
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Tesseract OCR failed: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Function to clean up uploaded files
function cleanupUploads(files) {
  files.forEach((file) => {
    const filePath = path.join(__dirname, "uploads", file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

// Route to upload PDF and extract text
app.post("/upload-pdf", upload.single("file"), async (req, res) => {
  const pdfPath = req.file.path;

  try {
    // Convert PDF to images (one per page)
    const imageBasePath = path.join(
      __dirname,
      "uploads",
      path.basename(pdfPath, ".pdf")
    );
    await convertPdfToImages(pdfPath, imageBasePath);

    // Collect OCR results from all pages, restricting to a maximum of 10 pages
    const files = fs
      .readdirSync("uploads")
      .filter(
        (file) =>
          file.startsWith(path.basename(pdfPath, ".pdf")) &&
          file.endsWith(".png")
      )
      .sort() // Sort files to ensure correct order
      // .slice(0, 2); // Process only the first 10 images

    const ocrResults = [];
    for (const file of files) {
      const imagePath = path.join("uploads", file);
      const extractedText = await runTesseract(imagePath);
      ocrResults.push(extractedText);
    }

    // Combine text, extract relevant content, and format it
    const combinedText = ocrResults.join(" ");
    // console.log("Combined Text:", combinedText); // Debugging log
    const formattedData = formatHindiText(combinedText);

    // Clean up files after processing
    cleanupUploads(files);

    // Send response
    res.json({ formattedData });
  } catch (err) {
    console.error("Error processing PDF:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
