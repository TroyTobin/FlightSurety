const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer) {

    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    let firstAirlineName = 'Numero Uno Airways';
    deployer.deploy(FlightSuretyData).then(function(dataInstance) {
        return deployer.deploy(FlightSuretyApp, dataInstance.address)
                .then(async function(appInstance) {
                    let config = {
                        localhost: {
                            url: 'http://localhost:8545',
                            dataAddress: dataInstance.address,
                            appAddress: appInstance.address
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');

                    // Register the first airline
                    await dataInstance.authorizeContract(appInstance.address);
                    await appInstance.registerFirstAirline(firstAirline, firstAirlineName);

                    // Force the airline to provide funding
                    let funding = web3.utils.toWei(web3.utils.toBN(10), "ether")
                    await appInstance.fundAirline({from:firstAirline, value:funding});
                });
    });
}