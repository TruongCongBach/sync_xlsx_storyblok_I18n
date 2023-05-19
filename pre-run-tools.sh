rm -rf jsons/*.json
rm -rf csvs/*.csv
rm -rf locales/

node xlsxToJson.js && node jsonToCSV.js && node objectLocalesForProject.js