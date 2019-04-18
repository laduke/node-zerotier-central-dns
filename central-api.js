const request = require('nanorequest')


module.exports = function CentralAPI (API_TOKEN) {
  return {
    getNetworks,
    getNetwork,
    getMembers
  }

  function makeOpts (path, method = 'GET') {
    const opts = {
      url: `https://my.zerotier.com/api/${path}`,
      method,
      headers: {
        Authorization: `bearer ${API_TOKEN}`
      }
    }
    return opts
  }

  function getNetworks () {
    return request(makeOpts('network'))
  }

  function getNetwork (id) {
    const path = `network/${id}`
    return request(makeOpts(path))
  }

  function getMembers (networkId) {
    const path = `network/${networkId}/member`
    return request(makeOpts(path))
  }
}
