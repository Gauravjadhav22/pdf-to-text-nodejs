const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3005;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to upload PDF and extract Hindi text
app.post('/upload-pdf', upload.single('file'), async (req, res) => {
  const pdfPath = req.file.path;

  try {
    // Convert PDF to images (one per page)
    const imageBasePath = path.join(__dirname, 'uploads', path.basename(pdfPath, '.pdf'));
    await convertPdfToImages(pdfPath, imageBasePath);

    // Collect OCR results from all pages, excluding the first page
    const files = fs
      .readdirSync('uploads')
      .filter(file => file.startsWith(path.basename(pdfPath, '.pdf')) && file.endsWith('.png'))
      .sort(); // Sort files to ensure correct order

    // Skip the first file
    const filesToProcess = files.slice(1);

    const ocrResults = [];
    for (const file of filesToProcess) {
      const imagePath = path.join('uploads', file);
      const extractedText = await runTesseract(imagePath);
      ocrResults.push(extractedText);
    }

    // Combine text, extract Hindi content, and format it
    const combinedText = ocrResults.join(' ');
    const formattedData = formatHindiText(combinedText);

    // Clean up files
    cleanupUploads(files);

    // Send response
    res.json({ formattedData });
  } catch (err) {
    console.error("Error processing PDF:", err);
    res.status(500).send("Error during processing.");
  }
});

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
    const command = `tesseract ${imagePath} stdout -l hin`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Tesseract OCR failed: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Function to format Hindi text into a JSON array structure
function formatHindiText(text) {
  // Match Hindi characters and spaces, and split into lines
  const hindiTextRegex = /[\u0900-\u097F\s]+/g; 
  const lines = text.match(hindiTextRegex);

  if (!lines) return [];

  const groupedData = [];
  let currentGroup = [];

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      // Add non-empty lines to the current group
      currentGroup.push(trimmedLine);
    } else if (currentGroup.length > 0) {
      // Push the current group to the groupedData and start a new group
      groupedData.push(currentGroup);
      currentGroup = [];
    }
  });

  // Push the last group if there's any remaining data
  if (currentGroup.length > 0) {
    groupedData.push(currentGroup);
  }

  return groupedData;
}


