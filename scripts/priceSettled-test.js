const hre = require("hardhat");
const { Framework } = require("@superfluid-finance/sdk-core");
const { ethers } = require("hardhat");
require("dotenv").config();
const PerformanceFlowABI =
  require("../artifacts/contracts/PerformanceFlow.sol/PerformanceFlow.json").abi;

async function main() {
  const BOND = ethers.utils.parseEther("10");

  const performanceFlowAddress = process.env.PERFORMANCE_FLOW_ADDRESS;

  const provider = new hre.ethers.providers.JsonRpcProvider(
    process.env.MUMBAI_URL
  );

  const signers = await hre.ethers.getSigners();

  const performanceFlow = new ethers.Contract(
    performanceFlowAddress,
    PerformanceFlowABI,
    provider
  );

  const tx1 = await performanceFlow
    .connect(signers[0])
    .priceSettled(
      "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
      0,
      "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
      0
    )
    .then(function (tx) {
      console.log(`
        Price Settled - Tx Hash: ${tx.hash}
    `);
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
