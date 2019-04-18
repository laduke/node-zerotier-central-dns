# Put ZeroTier Network Members in Public DNS
Just a personal script for now. Takes a ZeroTier Network ID and a domain name, (and ZeroTier Central and Vultr API tokens) and makes A Records and CNAMES. 

It will delete all existing A records and CNAMES on $DOMAIN, so watch out. 

Makes your domain look like: 

- A :: deedfeef11 -> 10.127.90.13
- CNAME :: my-member-name ->1672d6e1e1.example.com 


where deedfeef11 is the Member's ID and 10.127.90.11 is it's ZeroTier Managed IP address

## Why would I want this? 
Well, add example.com to your computer's search domains first of all. 
Then you can say `ping my-member-name` or `ping deedfeef11` instead of memorizing all those IP addresses. 

You can get a domain for 4 or 5 bux for a year (but then they raise the price and you have to get a new domain).


## I use a different DNS service
ok make a ticket

## How do I run it?
`npx laduke/node-zerotier-central-dns`

## TODO
- [ ] IPv6 (AAAA)
