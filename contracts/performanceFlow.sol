//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.13;

import "hardhat/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISuperfluid, ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

interface OptimisticOracleInterface {
    function requestPrice(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        IERC20 currency,
        uint256 reward
    ) external returns (uint256 totalBond);

    function setCustomLiveness(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        uint256 customLiveness
    ) external;

    function setBond(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        uint256 bond
    ) external returns (uint256 totalBond);

    function proposePriceFor(
        address proposer,
        address requester,
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        int256 proposedPrice
    ) external returns (uint256 totalBond);
}

contract PerformanceFlow {
    address public owner;
    address public receiver;
    bytes query = "q:Did serivce provider perform?";
    uint currentRequestTime;

    using CFAv1Library for CFAv1Library.InitData;
    CFAv1Library.InitData public cfaV1; //initialize cfaV1 variable

    OptimisticOracleInterface oracle = OptimisticOracleInterface(0xB1d3A89333BBC3F5e98A991d6d4C1910802986BC); 

    ISuperToken public fDAIx = ISuperToken(0xe3CB950Cb164a31C66e32c320A800D477019DCFF);
    
    event performanceMet(uint timestamp);
    event performanceBroken(uint timestamp);

    constructor(ISuperfluid host, address _receiver) {
        assert(address(host) != address(0));
        owner = msg.sender;
        receiver = _receiver;
     
        cfaV1 = CFAv1Library.InitData(
        host,
        IConstantFlowAgreementV1(
            address(host.getAgreementClass(
                    keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")
                ))
            )
        );
    }

    function createFlow(uint _deposit, int96 _flowRate) external payable {
        require(msg.sender == owner, "must be authorized");
        //send lump sum to contract - requires pre approval from EOA
        fDAIx.transferFrom(msg.sender, address(this), _deposit);
        //create flow from contract
        cfaV1.createFlow(receiver, fDAIx, _flowRate);
    }

    function proposeTermination(uint bondAmount) public {
        require(msg.sender == owner, "must be authorized");
        currentRequestTime = block.timestamp;

        //request price
        oracle.requestPrice("YES_OR_NO_QUERY", currentRequestTime, query, fDAIx, 0);
        //setCustomLiveness period
        oracle.setCustomLiveness("YES_OR_NO_QUERY", currentRequestTime, query, 2);
        //calculate current bond
        uint256 totalBond = oracle.setBond("YES_OR_NO_QUERY", currentRequestTime, query, bondAmount);
        //approve oracle to transfer bond amount from contract
        fDAIx.approve(address(oracle), totalBond);
        //propose price for query
        oracle.proposePriceFor(msg.sender, address(this), "YES_OR_NO_QUERY", currentRequestTime, query, 0);
    }
        //externally called settle function will call this when price is settled
    function priceSettled(
        bytes32 identifier,
        uint256 timestamp,
        bytes memory ancillaryData,
        int256 price
    ) external
    {
        if (price == 0) {
            //delete flow
            cfaV1.deleteFlow(address(this), receiver, fDAIx);
            //withdraw all funds
            fDAIx.transfer(owner, fDAIx.balanceOf(address(this)));
            emit performanceBroken(block.timestamp);
        } else {
            emit performanceMet(block.timestamp);
        }
    }
}
