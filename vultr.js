const request = require('nanorequest')

module.exports = function Vultr (API_KEY) {
  return {
    createRecord,
    deleteRecord,
    listDomains,
    listRecords
  }

  function createRecord (record) {
    const path = 'dns/create_record'
    return requestWithOpts(path, 'POST', record)
  }

  function deleteRecord (record) {
    const path = 'dns/delete_record'
    return requestWithOpts(path, 'POST', record)
  }

  function listDomains () {
    return requestWithOpts('dns/list')
  }

  function listRecords (domain) {
    return requestWithOpts(`dns/records?domain=${domain}`)
  }

  function requestWithOpts (path, method, body) {
    const opts = makeOpts(path, method, body)
    return request(opts)
  }

  function makeOpts (path, method = 'GET', body) {
    let opts = {
      url: `https://api.vultr.com/v1/${path}`,
      method,
      headers: {
        'API-Key': API_KEY,
        'content-type': 'application/x-www-form-urlencoded'
      }
    }
    if (body) {
      opts.body = toUrlEncoded(body)
    }
    return opts
  }
}

function toUrlEncoded (obj) { return Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&') }
