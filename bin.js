#!/usr/bin/env node

const assert = require('assert')

const Main = require('./index')

require('dotenv').config()

const {
  CENTRAL_API_KEY,
  ZT_NETWORK_ID,
  DNS_API_KEY,
  DOMAIN
} = process.env

assert(CENTRAL_API_KEY && ZT_NETWORK_ID && DNS_API_KEY && DOMAIN, `Please set these env vars:

CENTRAL_API_KEY,
ZT_NETWORK_ID,
DNS_API_KEY,
DOMAIN

you can save them in a file called .env if you want
`)

const main = Main({
  ztNetworkId: ZT_NETWORK_ID,
  ztCentralToken: CENTRAL_API_KEY,
  domain: DOMAIN,
  vultrToken: DNS_API_KEY
})

main()
