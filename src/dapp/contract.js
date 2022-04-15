import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    numRegisteredAirlines(callback) {
        let self = this;
        self.flightSuretyApp.methods
             .numRegisteredAirlines()
             .call({ from: self.owner}, callback);
     }
    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }


    fundAirline(airlineToFund, value, callback) {
        let self = this;
        let payload = {
            airline: airlineToFund,
            value: value,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fundAirline(payload.airline)
            .send({ from: payload.airline, value:payload.value}, (error, result) => {
                callback(error, payload);
            });
    }

    registerAirline(registrarAirlineAddress, newAirlineAddress, newAirlineName, callback) {
        let self = this;
        let payload = {
            airline: newAirlineAddress,
            name: newAirlineName,
        } 

        console.log(payload);
        console.log (self.owner);
        self.flightSuretyApp.methods
            .registerAirline(payload.airline, payload.name)
            .send({ from: registrarAirlineAddress}, (error, result) => {
                callback(error, payload);
            });
    }
}