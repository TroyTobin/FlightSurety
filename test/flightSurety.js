
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');
const assert = require('assert');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  beforeEach('setup contract', async () => {
    config = await Test.Config(accounts);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

    // Ensure that access is denied for non-Contract Owner account
    await truffleAssert.reverts(config.flightSuretyData.setOperatingStatus(false, {from: config.testAddresses[2]}));
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let status = await config.flightSuretyData.isOperational.call();
      assert.equal(status, true, "Initial operational status is incorrect");

      await config.flightSuretyData.setOperatingStatus(false);

      status = await config.flightSuretyData.isOperational.call();
      assert.equal(status, false, "Access to set operational status not provided to Contract Owner");
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // Try to register a new Airline
    let newAirline = accounts[2];

    // Should fail with revert as "requirement" is not met - first airline is not funded
    await truffleAssert.reverts(config.flightSuretyApp.registerAirline(newAirline, "airTest", {from: config.firstAirline}));

  });

  it('(airline) can register an Airline using registerAirline() if it is funded', async () => {
    
    // Try to register a new Airline
    let newAirline = accounts[2];

    // Fund the first airline
    let funding = web3.utils.toWei(web3.utils.toBN(10), "ether")
    await config.flightSuretyApp.fundAirline({from:config.firstAirline, value:funding});

    let numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 1, "First airline is not registered for some reason");      

    // Should succeed with "requirement" is now met for first airline - which is now funded
    await config.flightSuretyApp.registerAirline(newAirline, "airTest", {from: config.firstAirline});

    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 2, "Funded airline failed to register additional airline");  

  });

  it('(airline) can register upto 4 Airlines before voting is required', async () => {
    
    // Try to register a new Airline
    let newAirline1 = accounts[2];
    let newAirline2 = accounts[3];
    let newAirline3 = accounts[4];
    let newAirline4 = accounts[5];
    let newAirline5 = accounts[6];

    // Fund the first airline
    let funding = web3.utils.toWei(web3.utils.toBN(10), "ether")
    await config.flightSuretyApp.fundAirline({from:config.firstAirline, value:funding});

    let numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 1, "First airline is not registered for some reason");      

    // Should succeed as the first airline is funded and is able to register airlines until there are 5 in total
    // From FlightSuretyApp.sol:    uint8 private constant NUM_AIRLINES_BEFORE_VOTE = 4;
    await config.flightSuretyApp.registerAirline(newAirline1, "airTest_additional_1", {from: config.firstAirline});
    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 2, "Failed to register additional airline number 1 (number reported)");

    await config.flightSuretyApp.registerAirline(newAirline2, "airTest_additional_2", {from: config.firstAirline});
    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 3, "Failed to register additional airline number 2 (number reported)");

    await config.flightSuretyApp.registerAirline(newAirline3, "airTest_additional_3", {from: config.firstAirline});
    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 4, "Failed to register additional airline number 3 (number reported)");

    await config.flightSuretyApp.registerAirline(newAirline4, "airTest_additional_4", {from: config.firstAirline});
    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 5, "Failed to register additional airline number 4 (number reported)");

    // Any additional airlines need voting to succeed
    // Nothing is voted though, so should fail
    await config.flightSuretyApp.registerAirline(newAirline5, "airTest_additional_5", {from: config.firstAirline});
    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 5, "Registering additional airline number 5 should have failed since there has been no voting (number reported)");


    // Fund airlines and vote
    await config.flightSuretyApp.fundAirline({from:newAirline1, value:funding});
    await config.flightSuretyApp.fundAirline({from:newAirline2, value:funding});
    await config.flightSuretyApp.fundAirline({from:newAirline3, value:funding});
    await config.flightSuretyApp.fundAirline({from:newAirline4, value:funding});


    // Vote for new airline to be registered
    await config.flightSuretyApp.voteToRegisterAirline(newAirline5, {from: config.firstAirline});
    // Only 1 voted though, so should fail
    await config.flightSuretyApp.registerAirline(newAirline5, "airTest_additional_5", {from: config.firstAirline});
    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 5, "Registering additional airline number 5 should have failed since there has been only 1 vote (number reported)");

    await config.flightSuretyApp.voteToRegisterAirline(newAirline5, {from: newAirline1});
    // Only 2 voted though, so should fail
    await config.flightSuretyApp.registerAirline(newAirline5, "airTest_additional_5", {from: config.firstAirline});
    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 5, "Registering additional airline number 5 should have failed since there has been only 2 votes (number reported)");

    await config.flightSuretyApp.voteToRegisterAirline(newAirline5, {from: newAirline2});
    // 3 voted, so should pass
    await config.flightSuretyApp.registerAirline(newAirline5, "airTest_additional_5", {from: config.firstAirline});
    numAirlines = await config.flightSuretyData.numRegisteredAirlines();
    assert.equal(numAirlines, 6, "Registering additional airline number 5 should have succeeded since there has been 3 votes (>50%) (number reported)");


  });
});
