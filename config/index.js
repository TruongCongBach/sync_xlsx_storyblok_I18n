require('dotenv').config()

const config = {
  baseURL: "https://app.storyblok.com/v1",
  STORYBLOK_OAUTH_TOKEN: process.env.STORYBLOK_OAUTH_TOKEN,
  dataSourceDefault: ['en', 'es', 'de', 'fr', 'nl', 'it'],
  csvFilesPath: 'csvs', // Replace with the actual path to the folder containing the CSV files
  spacesIds: [244923, 242800] //Distech Controls INT SF2 SF1
  // spacesIds: [241390] //Distech Controls - PROD
  // spacesIds: [177331, 179226] //krq sf1 sf2
  // spacesIds: [203807, 203810] // uat krq sf1 sf2
}
module.exports = config