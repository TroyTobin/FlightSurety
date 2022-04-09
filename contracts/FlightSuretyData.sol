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
    struct Airline {
        bool isRegistered;
        string name;
        uint256 updatedTimestamp;
        uint256 funding;
    }
    mapping(address => Airline) private airlines;

    uint256 private registeredAirlines = 0;


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
        a.funding = value;
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
    * @dev Return the number of registered airlines
    *
    */
    function votesToRegisterAirline(address newAirline) external
                                                        pure
                                                        returns(uint256)
    {
        // noop
        newAirline;
        return (0);
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

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

