import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyApp.options.gas = 200000;
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

    weiToEther(wei)
    {
        return this.web3.utils.fromWei(wei, "ether");
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


    airlineFunding(airline, callback) {
        let self = this;
        let payload = {
            airline: airline,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .airlineFunding(payload.airline)
            .call({from: payload.airline}, callback)
    }


    airlineVotes(airline, callback) {
        let self = this;
        let payload = {
            airline: airline,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .votesSupportingAirlineRegistration(payload.airline)
            .call({from: payload.airline}, callback)
    }


    fundAirline(airlineToFund, value, callback) {
        let self = this;
        let payload = {
            airline: airlineToFund,
            value:  this.web3.utils.toWei(this.web3.utils.toBN(value), "ether"),
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fundAirline()
            .send({ from: payload.airline, value:payload.value}, (error, result) => {
                callback(error, payload);
            });
    }


    voteAirline(votingAirline, newAirline, callback) {
        let self = this;    
        let payload = {
            newAirline: newAirline,
            votingAirline: votingAirline,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .voteToRegisterAirline(payload.newAirline)
            .send({from: payload.votingAirline}, (error, result) => {
                callback(error, payload);
            });
    }

    registerAirline(registrarAirlineAddress, newAirlineAddress, newAirlineName, callback) {
        let self = this;
        let payload = {
            airline: newAirlineAddress,
            name: newAirlineName,
        } 

        self.flightSuretyApp.methods
            .registerAirline(payload.airline, payload.name)
            .send({from: registrarAirlineAddress}, (error, result) => {
                callback(error, result);
            })
            .then(function(events){
                callback(events.events["RegisterAirlineFailure"], events.events["RegisterAirlineSuccess"]);
            });
    }

    registerFlight(registrarAirlineAddress, flightCode, flightStatus, callback) {
        let self = this;
        let payload = {
            airline: registrarAirlineAddress,
            flightCode: this.web3.utils.padLeft(this.web3.utils.asciiToHex(flightCode)),
            flightStatus: flightStatus,
        } 

        self.flightSuretyApp.methods
            .registerFlight(payload.flightCode, payload.flightStatus)
            .send({from: registrarAirlineAddress}, (error, result) => {
            })
            .then(function(events){
                callback(events.events["RegisterFlightFailure"], events.events["RegisterFlightSuccess"]);
            });
    }

    numRegisteredFlights(callback) {
        let self = this;
        self.flightSuretyApp.methods
             .numRegisteredFlights()
             .call({ from: self.owner}, callback);
    }
}