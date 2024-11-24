import sys
import pytesseract
from PIL import Image
import tabula
import os

# Input file paths
pdf_file = sys.argv[1]
output_file = sys.argv[2]

# Function to extract Hindi text from image using pytesseract
def extract_hindi_text_from_image(image_path):
    try:
        # Run OCR on the image and specify Hindi language
        text = pytesseract.image_to_string(Image.open(image_path), lang='hin')
        return text
    except Exception as e:
        print(f"Error in OCR: {e}")
        return ""

# Function to extract tables from PDF using tabula
def extract_tables_from_pdf(pdf_path):
    try:
        # Extract tables from PDF
        tables = tabula.read_pdf(pdf_path, pages="all", multiple_tables=True)
        return tables
    except Exception as e:
        print(f"Error extracting tables: {e}")
        return []

# Main execution
if __name__ == "__main__":
    if not os.path.exists(pdf_file):
        print("PDF file not found.")
        sys.exit(1)

    # First, use OCR to extract text
    text = extract_hindi_text_from_image(pdf_file)

    # If OCR text is not found, attempt to extract tables (if any)
    if not text.strip():
        print("OCR did not extract valid text, attempting table extraction.")
        tables = extract_tables_from_pdf(pdf_file)
        if tables:
            print(f"Found {len(tables)} tables in the PDF.")

    # Save the extracted text to a text file
    if text:
        with open(output_file, 'w', encoding='utf-8') as file:
            file.write(text)
        print(f"Extracted text saved to {output_file}")
    else:
        print("No text extracted from PDF.")