// Function to clean up uploaded files
function cleanupUploads(files) {
  files.forEach(file => {
    const filePath = path.join(__dirname, 'uploads', file);
    fs.unlinkSync(filePath);
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});





















//FOR STORING IMAGES

// const express = require('express');
// const multer = require('multer');
// const { exec } = require('child_process');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const port = 3005;

// // Set up multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// // Route to upload PDF and extract Hindi text
// app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
//   const pdfPath = req.file.path;

//   try {
//     // Convert PDF to images (one per page)
//     const imageBasePath = path.join(__dirname, 'uploads', path.basename(pdfPath, '.pdf'));
//     await convertPdfToImages(pdfPath, imageBasePath);

//     // Collect OCR results from all pages
//     const ocrResults = [];
//     const files = fs.readdirSync('uploads').filter(file => file.startsWith(path.basename(pdfPath, '.pdf')) && file.endsWith('.png'));

//     for (const file of files) {
//       const imagePath = path.join('uploads', file);
//       const extractedText = await runTesseract(imagePath);
//       ocrResults.push(extractedText);
//     }

//     // Combine text and extract Hindi content
//     const combinedText = ocrResults.join(' ');
//     const hindiText = extractHindiText(combinedText);

//     // Clean up files
//     cleanupUploads(files);

//     // Send response
//     res.json({ extractedText: hindiText });
//   } catch (err) {
//     console.error("Error processing PDF:", err);
//     res.status(500).send("Error during processing.");
//   }
// });

// // Function to convert PDF to images
// function convertPdfToImages(pdfPath, outputBasePath) {
//   return new Promise((resolve, reject) => {
//     const command = `pdftoppm -png ${pdfPath} ${outputBasePath}`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(`PDF to Image conversion failed: ${stderr}`);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });
// }

// // Function to run Tesseract OCR
// function runTesseract(imagePath) {
//   return new Promise((resolve, reject) => {
//     const command = `tesseract ${imagePath} stdout -l hin`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(`Tesseract OCR failed: ${stderr}`);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });
// }

// // Function to extract Hindi text
// function extractHindiText(text) {
//   const hindiTextRegex = /[\u0900-\u097F\s]+/g; // Match Hindi characters and spaces
//   const matches = text.match(hindiTextRegex);

//   if (!matches) return '';

//   return matches.map(chunk => chunk.trim()).join(' '); // Combine words into sentences
// }

// // Function to clean up uploaded files
// function cleanupUploads(files) {
//   files.forEach(file => {
//     const filePath = path.join(__dirname, 'uploads', file);
//     fs.unlinkSync(filePath);
//   });
// }

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
























































//FOR KEY PAIR
// const express = require('express');
// const multer = require('multer');
// const { exec } = require('child_process');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const port = 3005;

// // Define column patterns to match
// const columnPatterns = {
//   serialNumber: /क्र\.?\s*[\d]+/i, // Serial number (e.g., 'क्र. 1')
//   name: /(?:निर्वाचक\s*का\s*नाम|नाम\s*[:\-]?)?\s*([^\n]+)/i, // Start from "निर्वाचक का नाम"
//   address: /(?:पता\s*[:\-]?)?\s*([^\n]+)/i, // Extract address
//   qualification: /योग्यता\s*[:\-]?\s*([^\n]+)/i, // Extract qualification
//   profession: /(?:पेशा|प्रोफेशन)\s*[:\-]?\s*([^\n]+)/i, // Extract profession
//   age: /(?:उम्र|आयु)\s*[:\-]?\s*([^\n]+)/i, // Extract age
//   gender: /(पुरुष|महिला|अन्य|Male|Female|Other)/i, // Extract gender
//   epicNumber: /(?:ईपिक\s*सांख्य|EPIC)\s*[:\-]?\s*([^\n]+)/i, // Extract EPIC number
// };

// // Set up multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// // Route to upload PDF and extract Hindi text
// app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
//   const pdfPath = req.file.path;

//   try {
//     // Convert PDF to images (one per page)
//     const imageBasePath = path.join(__dirname, 'uploads', path.basename(pdfPath, '.pdf'));
//     await convertPdfToImages(pdfPath, imageBasePath);

//     // Collect OCR results from all pages, skipping the first page
//     const ocrResults = [];
//     const files = fs.readdirSync('uploads').filter(file => file.startsWith(path.basename(pdfPath, '.pdf')) && file.endsWith('.png'));

//     // Skip the first page and process the rest
//     for (let i = 1; i < files.length; i++) {
//       const imagePath = path.join('uploads', files[i]);
//       const extractedText = await runTesseract(imagePath);
//       ocrResults.push(extractedText);
//     }

//     // Combine text and extract Hindi and English content
//     const combinedText = ocrResults.join(' ');
//     const filteredText = extractHindiAndEnglishText(combinedText);

//     // Extract rows and columns from the filtered text
//     const structuredData = extractRowsAndColumns(filteredText);

//     // Clean up files
//     cleanupUploads(files);

//     // Send structured data as response
//     res.json({ extractedData: structuredData });
//   } catch (err) {
//     console.error("Error processing PDF:", err);
//     res.status(500).send("Error during processing.");
//   }
// });

// // Function to convert PDF to images
// function convertPdfToImages(pdfPath, outputBasePath) {
//   return new Promise((resolve, reject) => {
//     const command = `pdftoppm -png ${pdfPath} ${outputBasePath}`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(`PDF to Image conversion failed: ${stderr}`);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });
// }

// // Function to run Tesseract OCR
// function runTesseract(imagePath) {
//   return new Promise((resolve, reject) => {
//     const command = `tesseract ${imagePath} stdout -l hin+eng`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(`Tesseract OCR failed: ${stderr}`);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });
// }

// // Function to extract Hindi and English text
// function extractHindiAndEnglishText(text) {
//   const hindiRegex = /[\u0900-\u097F\s]+/g; // Match Hindi characters and spaces
//   const englishRegex = /[a-zA-Z0-9\s.,-]+/g; // Match English characters, numbers, and common symbols

//   const hindiMatches = text.match(hindiRegex) || [];
//   const englishMatches = text.match(englishRegex) || [];

//   // Combine Hindi content first, followed by English
//   return [...hindiMatches, ...englishMatches].map(chunk => chunk.trim()).join(' ');
// }

// // Function to extract rows and columns from the text
// function extractRowsAndColumns(text) {
//   const lines = text.split('\n').map(line => line.trim()).filter(line => line);
//   const rows = [];
//   let currentRow = {};

//   // Flag to start collecting data after "निर्वाचक का नाम"
//   let isCollectingData = false;

//   lines.forEach(line => {
//     // Start collecting data when "निर्वाचक का नाम" is found
//     if (line.match(columnPatterns.name)) {
//       isCollectingData = true;
//     }

//     if (isCollectingData) {
//       // Check for row start (Serial number or specific pattern)
//       if (line.match(columnPatterns.serialNumber)) {
//         if (Object.keys(currentRow).length > 0) {
//           rows.push(currentRow); // Push previous row
//           currentRow = {}; // Reset for new row
//         }
//         currentRow.serialNumber = line.match(columnPatterns.serialNumber)[0];
//       }

//       // Match other fields and populate current row
//       for (const [field, regex] of Object.entries(columnPatterns)) {
//         if (!currentRow[field] && line.match(regex)) {
//           currentRow[field] = line.match(regex)[1];
//         }
//       }
//     }
//   });

//   // Add the last row
//   if (Object.keys(currentRow).length > 0) {
//     rows.push(currentRow);
//   }

//   return rows;
// }

// // Function to clean up uploaded files
// function cleanupUploads(files) {
//   files.forEach(file => {
//     const filePath = path.join(__dirname, 'uploads', file);
//     fs.unlinkSync(filePath);
//   });
// }

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });






