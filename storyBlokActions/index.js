const fs = require('fs')
const path = require('path')
const { createDataSource, deleteDataSource, importCSVToDataSources } = require('../storyblokAPI')
const { dataSourceDefault, csvFilesPath } = require('../config')
const { readFileSync } = require('fs')

const getCsvFilePaths = async (csvFilesPath) => {
  const csvFilePaths = {}
  // Read the list of CSV files
  const files = fs.readdirSync(csvFilesPath)
  files.forEach(file => {
    const match = file.match(/^locales-(\w{2})(?:-(\w{2}))?\.csv$/)
    if (match) {
      const languageCode = match[1]
      const countryCode = match[2] || ''
      const filePath = path.join(csvFilesPath, file)
      const key = `locales-${languageCode}${countryCode}`
      csvFilePaths[key] = filePath
    }
  })

  return csvFilePaths
}

const createAndImportDataSources = async (name, slug, spaceId) => {
  try {
    const resultCreate = await createDataSource(name, slug, spaceId)
    console.log(`Data source with name: ${name} slug: /${slug}/ created.`)
    const csvFilePaths = await getCsvFilePaths(csvFilesPath)
    const filePath = csvFilePaths[slug]
    const csvData = readFileSync(filePath, 'utf8')
    const requestData = {
      csv: csvData,
      datasource_id: resultCreate.datasource.id,
    }
    await importCSVToDataSources(requestData, spaceId)
    console.log(`Imported data for DataSource: ${name}`)
  } catch (error) {
    console.error('Error creating import data source:', JSON.stringify(error))
  }
}

// deleteAndRecreateDataSource
const deleteAndRecreateDataSourceActions = async (dataSources, spaceId) => {
  for (const dataSource of dataSources) {
    const { slug } = dataSource
    if (slug.match(/^locales-[a-z]{2}(-[a-z]{2})?$/)) {
      console.log(`Deleting and recreating data source: ${dataSource.name} (${dataSource.slug})`)
      await deleteDataSource(dataSource, spaceId)
      await createAndImportDataSources(dataSource.name, slug, spaceId)
      console.log(`Data source ${dataSource.name} (${dataSource.slug}) recreated and imported successfully.`)
    }
  }
}
const onlyImportDataSourceAction = async (dataSources, spaceId) => {
  for (const dataSource of dataSources) {
    const { slug, name, id } = dataSource
    if (slug.match(/^locales-[a-z]{2}(-[a-z]{2})?$/)) {
      console.log(`Importing data source: ${name} (${slug})`)
      const csvFilePaths = await getCsvFilePaths(csvFilesPath)
      const filePath = csvFilePaths[slug]
      const csvData = readFileSync(filePath, 'utf8')
      const requestData = {
        csv: csvData,
        datasource_id: id,
      }
      await importCSVToDataSources(requestData, spaceId)
      console.log(`Data source ${name} (${slug}) imported successfully.`)
    }
  }

}

const autoCreateDataSourceDefault = async (spaceId) => {
  const dataSourcesDefault = dataSourceDefault.map(language => {
    return {
      name: 'locales ' + language.toUpperCase(),
      slug: 'locales-' + language.toLowerCase(),
    }
  })

  console.log('No existing data sources found. Creating and importing default data sources...')
  for (const dataSource of dataSourcesDefault) {
    const { name, slug } = dataSource
    await createAndImportDataSources(name, slug, spaceId)
  }
  console.log('Default data sources created and imported successfully.')
}

module.exports = {
  getCsvFilePaths,
  createAndImportDataSources,
  deleteAndRecreateDataSourceActions,
  onlyImportDataSourceAction,
  autoCreateDataSourceDefault,
}