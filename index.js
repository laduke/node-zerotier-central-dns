const assert = require('assert')
const isIp = require('is-ip')

const Central = require('./central-api')
const Vultr = require('./vultr')

module.exports = function (opts) {
  assert(
    typeof opts === 'object',
    `Please pass an options object.
ztNetworkId: '8056c2e21c333331'
ztCentralToken: '0cFQMU8KrYQy6iTM' (my.zerotier.com)
domain: 'my-cool-domain.net'
vultrToken: 'XE99sroECwg&Ea2b6Ou'
`
  )
  assert(typeof opts.ztNetworkId === 'string', 'Need option: ztNetworkId')
  assert(
    typeof opts.ztCentralToken === 'string',
    'Need option: ztCentralToken'
  )
  assert(typeof opts.domain === 'string', 'Need option: domain')
  assert(typeof opts.vultrToken === 'string', 'Need option: vultrToken')

  return async function main () {
    const { ztNetworkId, domain, ztCentralToken, vultrToken } = opts

    const central = Central(ztCentralToken)
    const vultr = Vultr(vultrToken)

    const { body: members } = await central.getMembers(ztNetworkId)
    const { body: records } = await vultr.listRecords(domain)

    const ztIpAssignments = members.filter(notHidden).flatMap(membersIps)

    const ztArecords = ztIpAssignments
      .filter(isIPv4)
      .map(getNameAndIP)
      .map(addProp({ type: 'A' }))
      .map(addProp({ domain }))

    const vtArecords = records.filter(isArecord).map(addProp({ domain })) // { domain, name, type, data }

    const deleteA = toDelete(ztArecords, vtArecords)
    const createA = toCreate(ztArecords, vtArecords)
    console.log('to delete Arecords:', deleteA.map(x => x.name))
    console.log('to create Arecords:', createA.map(x => x.name))
    console.log()

    const ztCnames = members
      .filter(notHidden) // { ...member }
      .map(getNameAndId) // { name, data }
      .concat(members.map(getServiceNames))
      .concat(members.map(getWildcardName))
      .flatMap(x => x)
      .filter(x => x.name)
      .map(cnameFQDN(domain)) // { name, data }
      .map(addProp({ domain })) // { domain, name, data }
      .map(addProp({ type: 'CNAME' })) // { type, domain, name, data }

    const vtCnames = records.filter(isCname).map(addProp({ domain })) // { domain, name, type, data }

    const deleteC = toDelete(ztCnames, vtCnames)
    const createC = toCreate(ztCnames, vtCnames)
    console.log('to delete Cnames:', deleteC.map(x => x.name))
    console.log('to create Cnames:', createC.map(x => x.name))

    for (const rec of [...deleteA, ...deleteC]) {
      try {
        await vultr.deleteRecord(rec)
      } catch (e) {
        console.log(e.message, rec)
      }
    }

    for (const rec of [...createA, ...createC]) {
      try {
        await vultr.createRecord(rec)
      } catch (e) {
        console.log(e.message, rec)
      }
    }
  }
}

function notHidden (member) {
  return !member.hidden
}

function addProp (prop) {
  return function (obj) {
    return { ...prop, ...obj }
  }
}

function isIPv4 (member) {
  return isIp.v4(member.ipAssignment)
}

function sanitizeHostname (name) {
  var nonAsciiRe = /[^ -~]/g
  var whiteSpaceRe = /\s+/g

  return name
    .replace(nonAsciiRe, '') // only ascii
    .replace(whiteSpaceRe, '-') // whitespace to dash
}

// Vultr specific
function cnameFQDN (domain) {
  return function (record) {
    const { data, ...rest } = record
    return { data: `${data}.${domain}`, ...rest }
  }
}

function getNameAndId (member) {
  const name = sanitizeHostname(member.name)

  return { data: member.nodeId, name }
}

function getWildcardName (member) {
  const name = sanitizeHostname(member.name)

  return {
    data: member.nodeId,
    name: `*.${name}`
  }
}

function getServiceNames (member) {
  const { description = '' } = member

  return description.includes(';')
    ? member.description
      .split(';')
      .map(x => ({
        data: member.nodeId,
        name: sanitizeHostname(x)
      }))
      .filter(x => x.name)
    : {}
}

function getNameAndIP ({ ipAssignment, nodeId }) {
  return { name: nodeId, data: ipAssignment }
}

function membersIps (member) {
  const {
    config: { ipAssignments },
    nodeId
  } = member
  return ipAssignments.map(function (ipAssignment) {
    return { nodeId, ipAssignment }
  })
}

function isArecord (record) {
  return record.type === 'A'
}

function isCname (record) {
  return record.type === 'CNAME'
}

// inefficient for now
// A records
function toCreate (zt, vt) {
  return zt.filter(function missing_ (z) {
    const { name, data } = z
    return !vt.some(function some_ (v) {
      const { name: nameB, data: dataB } = v
      return data === dataB && name === nameB
    })
  })
}

function toDelete (zt, vt) {
  return vt.filter(function missing_ (z) {
    const { name, data } = z
    return !zt.some(function some_ (v) {
      const { name: nameB, data: dataB } = v
      return data === dataB && name === nameB
    })
  })
}
