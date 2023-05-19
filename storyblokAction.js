const instanceAxios = require('./instanceAxios');
const configStoreFront = require('./configStoreFront');
const { readFileSync } = require('fs');
const path = require('path');
const fs = require('fs');

const spaceId = configStoreFront.spacesId;

const csvFilesPath = 'csvs'; // Replace with the actual path to the folder containing the CSV files

const getCsvFilePaths = async (csvFilesPath) => {
  const csvFilePaths = {};

  // Read the list of CSV files
  const files = fs.readdirSync(csvFilesPath);
  files.forEach(file => {
    const match = file.match(/^locales-(\w{2})(?:-(\w{2}))?\.csv$/);
    if (match) {
      const languageCode = match[1];
      const countryCode = match[2] || '';
      const filePath = path.join(csvFilesPath, file);
      const key = `locales-${languageCode}${countryCode}`;
      csvFilePaths[key] = filePath;
    }
  });

  return csvFilePaths;
}

const createDataSource = async (name, slug) => {
  try {
    const result = await instanceAxios.post(`/spaces/${spaceId}/datasources`, {
      name: name,
      slug: slug
    });
    console.log(`Data source with name: ${name} slug: ${slug} created.`);
    return result;
  } catch (error) {
    console.error('Error creating data source:', JSON.stringify(error));
  }
};
// Get the CSV file paths

const importCSVToDataSources = async (dataSourceItem) => {
  const csvFilePaths = await getCsvFilePaths(csvFilesPath);
  const filePath = csvFilePaths[dataSourceItem.slug];
  const csvData = readFileSync(filePath, 'utf8');
  const requestData = {
    csv: csvData,
    datasource_id: dataSourceItem.id
  };


  try {
    const response = await instanceAxios.post(`/spaces/${spaceId}/datasource_entries/import`, requestData);
    console.log(`Success:`, JSON.stringify(response));
  } catch (error) {
    console.log(`Error import:`, JSON.stringify(error));
    throw error;
  }
};

const createAndImportDataSources = async (name, slug) => {
  try {
    const resultCreate = await createDataSource(name, slug);
    console.log(`Data source with name: ${name} slug: ${slug} created.`);

    await importCSVToDataSources({name, slug, id: resultCreate.datasource.id});
    console.log(`Imported data for DataSource: ${name}`);
  } catch (error) {
    console.error('Error creating import data source:', JSON.stringify(error));
  }
};

const getStoryblokDataSources = async () => {
  try {
    const response = await instanceAxios.get(`/spaces/${spaceId}/datasources`);
    return response.datasources;
  } catch (error) {
    console.error('Error retrieving data sources:', JSON.stringify(error));
    return [];
  }
};

const deleteAndRecreateDataSource = async ({ id: dataSourceId, name, slug }) => {
  try {
    await instanceAxios.delete(`/spaces/${spaceId}/datasources/${dataSourceId}`);
    console.log(`Data source with ID ${dataSourceId} deleted.`);

    await createAndImportDataSources(name, slug);

  } catch (error) {
    console.error('Error deleting data source:', JSON.stringify(error));
  }
};

// Remaining code...

const checkAndProcessDataSources = async () => {
  const dataSourcesDefault = ['en', 'es', 'de', 'fr', 'nl', 'it'].map(language => {
    return {
      name: 'locales ' + language.toUpperCase(),
      slug: 'locales-' + language.toLowerCase()
    };
  });

  const dataSources = await getStoryblokDataSources();

  if (!dataSources.length) {
    console.log('No existing data sources found. Creating and importing default data sources...');
    for (const dataSource of dataSourcesDefault) {
      const { name, slug } = dataSource;
      await createAndImportDataSources(name, slug);
    }
    console.log('Default data sources created and imported successfully.');
  }


  for (const dataSource of dataSources) {
    const { slug } = dataSource;
    if (slug.match(/^locales-[a-z]{2}(-[a-z]{2})?$/)) {
      console.log(`Deleting and recreating data source: ${dataSource.name} (${dataSource.slug})`);
      await deleteAndRecreateDataSource(dataSource);
      console.log(`Data source ${dataSource.name} (${dataSource.slug}) recreated and imported successfully.`);
    }
  }

  console.log('Data source check and processing completed.');
};

checkAndProcessDataSources();
