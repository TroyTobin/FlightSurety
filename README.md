# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)


## Testing and Demonstration

### Running tests
* Start ganache
`> ganache-cli -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" -a50`

* migrate contract
`> truffle migrate`

* run tests
`> truffle test`

```
  Contract: Flight Surety Tests
    ✓ (multiparty) has correct initial isOperational() value (89ms)
    ✓ (multiparty) can block access to setOperatingStatus() for non-Contract Owner account (2461ms)
    ✓ (multiparty) can allow access to setOperatingStatus() for Contract Owner account (302ms)
    ✓ (multiparty) can block access to functions using requireIsOperational when operating status is false (231ms)
    ✓ (airline) cannot register an Airline using registerAirline() if it is not funded (389ms)
    ✓ (airline) can register an Airline using registerAirline() if it is funded (655ms)
    ✓ (airline) can register upto 4 Airlines before voting is required (12749ms)

  Contract: Oracles
Oracle Registered: 2, 0, 3
Oracle Registered: 6, 8, 1
Oracle Registered: 5, 1, 4
Oracle Registered: 6, 7, 5
Oracle Registered: 4, 7, 9
Oracle Registered: 1, 6, 0
Oracle Registered: 0, 4, 8
Oracle Registered: 2, 3, 5
Oracle Registered: 9, 8, 5
Oracle Registered: 6, 2, 9
Oracle Registered: 5, 2, 3
Oracle Registered: 6, 4, 2
Oracle Registered: 2, 6, 9
Oracle Registered: 7, 2, 1
Oracle Registered: 6, 4, 7
Oracle Registered: 4, 3, 7
Oracle Registered: 7, 2, 8
Oracle Registered: 2, 5, 0
Oracle Registered: 1, 5, 8
    ✓ can register oracles (16520ms)
    ✓ can request flight status (2667ms)


  9 passing (48s)

```
