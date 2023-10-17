const instanceAxios = require('../config/instanceAxios')

const getSpaces = async () => {
  const responseSpaces = await instanceAxios.get('/spaces')
  return responseSpaces.spaces
}

const createDataSource = async (name, slug, spaceId) => {
  try {
    return await instanceAxios.post(`/spaces/${spaceId}/datasources`, {
      name: name,
      slug: slug,
    })
  } catch (error) {
    console.error('Error creating data source:', JSON.stringify(error))
  }
}

const getStoryblokDataSources = async (spaceId) => {
  try {
    const response = await instanceAxios.get(`/spaces/${spaceId}/datasources`)
    return response.datasources
  } catch (error) {
    console.error('Error retrieving data sources:', JSON.stringify(error))
    return []
  }
}

const deleteDataSource = async ({ id: dataSourceId, name, slug }, spaceId) => {
  try {
    await instanceAxios.delete(`/spaces/${spaceId}/datasources/${dataSourceId}`)
    console.log(`Data source with ID ${dataSourceId} deleted.`)



  } catch (error) {
    console.error('Error deleting data source:', JSON.stringify(error))
  }
}

const importCSVToDataSources = async (requestData, spaceId) => {
  try {
    const response = await instanceAxios.post(`/spaces/${spaceId}/datasource_entries/import`, requestData)
    console.log(`Success:`, JSON.stringify(response))
  } catch (error) {
    console.log(`Error import:`, JSON.stringify(error))
    throw error
  }
}

module.exports = {
  getSpaces,
  createDataSource,
  getStoryblokDataSources,
  deleteDataSource,
  importCSVToDataSources,
}