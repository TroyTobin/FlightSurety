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


# Testing and Demonstration

## Running tests
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

## Dapp Demonstration
### Set-up ganache GUI
  * Increase number of accounts to 30
  * Set the MNEMONIC to "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

![image](https://user-images.githubusercontent.com/3337802/174428328-a544e12e-598e-4b4d-bbc1-880232008142.png)

### Migrate contract
`> truffle migrate`

![image](https://user-images.githubusercontent.com/3337802/174428508-b9d15363-d24e-4de5-bc98-3f3dd3b2b3f9.png)

### Run dapp
`> npm run dapp`

### Open web browser (tested on firefox) to http://localhost:8000/
  * Will be presented with the content as shown below - with three(3) tabs which will be utilized throughout testing
  * Tabs (Bootstrap, Insurance, Debug)
  
![image](https://user-images.githubusercontent.com/3337802/174428578-07cb9bae-ddba-4215-a18c-74ad4dc6d3ae.png)

### Bootstrap
  * Allows for quick initial airline and flight registration

![image](https://user-images.githubusercontent.com/3337802/174428641-339f4948-1b61-455b-b451-7a8225e02c30.png)

  * Try testing with
    * five(5) airlines
    * ten(10) flights - will get distributed amongst the registered airlines

![image](https://user-images.githubusercontent.com/3337802/174428706-f7c1b0e3-5232-4bfc-8c2a-b49cfd91bfd9.png)

![image](https://user-images.githubusercontent.com/3337802/174428720-a471ea5d-08eb-45ea-be8b-11be76bc38ae.png)

  * Ganache shows funding of 10eth has occured and the TX number

![image](https://user-images.githubusercontent.com/3337802/174429074-a4fe7224-519d-4c10-84d5-90914fa0d0f2.png)


### Insurance
  * Allows a passenger to purchase insurance and withdraw credits

![image](https://user-images.githubusercontent.com/3337802/174428901-3fc974e6-7bbe-4338-bc6a-be70ba5e9588.png)

* Try purchasing insurance
  * Airline Address: 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef
  * Airline Name: Airline_0
  * Passenger Address: 0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5
  * Flight Name: Flight_1
  * Amount (Wei): 500000000000000000

![image](https://user-images.githubusercontent.com/3337802/174429227-291e995c-0072-46c8-85fe-728b5dff72cc.png)

* Check that the insurance was registered for the passenger

![image](https://user-images.githubusercontent.com/3337802/174429342-de43be07-cb12-428d-b54a-76bc0e678f00.png)

* Ganache shows the insurace is charged

![image](https://user-images.githubusercontent.com/3337802/174429600-e343fff0-3f0b-4d15-bf9a-c3a12df5b9da.png)



* Start the server so oracles are registered
`npm run server`

```
> flightsurety@1.0.0 server
> rm -rf ./build/server && webpack --config webpack.config.server.js

asset server.js 1.21 MiB [emitted] (name: main)
runtime modules 23.5 KiB 9 modules
built modules 1.03 MiB [built]
  cacheable modules 1.03 MiB
    javascript modules 7.8 KiB
      modules by path ./node_modules/webpack/hot/*.js 3.75 KiB 3 modules
      modules by path ./src/server/*.js 4.05 KiB
        ./src/server/index.js 290 bytes [built] [code generated]
        ./src/server/server.js 3.77 KiB [built] [code generated]
    json modules 1.02 MiB
      ./build/contracts/FlightSuretyApp.json 1.02 MiB [built] [code generated]
      ./src/server/config.json 172 bytes [built] [code generated]
  external "http" 42 bytes [built] [code generated]
  external "web3" 42 bytes [built] [code generated]
  external "express" 42 bytes [built] [code generated]
webpack 5.72.0 compiled successfully in 603 ms
[
  '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
  '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
  '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
  '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
  '0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e',
  '0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5',
  '0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5',
  '0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc',
  '0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE',
  '0xE44c4cf797505AF1527B11e4F4c6f95531b4Be24',
  '0x69e1CB5cFcA8A311586e3406ed0301C06fb839a2',
  '0xF014343BDFFbED8660A9d8721deC985126f189F3',
  '0x0E79EDbD6A727CfeE09A2b1d0A59F7752d5bf7C9',
  '0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4',
  '0xa23eAEf02F9E0338EEcDa8Fdd0A73aDD781b2A86',
  '0xc449a27B106BE1120Bd1Fd62F8166A2F61588eb9',
  '0xF24AE9CE9B62d83059BD849b9F36d3f4792F5081',
  '0xc44B027a94913FB515B19F04CAf515e74AE24FD6',
  '0xcb0236B37Ff19001633E38808bd124b60B1fE1ba',
  '0x715e632C0FE0d07D02fC3d2Cf630d11e1A45C522',
  '0x90FFD070a8333ACB4Ac1b8EBa59a77f9f1001819',
  '0x036945CD50df76077cb2D6CF5293B32252BCe247',
  '0x23f0227FB09D50477331D2BB8519A38a52B9dFAF',
  '0x799759c45265B96cac16b88A7084C068d38aFce9',
  '0xA6BFE07B18Df9E42F0086D2FCe9334B701868314',
  '0x39Ae04B556bbdD73123Bab2d091DCD068144361F',
  '0x068729ec4f46330d9Af83f2f5AF1B155d957BD42',
  '0x9EE19563Df46208d4C1a11c9171216012E9ba2D0',
  '0x04ab41d3d5147c5d2BdC3BcFC5e62539fd7e428B'
]
Oracle Registered: 1, 6, 8
Oracle Registered: 4, 9, 8
Oracle Registered: 8, 2, 5
Oracle Registered: 2, 8, 3
Oracle Registered: 1, 5, 3
Oracle Registered: 0, 3, 5
Oracle Registered: 5, 8, 2
Oracle Registered: 9, 3, 2
Oracle Registered: 5, 9, 0
Oracle Registered: 9, 2, 6
Oracle Registered: 6, 4, 7
Oracle Registered: 0, 5, 4
Oracle Registered: 7, 8, 5
Oracle Registered: 6, 0, 1
Oracle Registered: 5, 7, 9
Oracle Registered: 2, 1, 0
Oracle Registered: 1, 3, 4
Oracle Registered: 3, 7, 8
Oracle Registered: 4, 6, 2
Oracle Registered: 9, 6, 2

```

These will be registered to the last of the accounts in the ganache list

![image](https://user-images.githubusercontent.com/3337802/174429560-c91cc1f5-231a-47bf-b772-288f9c434095.png)

* Submit flight to oracles for status update (they are hardcoded to return the "Late Airline" so testing is easier
  * Depending on how many oracles are consulted, might need to consult them a number of times for the status to actually change

![image](https://user-images.githubusercontent.com/3337802/174429639-695d2ab8-0849-43fd-82f3-5dc8812e760d.png)

* The "Debug Tab" can be used to check the flight status
  
![image](https://user-images.githubusercontent.com/3337802/174429693-3288c881-1495-4821-ba5e-c3cf5afadbd1.png)

* Check the passenger policy in the "Insurance Tab" that it has been credited an appropriate amount for the "Late Airline"

![image](https://user-images.githubusercontent.com/3337802/174429745-07a3153f-5d48-48a1-8c2f-bbc57658607f.png)


### Withdraw credit

* Withdraw
![image](https://user-images.githubusercontent.com/3337802/174429778-a41ef7f0-362b-45ca-9cdc-54a423bfc555.png)

* Check there is no longer any credit

![image](https://user-images.githubusercontent.com/3337802/174429814-5090f0fa-2518-46d2-8ce7-01746c2bf353.png)

* Check Ganache has reflected the credit

![image](https://user-images.githubusercontent.com/3337802/174429831-4d2850a3-28c6-4bb5-9dae-1f38ef9f16e8.png)













