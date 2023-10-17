const axios = require('axios')
const storyblokConfig  = require('../storyblok.config');
const { baseURL } = require('./index')

const instanceAxios = axios.create({
  timeout: 100000,
  baseURL: baseURL,
})

const headers = {
  'authority': 'app.storyblok.com',
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en,en-US;q=0.9,vi;q=0.8,nl;q=0.7',
  'content-type': 'application/json',
  'origin': 'https://app.storyblok.com',
  'referer': 'https://app.storyblok.com/',
  'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
};

instanceAxios.interceptors.request.use(function (config) {
  config.headers = {
    ...headers,
    authorization : storyblokConfig.authorization
  }
  return config
})

instanceAxios.interceptors.response.use(function (response) {
  return response.data
})

module.exports = instanceAxios