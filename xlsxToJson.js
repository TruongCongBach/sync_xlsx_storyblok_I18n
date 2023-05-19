const fs = require('fs');
const xlsx = require('xlsx');

const excelFilePath = 'xlsxFile/localization.xlsx'; // Replace with the actual path to your Excel file
const sheetName = 'Localization Matrix'; // Replace with the desired sheet name

// Read the Excel file
const workbook = xlsx.readFile(excelFilePath);
const worksheet = workbook.Sheets[sheetName];

// Convert the worksheet data to JSON object
const jsonData = xlsx.utils.sheet_to_json(worksheet);

// Create separate JSON objects for each language
const languageObjects = {};

jsonData.forEach(row => {
  const key = row.Key;

  Object.keys(row).forEach(column => {
    if (column !== 'Key') {
      const languageCodeMatch = column.match(/\((.*?)\)/);
      const languageCode = languageCodeMatch ? languageCodeMatch[1] : '';
      const value = row[column];

      if (!languageObjects[languageCode]) {
        languageObjects[languageCode] = {};
      }

      languageObjects[languageCode][key] = value;
    }
  });
});

// Write each language object to a separate JSON file
Object.entries(languageObjects).forEach(([languageCode, languageObject]) => {
  if (languageCode) {
    const jsonFileName = `jsons/locales-${languageCode.toLocaleLowerCase()}.json`;

    fs.writeFile(jsonFileName, JSON.stringify(languageObject, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(`Error writing ${jsonFileName}:`, err);
        return;
      }
      console.log(`${jsonFileName} has been created!`);
    });
  }
});
