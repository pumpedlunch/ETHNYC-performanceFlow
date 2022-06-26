const hre = require("hardhat");
const { Framework } = require("@superfluid-finance/sdk-core");
const { ethers } = require("hardhat");
require("dotenv").config();
const PerformanceFlowABI = require("../artifacts/contracts/PerformanceFlow.sol/PerformanceFlow.json").abi;

async function main() {

  const DEPOSIT = ethers.utils.parseEther("50");
  const FLOWRATE = "385802469135802";

  const performanceFlowAddress = process.env.PERFORMANCE_FLOW_ADDRESS;

  const provider = new hre.ethers.providers.JsonRpcProvider(process.env.KOVAN_URL);

  const signers = await hre.ethers.getSigners();

  const performanceFlow = new ethers.Contract(performanceFlowAddress, PerformanceFlowABI, provider);

  const tx1 = await performanceFlow.connect(signers[0]).createFlow(DEPOSIT, FLOWRATE).then(function (tx) {
    console.log(`
        fDAIx deposited to contract and flow to service provider created 
        Tx Hash: ${tx.hash}
    `)
  });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
