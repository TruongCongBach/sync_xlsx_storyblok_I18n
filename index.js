const { getSpaces } = require('./storyblokAPI')
const config = require('./config')
const { checkAndProcessOnlyImportDataSources } = require('./storyBlokProcessAction')

const run =  async () => {
  const spaces = await getSpaces()
  for (const space of spaces) {
    if(config.spacesIds.includes(space.id)) {
    console.log(`======== START ${space.name} =====`);
    await checkAndProcessOnlyImportDataSources(space.id);
    console.log('======== END ========');
    console.log('=====================');
    }
  }
}
run()