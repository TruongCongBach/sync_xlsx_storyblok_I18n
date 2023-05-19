const fs = require('fs');
const path = require('path');

function flattenObject(obj, prefix = '') {
  let flattened = {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let nestedKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        let nestedObj = flattenObject(obj[key], nestedKey);
        flattened = { ...flattened, ...nestedObj };
      } else {
        flattened[nestedKey] = obj[key];
      }
    }
  }

  return flattened;
}

const jsonToCsv = (jsonObj) => {
  const csvRows = [];

  // Add the header row to the CSV
  csvRows.push('"name","value"');

  // Iterate over each key and its corresponding value
  for (const key in jsonObj) {
    const value = jsonObj[key];

    // If the value is an object, convert it to a string
    const formattedValue = typeof value === 'object' ? JSON.stringify(value) : value;

    // Escape double quotes in the value
    const escapedValue = formattedValue.replace(/"/g, '""');

    // Add the key-value pair as a row in the CSV
    csvRows.push(`"${key}","${escapedValue}"`);
  }

  // Combine all rows into a single CSV string
  return csvRows.join('\n');
};

const jsonsDirectory = 'jsons';
const csvOutputDirectory = 'csvs';

// Read the JSON files from the directory
fs.readdir(jsonsDirectory, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach((file) => {
    const jsonFilePath = path.join(jsonsDirectory, file);

    // Read each JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
        return;
      }

      try {
        const jsonObj = JSON.parse(data);
        const flattenedObject = flattenObject(jsonObj);
        const csvString = jsonToCsv(flattenedObject);

        // Create the CSV file path
        const csvFileName = `${path.parse(file).name}.csv`;
        const csvFilePath = path.join(csvOutputDirectory, csvFileName);

        // Write the CSV file
        fs.writeFile(csvFilePath, csvString, 'utf8', (err) => {
          if (err) {
            console.error('Error writing CSV file:', err);
            return;
          }
          console.log(`CSV file '${csvFileName}' has been created!`);
        });
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    });
  });
});
