const fs = require('fs');
const path = require('path');

const jsonFilesPath = 'jsons'; // Replace with the actual path to the folder containing the "locales-<language>.json" files
const outputFolderPath = 'locales'; // Replace with the desired output folder path

function convertToNestedObject(obj) {
  const nestedObj = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const keys = key.split('.');

      let currentObj = nestedObj;
      for (let i = 0; i < keys.length - 1; i++) {
        const nestedKey = keys[i];
        if (!currentObj[nestedKey]) {
          currentObj[nestedKey] = {};
        }
        currentObj = currentObj[nestedKey];
      }

      currentObj[keys[keys.length - 1]] = value;
    }
  }

  return nestedObj;
}

// Read the list of JSON files
fs.readdir(jsonFilesPath, (err, files) => {
  if (err) {
    console.error('Error reading JSON files:', err);
    return;
  }

  // Iterate over each JSON file
  files.forEach(file => {
    const match = file.match(/^locales-(\w{2})\.json$/);
    if (match) {
      const languageCode = match[1].toLowerCase();
      const filePath = path.join(jsonFilesPath, file);

      // Read the JSON file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          return;
        }

        try {
          // Parse the JSON data
          const jsonData = JSON.parse(data);

          // Convert to nested object
          const nestedData = convertToNestedObject(jsonData);

          // Create the output directory for the language code if it doesn't exist
          const languageFolderPath = path.join(outputFolderPath, languageCode);
          if (!fs.existsSync(languageFolderPath)) {
            fs.mkdirSync(languageFolderPath, { recursive: true });
          }

          // Write the converted JSON to the output file
          const outputFilePath = path.join(languageFolderPath, 'common.json');
          fs.writeFile(outputFilePath, JSON.stringify(nestedData, null, 2), 'utf8', (err) => {
            if (err) {
              console.error('Error writing output file:', err);
              return;
            }
            console.log(`JSON file (${outputFilePath}) has been created!`);
          });
        } catch (err) {
          console.error('Error parsing JSON:', err);
        }
      });
    }
  });
});
