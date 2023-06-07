const instanceAxios = require('./instanceAxios');
const { readFileSync } = require('fs');
const path = require('path');
const fs = require('fs');



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

const createDataSource = async (name, slug, spaceId) => {
  try {
    return await instanceAxios.post(`/spaces/${spaceId}/datasources`, {
      name: name,
      slug: slug
    });
  } catch (error) {
    console.error('Error creating data source:', JSON.stringify(error));
  }
};

const importCSVToDataSources = async (dataSourceItem, spaceId) => {
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

const createAndImportDataSources = async (name, slug, spaceId) => {
  try {
    const resultCreate = await createDataSource(name, slug, spaceId);
    console.log(`Data source with name: ${name} slug: /${slug}/ created.`);

    await importCSVToDataSources({name, slug, id: resultCreate.datasource.id}, spaceId);
    console.log(`Imported data for DataSource: ${name}`);
  } catch (error) {
    console.error('Error creating import data source:', JSON.stringify(error));
  }
};

const getStoryblokDataSources = async (spaceId) => {
  try {
    const response = await instanceAxios.get(`/spaces/${spaceId}/datasources`);
    return response.datasources;
  } catch (error) {
    console.error('Error retrieving data sources:', JSON.stringify(error));
    return [];
  }
};

const deleteAndRecreateDataSource = async ({ id: dataSourceId, name, slug }, spaceId) => {
  try {
    await instanceAxios.delete(`/spaces/${spaceId}/datasources/${dataSourceId}`);
    console.log(`Data source with ID ${dataSourceId} deleted.`);

    await createAndImportDataSources(name, slug, spaceId);

  } catch (error) {
    console.error('Error deleting data source:', JSON.stringify(error));
  }
};


const checkAndProcessDataSources = async (spaceId) => {
  const dataSourcesDefault = ['en', 'es', 'de', 'fr', 'nl', 'it'].map(language => {
    return {
      name: 'locales ' + language.toUpperCase(),
      slug: 'locales-' + language.toLowerCase()
    };
  });

  const dataSources = await getStoryblokDataSources(spaceId);

  if (!dataSources.length) {
    console.log('No existing data sources found. Creating and importing default data sources...');
    for (const dataSource of dataSourcesDefault) {
      const { name, slug } = dataSource;
      await createAndImportDataSources(name, slug, spaceId);
    }
    console.log('Default data sources created and imported successfully.');
    return
  }


  // deleteAndRecreateDataSource
  // for (const dataSource of dataSources) {
  //   const { slug } = dataSource;
  //   if (slug.match(/^locales-[a-z]{2}(-[a-z]{2})?$/)) {
  //     console.log(`Deleting and recreating data source: ${dataSource.name} (${dataSource.slug})`);
  //     await deleteAndRecreateDataSource(dataSource, spaceId);
  //     console.log(`Data source ${dataSource.name} (${dataSource.slug}) recreated and imported successfully.`);
  //   }
  // }


  //only import
  for (const dataSource of dataSources) {
    const { slug, name, id } = dataSource;
    if (slug.match(/^locales-[a-z]{2}(-[a-z]{2})?$/)) {
      console.log(`Deleting and recreating data source: ${name} (${slug})`);
      await importCSVToDataSources({name, slug, id}, spaceId);
      console.log(`Data source ${name} (${slug}) imported successfully.`);
    }
  }

  console.log('Data source check and processing completed.');
};


const spacesFile = require('./space.json')

const run =  async () => {
  for (const space of spacesFile.spaces) {
    console.log('======== START =====');
    console.log(space.name);
    await checkAndProcessDataSources(space.id);
    console.log('======== END ========');
    console.log('=====================');
  }
}

run()