
import DOM from './dom';
import Config from './config.json';
import Contract from './contract';
import './flightsurety.css';
import Web3 from 'web3';
console.log("yo");
let config = Config['localhost'];

let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));

// Status codes for flights
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

const STATUS_MAP = {
    0:  "Unknown",
    10: "On Time",
    20: "Late Airline",
    30: "Late Weather",
    40: "Late Technical",
    50: "Late Other"
};


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // User-submitted transaction
        DOM.elid('bootstrap-airlines').addEventListener('click', () => {
            console.log("bootstrap airlines");
            let numAirlines = parseInt(DOM.elid('numAirlinesToRegister').value);
            web3.eth.getAccounts()
            .then(async (accounts) => {
                console.log(accounts);
                console.log("accounts length", accounts.length);
                console.log("numAirlines", numAirlines);

                // Offset of 2 accounts for the contract address and the "first" 
                // airline that is registered on contract deploy
                if (accounts.length >= (numAirlines + 2))
                {
                    // Units of Ether
                    let FUND_AMOUNT = 10;

                    for(let a=0; a<numAirlines; a++) {      
                        let newAirlineName = "Airline_" + a;
                        let newAirlineAddress = accounts[a + 2];

                        // get all previously registered airlines to vote for the new airline
                        for (let b=(a - 1); b>=1; b--) {
                            let votingAirlineAddress = accounts[b];
                            contract.voteAirline(votingAirlineAddress, newAirlineAddress, (error, result) => {});
                        }

                        console.log("registering", newAirlineAddress, newAirlineName);
                        await contract.registerAirline(accounts[1], newAirlineAddress, newAirlineName, async (error, result) => {
                            contract.numRegisteredAirlines((error, result) => {
                                DOM.elid("numAirlines").innerText = result;
                            });

                            if (result)
                            {
                                console.log("ADD", typeof(result), newAirlineAddress, newAirlineName);
                                addAirline(newAirlineAddress, newAirlineName);
                            }
                        })
                        
                        // Lets fund the airline too
                        await contract.fundAirline(newAirlineAddress, FUND_AMOUNT, (error, result) => {});
                    }
                }
            })
            .catch(error => {
              console.log(error);
            });
        })

        // User-submitted transaction
        DOM.elid('bootstrap-flights').addEventListener('click', () => {
            console.log("bootstrap airlines");
            let numFlights = parseInt(DOM.elid('numFlightsToRegister').value);
            web3.eth.getAccounts()
            .then(async (accounts) => {

                let airlineIndex = 0;

                // Offset of 1 accounts for the contract address
                // Round-robin the airlines for creating new flights
                for(let a=0; a<numFlights; a++) {      
                    let flightCode = "Flight_" + a;

                    airlineIndex = (airlineIndex + 1)%accounts.length;
                    let airlineIsRegistered = await contract.isAirlineRegisteredAndFunded(accounts[airlineIndex]);
                    while(!airlineIsRegistered)
                    {
                        airlineIndex = (airlineIndex + 1)%accounts.length;
                        airlineIsRegistered = await contract.isAirlineRegisteredAndFunded(accounts[airlineIndex]);
                    }

                    let registrarAirlineAddress = accounts[airlineIndex];
                    // Make all flights online initially - the oracles will adjust this randomly
                    let flightStatus = STATUS_CODE_ON_TIME;

                    await contract.registerFlight(registrarAirlineAddress, flightCode, flightStatus, (failure, success) => {
                        contract.numRegisteredFlights((error, result) => {
                            DOM.elid("numFlights").innerText = result;
                        });

                        if (success)
                        {
                            addFlight(registrarAirlineAddress, flightCode, STATUS_MAP[flightStatus]);
                        }
                    })
                }
            })
            .catch(error => {
                console.log(error);
            });
        })

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', 
                    [ { label: 'Operational', error: error, value: result} ]);
        });
    
        contract.numRegisteredAirlines((error, result) => {
            console.log("Num registered airlines", error, result);
            DOM.elid("numAirlines").innerText = result;
        });


        contract.numRegisteredFlights((error, result) => {
            console.log("Num registered flights", error, result);
            DOM.elid("numFlights").innerText = result;
        });

        contract.numRegisteredInsurancePolicies((error, result) => {
            console.log("Num registered insurance policies", error, result);
            DOM.elid("numInsurancePolicies").innerText = result;
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;

            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    
        // User-submitted transaction
        DOM.elid('buy-insurance').addEventListener('click', () => {
            let airlineAddress   = DOM.elid('airlineAddressInsurance').value;
            let airlineName      = DOM.elid('airlineNameInsurance').value;
            let passengerAddress = DOM.elid('passengerAddressInsurance').value;
            let flightName       = DOM.elid('flightNameInsurance').value;
            let amount           = DOM.elid('amountInsurance').value;
            console.log("Buy insurance", airlineAddress, airlineName, flightName, passengerAddress, amount);
            contract.purchaseFlightInsurance(airlineAddress, airlineName, flightName, passengerAddress, amount, (error, result) => {
                contract.numRegisteredInsurancePolicies((error, result) => {
                    DOM.elid("numInsurancePolicies").innerText = result;
                });
            });
        })

        // User-submitted transaction
        DOM.elid('check-num-policies').addEventListener('click', () => {
            let passengerAddress = DOM.elid('passengerAddressInsuranceStatus').value;
            console.log("Num Policy Count", passengerAddress);
            contract.numRegisteredInsurancePoliciesForPassenger(passengerAddress, (error, result) => {
                console.log("num policies for passenger returned", error, result);
                DOM.elid("numPoliciesPassenger").value = result;
            });
        })

        // User-submitted transaction
        DOM.elid('policy-details').addEventListener('click', () => {
            let passengerAddress = DOM.elid('passengerAddressInsuranceDetails').value;
            let policyNumber = DOM.elid('policyNumber').value;
            console.log("Policy Details", passengerAddress, policyNumber);
            contract.insurancePoliciesForPassengerAirline(passengerAddress, policyNumber - 1, (error, result) => {
                console.log("insurancePoliciesForPassengerAirline", error, result);
                DOM.elid("policyAirline").value = result;
            });
            contract.insurancePoliciesForPassengerFlightName(passengerAddress, policyNumber - 1, (error, result) => {
                console.log("insurancePoliciesForPassengerFlightName", error, web3.utils.hexToString(result));
                DOM.elid("policyFlightName").value = web3.utils.hexToString(result);
            });
            contract.insurancePoliciesForPassengerInsuranceAmount(passengerAddress, policyNumber - 1, (error, result) => {
                console.log("insurancePoliciesForPassengerInsuranceAmount", error, result);
                DOM.elid("policyInsuranceAmount").value = result;
            });
            contract.insurancePoliciesForPassengerCreditAmount(passengerAddress, policyNumber - 1, (error, result) => {
                console.log("insurancePoliciesForPassengerCreditAmount", error, result);
                DOM.elid("policyInsuranceCredit").value = result;
            });
        })


        //***********************************************************//
        //                                                           //
        //                   DEBUG FUNCTIONALITY                     //
        //                                                           //
        //***********************************************************//

        // User-submitted transaction
        DOM.elid('airline-info').addEventListener('click', () => {
            let infoAddress = DOM.elid('airlineInfoAddress').value;
            contract.airlineFunding(infoAddress, (error, result) => {
                DOM.elid("airlineInfoFunding").value = contract.weiToEther(result);
            });
            contract.airlineVotes(infoAddress, (error, result) => {
                console.log("votes", result);
                DOM.elid("airlineInfoVotes").value = result;
            });
        })
    

        // User-submitted transaction
        DOM.elid('fund-airline').addEventListener('click', () => {
            let fundAddress = DOM.elid('airlineFundAddress').value;
            let fundAmount  = DOM.elid('airlineFundAmount').value;

            contract.fundAirline(fundAddress, fundAmount, (error, result) => {
                console.log("fund", error, result);
            });
        })
    

        // User-submitted transaction
        DOM.elid('register-airline').addEventListener('click', async () => {
            let registrarAirlineAddress = DOM.elid('registrarAirlineAddress').value;
            let newAirlineAddress = DOM.elid('airlineAddress').value;
            let newAirlineName = DOM.elid('airlineName').value;

            await contract.registerAirline(registrarAirlineAddress, newAirlineAddress, newAirlineName, (failure, success) => {
                if (success != undefined)
                {
                    alert("Airline registered '" + newAirlineName + "' " + newAirlineAddress);
                }
                else
                {
                    alert("Airline failed registration '" + newAirlineName + "' " + newAirlineAddress);
                }

                contract.numRegisteredAirlines((error, result) => {
                    DOM.elid("numAirlines").innerText = result;
                });
            });
        })

        // User-submitted transaction
        DOM.elid('vote-airline').addEventListener('click', () => {
            let newAirlineAddress    = DOM.elid('voteeAirlineAddress').value;
            let votingAirlineAddress = DOM.elid('votingAirlineAddress').value;

            console.log("vote airline", newAirlineAddress, votingAirlineAddress)

            contract.voteAirline(votingAirlineAddress, newAirlineAddress, (error, result) => {
                console.log("vote", error, result);
            });
        })


        // User-submitted transaction
        DOM.elid('register-flight').addEventListener('click', async () => {
            let registrarAirlineAddress = DOM.elid('flightAirlineAddress').value;
            let flightCode = DOM.elid('flightCode').value;
            let flightStatus = parseInt(DOM.elid('flightInitialStatus').value, 10);

            await contract.registerFlight(registrarAirlineAddress, flightCode, flightStatus, (failure, success) => {
                if (success != undefined)
                {
                    alert("Flight registered '" + flightCode + "' " + registrarAirlineAddress);
                }
                else
                {
                    alert("Flight failed registration '" + flightCode + "' " + registrarAirlineAddress);
                }

                contract.numRegisteredFlights((error, result) => {
                    DOM.elid("numFlights").innerText = result;
                });
            });
        })

        // User-submitted transaction
        DOM.elid('flight-info').addEventListener('click', () => {
            let flightInfoCode = DOM.elid('flightInfoCode').value;
            console.log("getting flight status for ", flightInfoCode);
          
            contract.getFlightAirline(flightInfoCode, (error, result) => {
                DOM.elid("flightInfoAirlineAddress").value  = result;
            });

            contract.getFlightStatus(flightInfoCode, (error, result) => {

                

                DOM.elid("flightInfoStatus").value = STATUS_MAP[result];
            });
        })
    });
})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h3({className: 'text-secondary'}, title));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.h4({className: 'col-sm-2 field'}, result.label));
        row.appendChild(DOM.h4({className: 'col-sm-4 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}

function addAirline(airlineAddress, airlineName) {
    let displayDiv = DOM.elid("registered-airlines");
    let section = DOM.section();
    let row = section.appendChild(DOM.div({className:'row'}));
    row.appendChild(DOM.div({className: 'col-sm-4 field'}, airlineName));
    row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, airlineAddress));
    section.appendChild(row);
    displayDiv.append(section);
}

function addFlight(airlineAddress, flightCode, flightStatus) {
    let displayDiv = DOM.elid("registered-flights");
    let section = DOM.section();
    let row = section.appendChild(DOM.div({className:'row'}));
    row.appendChild(DOM.div({className: 'col-sm-4 field'}, airlineAddress));
    row.appendChild(DOM.div({className: 'col-sm-4 field'}, flightCode));
    row.appendChild(DOM.div({className: 'col-sm-4 field'}, flightStatus));
    section.appendChild(row);
    displayDiv.append(section);
}