//RECENT

// const express = require('express');
// const multer = require('multer');
// const { exec } = require('child_process');
// const path = require('path');
// const fs = require('fs')
// const app = express();
// const port = 3005;

// // Set up multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// // Column patterns to identify specific fields
// const columnPatterns = {
//   serialNumber: /क्र\.?/i,
//   name: /निर्वाचक\s*का\s*नाम/i,
//   address: /पता/i,
//   qualification: /योग्यता/i,
//   profession: /पेशा/i,
//   age: /अर्हता\s*तिथि\s*को\s*उमर/i,
//   gender: /पुरुष|महिला|अन्य/i,
//   epicNumber: /निर्वाचक\s*की\s*इपिक\s*सांख्य/i,
//   photo: /निर्वाचक\s*का\s*फोटो/i
// };

// // Route to upload PDF and extract Hindi text
// app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
//   const pdfPath = req.file.path;

//   try {
//     // Convert PDF to images (one per page)
//     const imageBasePath = path.join(__dirname, 'uploads', path.basename(pdfPath, '.pdf'));
//     await convertPdfToImages(pdfPath, imageBasePath);

//     // Collect OCR results from all pages
//     const ocrResults = [];
//     const files = fs.readdirSync('uploads').filter(file => file.startsWith(path.basename(pdfPath, '.pdf')) && file.endsWith('.png'));

//     for (const file of files) {
//       const imagePath = path.join('uploads', file);
//       const extractedText = await runTesseract(imagePath);
//       ocrResults.push(extractedText);
//     }

//     // Combine text and extract relevant data based on column patterns
//     const combinedText = ocrResults.join(' ');
//     const structuredData = extractDataByColumns(combinedText);

//     // Send response with structured data

//     res.json({ extractedData: structuredData });
//   } catch (err) {
//     console.error("Error processing PDF:", err);
//     res.status(500).send("Error during processing.");
//   }
// });

// // Function to convert PDF to images
// function convertPdfToImages(pdfPath, outputBasePath) {
//   return new Promise((resolve, reject) => {
//     const command = `pdftoppm -png ${pdfPath} ${outputBasePath}`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(`PDF to Image conversion failed: ${stderr}`);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });
// }

// // Function to run Tesseract OCR
// function runTesseract(imagePath) {
//   return new Promise((resolve, reject) => {
//     const command = `tesseract ${imagePath} stdout -l hin`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(`Tesseract OCR failed: ${stderr}`);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });
// }

// // Function to extract data based on column patterns
// function extractDataByColumns(text) {
//   const data = [];
  
//   // Split the text into rows based on newlines
//   const rows = text.split('\n');

//   // Temporary object to hold row data
//   let currentRow = {};

//   rows.forEach(row => {
//     // Check each column pattern
//     for (const [column, regex] of Object.entries(columnPatterns)) {
//       const match = row.match(regex);

//       if (match) {
//         // If the column is found, assign the value to the current row
//         currentRow[column] = row.replace(regex, '').trim();
//       }
//     }

//     // Once a full row (all columns) is identified, push it to the data array
//     if (Object.keys(currentRow).length === Object.keys(columnPatterns).length) {
//       data.push(currentRow);
//       currentRow = {}; // Reset for the next row
//     }
//   });

//   return data;
// }

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

