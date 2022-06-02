
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', 
                    [ { label: 'Operational Status', error: error, value: result} ]);
        });
    
        contract.numRegisteredAirlines((error, result) => {
            console.log("Num registered airlines", error, result);
            DOM.elid("numAirlines").innerText = result;
        });


        contract.numRegisteredFlights((error, result) => {
            console.log("Num registered flights", error, result);
            DOM.elid("numFlights").innerText = result;
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;

            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    

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

                let statuses = {
                    0:  "Unknown",
                    10: "On Time",
                    20: "Late Airline",
                    30: "Late Weather",
                    40: "Late Technical",
                    50: "Late Other"
                }

                DOM.elid("flightInfoStatus").value = statuses[result];
            });
        })
    });
})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







