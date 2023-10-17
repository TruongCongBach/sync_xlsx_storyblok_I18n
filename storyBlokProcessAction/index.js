const { getStoryblokDataSources } = require('../storyblokAPI')
const { autoCreateDataSourceDefault, onlyImportDataSourceAction } = require('../storyBlokActions')

const checkAndProcessOnlyImportDataSources = async (spaceId) => {
  const dataSources = await getStoryblokDataSources(spaceId);

  // if no data then create and import data
  if (!dataSources.length) {
    await autoCreateDataSourceDefault(spaceId)
    return
  }

  //only import
  await onlyImportDataSourceAction(dataSources, spaceId)
};

module.exports = {
  checkAndProcessOnlyImportDataSources
}