import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let ORACLE_COUNT = 20;

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
flightSuretyApp.options.gas = 2000000;



(async() => {
  web3.eth.getAccounts()
      .then(async (accounts) => {
          console.log(accounts);
          // There needs to be at least ORACLE_COUNT additional accounts
          if (accounts.length >= (ORACLE_COUNT + 1))
          {
              // Retrieve the fee for oracle registration
              let fee = await flightSuretyApp.methods.REGISTRATION_FEE().call();

              // Register oracles
              for(let a=accounts.length - 1; a>=(accounts.length - ORACLE_COUNT); a--) {      
                  await flightSuretyApp.methods.registerOracle().send({from: accounts[a], value: fee });
                  let result = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[a]});
                  console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
              }
          }
          else
          {
              console.log("Not enough addresses available to register oracles.")
          }
      })
      .catch(error => {
        console.log(error);
      });
  })();




flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


