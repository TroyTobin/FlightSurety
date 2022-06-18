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

// Status codes that are randomly returned 
// by the oracles
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const STATUS_OPTIONS = [
  STATUS_CODE_UNKNOWN,
  STATUS_CODE_ON_TIME,
  STATUS_CODE_LATE_AIRLINE,
  STATUS_CODE_LATE_WEATHER,
  STATUS_CODE_LATE_TECHNICAL,
  STATUS_CODE_LATE_OTHER
];

//***************************
// Register Set of oracles 
//***************************
var oracles = [];


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
                  
                  // Store the address to index mapping
                  oracles.push([accounts[a]]);
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
  }, async function (error, event) {
    if (error) 
    {
      console.log(error);
    }
    else
    {
      // "returnValues":{
      //   "0":"9",
      // "1":"0xf17f52151EbEF6C7334FAD080c5704D77216b732",
      // "2":"efef",
      // "3":"1652711101","index":"9",
      // "airline":"0xf17f52151EbEF6C7334FAD080c5704D77216b732",
      // "flight":"efef",
      // "timestamp":"1652711101"}
      let returnedValues = event.returnValues;

      let oracleIndex = returnedValues.index;
      let airline     = returnedValues.airline;
      let flight      = returnedValues.flight;
      let timestamp   = returnedValues.timestamp;


      oracles.forEach(response);

      async function response(address)
      {

        let isCorrectIndex = await flightSuretyApp.methods.oracleIndexMatches(address[0], oracleIndex).call();
        if (isCorrectIndex)
        {
          // Force the status to be airline late - so we can test insurance
          let status = STATUS_CODE_LATE_AIRLINE;
          await flightSuretyApp.methods.submitOracleResponse(oracleIndex, 
                                                       airline, 
                                                       flight, 
                                                       timestamp, 
                                                       status)
                                        .send({from:address[0]});
          }
      }
    }
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


