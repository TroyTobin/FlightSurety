pragma solidity >=0.4.24;

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;


    /********************************************************************************************/
    /*                                         CONSTANTS                                        */
    /********************************************************************************************/
    // define the amount an airline must fund before it can participate in the contract
    uint256 private constant AIRLINE_MINUMIM_FUNDING = 10 ether;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    mapping(address => uint256) private authorizedContracts;

    /********************************************************************************************/
    /*                                       DATA STRUCTURES                                    */
    /********************************************************************************************/
    
    // Airlines
    struct Airline {
        bool isRegistered;
        string name;
        uint   updatedTimestamp;
        uint256 funding;
        uint256 registrationVotes;
        mapping(address => bool) voters;
    }
    mapping(address => Airline) private airlines;

    uint256 private registeredAirlines = 0;

    // Flights
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    uint256 private registeredFlights = 0;

    // Insurance
    struct Insurance {
        address airline;
        bytes32 flightCode;
        uint256 insurance;

    }

    // Tracks a passengers set of insurances
    mapping(address => Insurance[]) private insurancePolicies;

    uint256 private registeredInsurance = 0;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor()
    {
        contractOwner = msg.sender;
    }

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
        require(operational, "Contract is currently not operational");
        _;
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
    * @dev Modifier that requires an authorized contract to be the function caller
    */
    modifier requireAuthorizedContract()
    {
        require(authorizedContracts[msg.sender] == 1, "Caller is not authorized contract");
        _;
    }

    /**
    * @dev Modifier that requires there to be no airlines registered
    *
    */
    modifier requireZeroRegisteredAirlines()
    {
        require(numRegisteredAirlines() == 0, "There are > 0 airlines registered already");
        _;
    }

    /**
    * @dev Modifier that requires a voting airline has not yet voted
    *
    */
    modifier requireVoterNotVoted(address airline, address voter)
    {
        require(airlines[airline].voters[voter] == false, "Airline has already voted");
        _;
    }


    modifier requireFlightRegistered(bytes32 flightCode)
    {
        require(flights[flightCode].isRegistered == true, "Flight is not registered");
        _;
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() public 
                             view 
                             returns(bool)
    {
        return operational;
    }


    /**
    * @dev Determine if the specified address is that of a registered airline
    *
    * @return A bool that indicates if the address is an airline
    */      
    function isAirline(address a) public 
                                  view 
                                  returns(bool)
    {
        if ((airlines[a].isRegistered == true) &&
            (bytes(airlines[a].name).length != 0))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    /**
    * @dev Determine if the specified airline is funded
    *
    * @return A bool that indicates if the airline is funded
    */
    function isAirlineFunded(address a) public
                                        view
                                        returns(bool)
    {
        return airlines[a].funding >= AIRLINE_MINUMIM_FUNDING;
    }

    /**
    * @dev Determine the specified airlines name
    *
    * @return string
    */
    function airlineName(address a) public
                                    view
                                    returns(string memory)
    {
        return airlines[a].name;
    }





    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus(bool mode) external
        requireContractOwner()
    {
        operational = mode;
    }

    function authorizeContract(address contractAddress) external
        requireContractOwner()
    {
        authorizedContracts[contractAddress] = 1;
    }

    function deauthorizeContract(address contractAddress) external
        requireContractOwner()
    {
        delete authorizedContracts[contractAddress];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add the first airline
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerFirstAirline(address firstAirline, string memory firstAirlineName) external
                                                                                        requireAuthorizedContract()
                                                                                        requireZeroRegisteredAirlines()
                                                                                        returns (bool success)

    {
        Airline storage a = airlines[firstAirline];
        a.isRegistered = true;
        a.name = firstAirlineName;
        a.updatedTimestamp = block.timestamp;
        a.funding = 0 ether;
        a.registrationVotes = 0;

        registeredAirlines++;

        return true;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address newAirline, string memory name) external
                                                                     requireAuthorizedContract()
                                                                     returns (bool success)
    {
        Airline storage a = airlines[newAirline];
        a.isRegistered = true;
        a.name = name;
        a.updatedTimestamp = block.timestamp;
        a.funding = 0 ether;
        a.registrationVotes = 0;

        registeredAirlines++;

        return true;
    }


   /**
    * @dev Fund an airline - which is required before it participate in contract 
    *
    */
    function fundAirline(address payable airline, uint256 value) external
                                                                 payable
    {
        Airline storage a = airlines[airline];
        a.funding += value;
    }



   /**
    * @dev Fund an airline - which is required before it participate in contract 
    *
    */
    function airlineFunding(address airline) external
                                             view
                                             returns (uint256)
    {
        Airline storage a = airlines[airline];
        return a.funding;
    }

   /**
    * @dev Return the number of registered airlines
    *
    */
    function numRegisteredAirlines() public
                                     view
                                     returns(uint256)
    {
        return registeredAirlines;
    }


    /**
     * @dev Register a vote to to support registration of an airline
     *
     * Only registered and funded airlines can vote in support of registering another airline
     */
     function voteToRegisterAirline(address newAirline, address voter) external
                                                                       requireAuthorizedContract()
                                                                       requireVoterNotVoted(newAirline, voter)
                                                     
     {   
        Airline storage a = airlines[newAirline];
        a.registrationVotes += 1;
        a.voters[voter] = true;

     }

   /**
    * @dev Return the number of votes supporting airline registration
    *
    */
    function votesSupportingAirlineRegistration(address newAirline) external
                                                                    view
                                                                    returns(uint256)
    {

        Airline storage a = airlines[newAirline];
        return a.registrationVotes;
    }


    /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerFlight(bytes32 flightCode, uint8 status, address airline) external
                                                                               requireAuthorizedContract()
                                                                               returns (bool success)
    {
        Flight storage f = flights[flightCode];

        if (f.isRegistered == true)
        {
            // already registered
            return false;
        }

        f.isRegistered = true;
        f.statusCode = status;
        f.airline = airline;
        f.updatedTimestamp = block.timestamp;

        registeredFlights++;

        return true;
    }


    /**
    * @dev Function to determine if the specified flight is
    *      registered agains the airline
    *
    */
    function isFlightRegistered(address airline, bytes32 flightCode) external
                                                                     view
                                                                     returns(bool)
    {
        Flight storage f = flights[flightCode];
        return (f.airline == airline);
    }


    /**
    * @dev Update the flight status of the indicated flight
    */
    function updateFlightStatus(bytes32 flightCode, uint8 status, uint256 timestamp) external
                                                                                     requireAuthorizedContract()
                                                                                     requireFlightRegistered(flightCode)
    {
        Flight storage f = flights[flightCode];
        f.statusCode = status;
        f.updatedTimestamp = timestamp;
    }

    /**
    * @dev Get the flight status of the indicated flight
    */
    function getFlightStatus(bytes32 flightCode) external
                                                 view
                                                 requireAuthorizedContract()
                                                 requireFlightRegistered(flightCode)
                                                 returns (uint8)
    {
        Flight storage f = flights[flightCode];
        return f.statusCode;
    }



    /**
    * @dev Get the airline that is running the indicated flight
    */
    function getFlightAirline(bytes32 flightCode) external
                                                  view
                                                  requireAuthorizedContract()
                                                  requireFlightRegistered(flightCode)
                                                  returns (address)
    {
        Flight storage f = flights[flightCode];
        return f.airline;
    }


   /**
    * @dev Return the number of registered airlines
    *
    */
    function numRegisteredFlights() public
                                    view
                                    returns(uint256)
    {
        return registeredFlights;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy(address airline, string memory airlineName, bytes32 flightCode, 
                 address passenger, uint256 value) external
                                                   payable
                                                   requireAuthorizedContract()
                                                   requireFlightRegistered(flightCode)
    {
        Insurance[] storage i = insurancePolicies[passenger];
        i.push(Insurance(airline, flightCode, value));

        registeredInsurance += 1;
    }

    /**
    * @dev Return the number of registered insurance policies on the contract
    *
    */
    function numRegisteredInsurancePolicies() public
                                              view
                                              returns(uint256)
    {
        return registeredInsurance;
    }


    /**
    * @dev Return the number of registered insurance policies for a passenger
    *
    */
    function numRegisteredInsurancePoliciesForPassenger(address passenger) public
                                                                           view
                                                                           returns(uint256)
    {
        Insurance[] storage i = insurancePolicies[passenger];
        return i.length;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    receive() external payable 
    {
        fund();
    }


}

