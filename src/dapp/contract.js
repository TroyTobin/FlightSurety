import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.flightSuretyApp.options.gas = 2000000;
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
             .call({from: self.owner}, callback);
    }

    isAirlineRegisteredAndFunded(airline, callback) {
        let self = this;
        return self.flightSuretyApp.methods
             .isAirlineRegisteredAndFunded(airline)
             .call({from: self.owner}, callback);
    }

    fetchFlightStatus(airline, flight, callback) {
        let self = this;
        let payload = {
            airline: airline,
            flight: flight,
            flightPadded: this.web3.utils.padLeft(this.web3.utils.asciiToHex(flight)),
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flightPadded, payload.timestamp)
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
            .send({from: payload.airline, value:payload.value}, (error, result) => {
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

    getFlightStatus(flightCode, callback) {
        let self = this;
        flightCode = this.web3.utils.padLeft(this.web3.utils.asciiToHex(flightCode))
        self.flightSuretyApp.methods
             .getFlightStatus(flightCode)
             .call({from: self.owner}, callback);
    }

    getFlightAirline(flightCode, callback) {
        let self = this;
        flightCode = this.web3.utils.padLeft(this.web3.utils.asciiToHex(flightCode))
        self.flightSuretyApp.methods
             .getFlightAirline(flightCode)
             .call({from: self.owner}, callback);
    }


    purchaseFlightInsurance(airlineAddress, airlineName, flightName, passengerAddress, amount, callback) {
        let self = this;

        let payload = {
            airline: airlineAddress,
            airlineName: airlineName,
            flightName: this.web3.utils.padLeft(this.web3.utils.asciiToHex(flightName)),
            passenger: passengerAddress,
            insuranceAmount: this.web3.utils.toWei(this.web3.utils.toBN(amount), "wei")
        }
        self.flightSuretyApp.methods
            .purchaseFlightInsurance(payload.airline, payload.airlineName, payload.flightName)
            .send({from: payload.passenger, value:payload.insuranceAmount}, (error, result) => {
            })
            .then(function(events){
                callback(events.events["RegisterFlightFailure"], events.events["RegisterFlightSuccess"]);
            });
    }

    withdrawFlightInsurance(passengerAddress, airlineAddress, flightName, amount, callback) {
        let self = this;

        let payload = {
            airline: airlineAddress,
            flightName: this.web3.utils.padLeft(this.web3.utils.asciiToHex(flightName)),
            passenger: passengerAddress,
            withdrawAmount: this.web3.utils.toWei(this.web3.utils.toBN(amount), "wei")
        }
        self.flightSuretyApp.methods
            .withdrawFlightInsurance(payload.passenger, payload.airline, payload.flightName, payload.withdrawAmount)
            .send({from: self.owner, value:payload.withdrawAmount}, (error, result) => {
            })
            .then(function(events){
                callback(events.events["RegisterFlightFailure"], events.events["RegisterFlightSuccess"]);
            });
    }

    numRegisteredInsurancePolicies(callback) {
        let self = this;
        self.flightSuretyApp.methods
             .numRegisteredInsurancePolicies()
             .call({ from: self.owner}, callback);
    }

    numRegisteredInsurancePoliciesForPassenger(passengerAdddress, callback) {
        let self = this;
        self.flightSuretyApp.getPastEvents('allEvents',{ fromBlock:0, toBlock:'latest'})
        .then(async (events) => {
            console.log("App events", events);
        });


        self.flightSuretyData.getPastEvents('allEvents',{ fromBlock:0, toBlock:'latest'})
        .then(async (events) => {
            console.log("Data events", events);
        });
        
        self.flightSuretyApp.methods
             .numRegisteredInsurancePoliciesForPassenger(passengerAdddress)
             .call({from: self.owner}, callback);
    }

    insurancePoliciesForPassengerAirline(passengerAdddress, index, callback) {
        let self = this;
        self.flightSuretyApp.methods
             .insurancePoliciesForPassengerAirline(passengerAdddress, index)
             .call({from: self.owner}, callback);
    }

    insurancePoliciesForPassengerFlightName(passengerAdddress, index, callback) {
        let self = this;
        self.flightSuretyApp.methods
             .insurancePoliciesForPassengerFlightName(passengerAdddress, index)
             .call({from: self.owner}, callback);
    }

    insurancePoliciesForPassengerInsuranceAmount(passengerAdddress, index, callback) {
        let self = this;
        self.flightSuretyApp.methods
             .insurancePoliciesForPassengerInsuranceAmount(passengerAdddress, index)
             .call({from: self.owner}, callback);
    }

    insurancePoliciesForPassengerCreditAmount(passengerAdddress, index, callback) {
        let self = this;
        self.flightSuretyApp.methods
             .insurancePoliciesForPassengerCreditAmount(passengerAdddress, index)
             .call({from: self.owner}, callback);
    }
}