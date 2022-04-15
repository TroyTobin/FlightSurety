
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
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    

        // User-submitted transaction
        DOM.elid('fund-airline').addEventListener('click', () => {
            let fundAddress = DOM.elid('airlineFundAddress').value;
            let fundAmount = DOM.elid('airlineFundAmount').value;
            // Write transaction
            contract.fundAirline(fundAddress, fundAmount, (error, result) => {
                console.log("fund", error, result);
            });
        })
    

        // User-submitted transaction
        DOM.elid('register-airline').addEventListener('click', () => {
            let registrarAirlineAddress = DOM.elid('registrarAirlineAddress').value;
            let newAirlineAddress = DOM.elid('airlineAddress').value;
            let newAirlineName = DOM.elid('airlineName').value;
            // Write transaction
            contract.registerAirline(registrarAirlineAddress, newAirlineAddress, newAirlineName, (error, result) => {
                console.log("register", error, result);
                contract.numRegisteredAirlines((error, result) => {
                    console.log(error,result);
                    DOM.elid("numAirlines").innerText = result;
                });
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







