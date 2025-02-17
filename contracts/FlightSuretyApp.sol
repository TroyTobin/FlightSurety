pragma solidity >=0.4.24;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                         CONSTANTS                                        */
    /********************************************************************************************/
    // define the number of airlines that can be registered before
    // voting must occur
    uint8 private constant NUM_AIRLINES_BEFORE_VOTE = 4;
    uint8 private constant PERCENTAGE_AIRLINES_CONCENSUS = 50;


    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codes
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner;          // Account used to deploy contract


    /********************************************************************************************/
    /*                                       DATA Contract                                      */
    /********************************************************************************************/
    FlightSuretyData dataContract;

    /********************************************************************************************/
    /*                                       Events                                             */
    /********************************************************************************************/
    event RegisterAirlineSuccess(address airline);
    event RegisterAirlineFailure(address airline);

    event RegisterFlightSuccess(bytes32 flightCode, address airline);
    event RegisterFlightFailure(bytes32 flightCode, address airline);

    event processedFlightStatus(bytes32 flightCode, address airline, uint8 flightstatus);
    event crediting(address airline,bytes32 flightCode);
 
    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");  
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
    * @dev Modifier that requires an airline be registered
    *
    */
    modifier requireAirlineNotRegistered(address airline)
    {
        require(dataContract.isAirline(airline) == false, "Airline is already registered");
        _;
    }

    /**
    * @dev Modifier that requires an airline be registered
    *
    */
    modifier requireAirlineIsRegistered(address airline)
    {
        require(dataContract.isAirline(airline), "Airline is not registered");
        _;
    }

    /**
    * @dev Modifier that requires an airline is funded
    *
    */
    modifier requireAirlineIsFunded(address airline)
    {
        require(dataContract.isAirlineFunded(airline), "Airline is not funded");
        _;
    }


    /**
    * @dev Modifier that requires the airline is the caller
    *
    */
    modifier requireAirlineIsCaller(address airline)
    {
        require(msg.sender == airline, "Airline is not the caller");
        _;
    }


    /**
    * @dev Modifier that requires the flight to be registered against the airline
    *
    */
    modifier requireFlightIsRegistered(address airline, bytes32 flight)
    {
        require(dataContract.isFlightRegistered(airline, flight), "Flight is not registered");
        _;
    }

    /**
    * @dev Modifier that ensure there is a cap on insurance purchases
    *
    */
    modifier requireWithinInsuranceLimit(uint256 value)
    {
        require(value < 1 ether, "Insurance value exceeds limit of 1 ether");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor(address payable dataContractAddress) 
    {
        dataContract = FlightSuretyData(dataContractAddress);
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public 
                             view
                             returns(bool) 
    {
        return dataContract.isOperational();
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/
   /**
    * @dev Add an airline to the registration queue
    *
    */   
    function registerFirstAirline(address newAirline, string memory name) external
                                                                          returns(bool success)
    {
        return dataContract.registerFirstAirline(newAirline, name);
    }

    /**
     * @dev Return the number of airlines registered
     *
     */
     function numRegisteredAirlines() external
                                      view
                                      returns (uint256)
    {
        return dataContract.numRegisteredAirlines();
                                          
    }
  
   /**
    * @dev Add an airline to the registration queue
    * 
    * Only registered and funded airlines can register another
    */   
    function registerAirline(address newAirline, string memory name) external
                                                                     requireAirlineNotRegistered(newAirline)
                                                                     requireAirlineIsRegistered(msg.sender)
                                                                     requireAirlineIsFunded(msg.sender)
                                                                     returns(bool success)
    {
        success = false;
        uint256 votes = 0;
        bool register = false;

        // If there are less than a set amount of airlines registered
        // simply add
        // Otherwise we need to get a consensus amongst all
        // currently registered airlines to proceed
        uint256 numAirlines = dataContract.numRegisteredAirlines();
        if (numAirlines <= NUM_AIRLINES_BEFORE_VOTE)
        {
            register = true;
        }
        else
        {
            votes = dataContract.votesSupportingAirlineRegistration(newAirline);
            // Get the votes amongst the registered airlines for the given airline
            if (SafeMath.div(SafeMath.mul(100, votes), numAirlines) >= PERCENTAGE_AIRLINES_CONCENSUS)
            {
              register = true;  
            }
        }

        // Airline is good to be registered
        if (register)
        {
            success = dataContract.registerAirline(newAirline, name);
        }

        if (success == true)
        {
            emit RegisterAirlineSuccess(newAirline);
        }
        else
        {
            emit RegisterAirlineFailure(newAirline);
        }

        return success;
    }

    /**
     * @dev Return the number of votes supporting registration of the airline
     *
     * Only registered and funded airlines can vote in support of registering another airline
     */
     function votesSupportingAirlineRegistration(address airline) external
                                                                  view
                                                                  requireAirlineIsCaller(airline)
                                                                  returns(uint256)

     {
        return dataContract.votesSupportingAirlineRegistration(airline);

     }

    /**
     * @dev Register a vote to to support registration of an airlin
     *
     * Only registered and funded airlines can vote in support of registering another airline
     */
     function voteToRegisterAirline(address newAirline) external
                                                        requireAirlineIsRegistered(msg.sender)
                                                        requireAirlineIsFunded(msg.sender)
                                                     
     {
         dataContract.voteToRegisterAirline(newAirline, msg.sender);

     }


   /**
    * @dev Get airline finding 
    *
    */
    function airlineFunding(address payable airline) external
                                                     view
                                                     requireAirlineIsCaller(airline)
                                                     returns (uint256)
    {
        return dataContract.airlineFunding(airline);
    }

   /**
    * @dev Fund an airline - which is required before it participate in contract 
    *
    */
    function fundAirline() external
                           payable
                           requireAirlineIsRegistered(msg.sender)
    {
        dataContract.fundAirline(payable(msg.sender), msg.value);
    }


    /**
     * @dev Check if the airline is funded and rengistered
     */
    function isAirlineRegisteredAndFunded(address airlineAddress) external
                                                                  view
                                                                  returns (bool)
    {
        return (dataContract.isAirlineFunded(airlineAddress) && dataContract.isAirline(airlineAddress));
    }

    /**
     * @dev Return the number of airlines registered
     *
     */
     function numRegisteredFlights() external
                                     view
                                     returns (uint256)
    {
        return dataContract.numRegisteredFlights();
                                          
    }

   /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight(bytes32 flightCode, uint8 status) external
                                                              requireAirlineIsRegistered(msg.sender)
                                                              requireAirlineIsFunded(msg.sender)
                                                              returns (bool success)
    {
        success = dataContract.registerFlight(flightCode, status, msg.sender);

        if (success == true)
        {
            emit RegisterFlightSuccess(flightCode, msg.sender);
        }
        else
        {
            emit RegisterFlightFailure(flightCode, msg.sender);
        }

        return success;
    }

    

    /**
     * @dev Return the number of airlineflight status
     *
     */
     function getFlightStatus(bytes32 flightCode) external
                                                  view
                                                  returns (uint8)
    {
        return dataContract.getFlightStatus(flightCode);                       
    }

    /**
    * @dev Get the airline that is running the indicated flight
    */
    function getFlightAirline(bytes32 flightCode) external
                                                  view
                                                  returns (address)
    {
        return dataContract.getFlightAirline(flightCode);   
    }
    
   /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus(address airline,
                                 bytes32 flight,
                                 uint256 timestamp,
                                 uint8 statusCode) internal
    {
        if (dataContract.updateFlightStatus(flight, statusCode, timestamp))
        {
            emit processedFlightStatus(flight, airline, statusCode);

            // If the status is one that indicates delay due to airline
            // fault the insurance policies need to be paid out
            // i.e. STATUS_CODE_LATE_AIRLINE
            if (statusCode == STATUS_CODE_LATE_AIRLINE)
            {

                emit crediting(airline, flight);
                dataContract.creditInsurees(airline, flight);
            }
        }
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(address airline,
                               bytes32 flight,
                               uint256 timestamp) external
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        ResponseInfo storage r = oracleResponses[key];
        r.requester = msg.sender;
        r.isOpen = true;

        emit OracleRequest(index, airline, flight, timestamp);
    } 


    // region PASSENGER TRANSACTIONS
    // Purchase flight insurance
    function purchaseFlightInsurance(address airline,
                                     string memory airlineName,
                                     bytes32 flight) external
                                                     payable
                                                     requireAirlineIsRegistered(airline)
                                                     requireFlightIsRegistered(airline, flight)
                                                     requireWithinInsuranceLimit(msg.value)
    {
        dataContract.buy(airline, airlineName, flight, msg.sender, msg.value);
    }

    function numRegisteredInsurancePolicies() external
                                              view
                                              returns(uint256)
    {
        return dataContract.numRegisteredInsurancePolicies();
    }

    function numRegisteredInsurancePoliciesForPassenger(address passenger) external
                                                                           view
                                                                           returns(uint256)
    {
        return dataContract.numRegisteredInsurancePoliciesForPassenger(passenger);
    }

    function insurancePoliciesForPassengerAirline(address passenger, uint256 policyNumber) external
                                                                                           view
                                                                                           returns(address)
    {
        return dataContract.insurancePoliciesForPassengerAirline(passenger, policyNumber);
    }

    function insurancePoliciesForPassengerFlightName(address passenger, uint256 policyNumber) external
                                                                                              view
                                                                                              returns(bytes32)
    {
        return dataContract.insurancePoliciesForPassengerFlightName(passenger, policyNumber);
    }

    function insurancePoliciesForPassengerInsuranceAmount(address passenger, uint256 policyNumber) external
                                                                                           view
                                                                                           returns(uint256)
    {
        return dataContract.insurancePoliciesForPassengerInsuranceAmount(passenger, policyNumber);
    }

    function insurancePoliciesForPassengerCreditAmount(address passenger, uint256 policyNumber) external
                                                                                                view
                                                                                                returns(uint256)
    {
        return dataContract.insurancePoliciesForPassengerCreditAmount(passenger, policyNumber);
    }

    // withdraw flight insurance
    function withdrawFlightInsurance(address passenger,
                                     address airline,
                                     bytes32 flight,
                                     uint256 amount) external
                                                     payable
                                                     requireAirlineIsRegistered(airline)
                                                     requireFlightIsRegistered(airline, flight)
    {  
        dataContract.pay{value: amount}(passenger, airline, flight, amount);
    }


    // region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    bytes32 numResponses;
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, bytes32 flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, bytes32 flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint256 index, address airline, bytes32 flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle() external
                              payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        Oracle storage o = oracles[msg.sender];
        o.indexes = indexes;
        o.isRegistered = true;
    }

    function getMyIndexes () view
                             external
                             returns(uint8[3] memory)
    {

        Oracle storage o = oracles[msg.sender];
        require(o.isRegistered, "Not registered as an oracle");

        return o.indexes;
    }


    function oracleIndexMatches(address oracleAddress, uint8 index) view
                                                                    public
                                                                    returns (bool ret)
    {
        ret = ((oracles[oracleAddress].indexes[0] == index) || 
               (oracles[oracleAddress].indexes[1] == index) || 
               (oracles[oracleAddress].indexes[2] == index));

        return ret;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(uint8 index,
                                  address airline,
                                  bytes32 flight,
                                  uint256 timestamp,
                                  uint8 statusCode) external
    {
        require(oracleIndexMatches(msg.sender, index), "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }


    function getFlightKey(address airline,
                          string memory flight,
                          uint256 timestamp) pure
                                             internal
                                             returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account) internal
                                              returns(uint8[3] memory)
    {
        uint8[3] memory indexes;
        unchecked {indexes[0] = getRandomIndex(account);}
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
           indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account) internal
                                             returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        unchecked {uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random; }
    }

// endregion

}   


// Interface for data contract (separation of data)
interface FlightSuretyData {

    function isOperational() external
                             view
                             returns(bool);

    function registerFirstAirline(address firstAirline, string memory firstAirlineName) external
                                                                                        returns (bool success);

    function registerAirline(address newAirline, string memory name) external
                                                                     returns (bool success);

    function fundAirline(address payable airline, uint256 value) external
                                                                 payable;

    function airlineFunding(address airline) external
                                             view
                                             returns (uint256);

    function isAirline(address a) external 
                                  view 
                                  returns(bool);
                                      
    function isAirlineFunded(address a) external
                                        view
                                        returns(bool);

    function numRegisteredAirlines() external
                                     view
                                     returns(uint256);
    
    function votesSupportingAirlineRegistration(address airline) external
                                                                    view
                                                                    returns(uint256);
    
    function voteToRegisterAirline(address newAirline, address voter) external;
    
    function registerFlight(bytes32 flightCode, uint8 status, address airline) external
                                                                               returns (bool success);
    
    function isFlightRegistered(address airline, bytes32 flightCode) external
                                                                     view
                                                                     returns(bool);
    function numRegisteredFlights() external
                                    view
                                    returns(uint256);
    function updateFlightStatus(bytes32 flightCode, uint8 status, uint256 timestamp) external
                                                                                     returns (bool);
           
    function getFlightStatus(bytes32 flightCode) external
                                                 view
                                                 returns (uint8);

    function getFlightAirline(bytes32 flightCode) external
                                                  view
                                                  returns (address);

    function buy(address airline, string memory airlineName, bytes32 flightCode,
                 address passenger, uint256 value) external
                                                   payable;

    function numRegisteredInsurancePolicies() external
                                              view
                                              returns(uint256);

    function numRegisteredInsurancePoliciesForPassenger(address passenger) external
                                                                           view
                                                                           returns(uint256);

    function insurancePoliciesForPassengerAirline(address passenger, uint256 policyNumber) external
                                                                                           view
                                                                                           returns(address);   
 
    function insurancePoliciesForPassengerFlightName(address passenger, uint256 policyNumber) external
                                                                                              view
                                                                                              returns(bytes32);
   
    
    function insurancePoliciesForPassengerInsuranceAmount(address passenger, uint256 policyNumber) external
                                                                                                   view
                                                                                                   returns(uint256);
    
    function insurancePoliciesForPassengerCreditAmount(address passenger, uint256 policyNumber) external
                                                                                                view
                                                                                                returns(uint256);
    
    function creditInsurees(address airline, bytes32 flightCode) external;

    function pay(address passenger, address airline, bytes32 flightCode, uint256 amount) external
                                                                                         payable;

    function fund() external
                    payable;

}