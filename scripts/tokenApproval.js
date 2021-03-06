const hre = require("hardhat");
const { Framework } = require("@superfluid-finance/sdk-core");
const { ethers } = require("hardhat");
require("dotenv").config();
const PerformanceFlowABI = require("../artifacts/contracts/PerformanceFlow.sol/PerformanceFlow.json").abi;

async function main() {

  const performanceFlowAddress = process.env.PERFORMANCE_FLOW_ADDRESS;

  const provider = new hre.ethers.providers.JsonRpcProvider(process.env.KOVAN_URL);

  const sf = await Framework.create({
    chainId: (await provider.getNetwork()).chainId,
    provider,
    customSubgraphQueriesEndpoint: "",
    dataMode: "WEB3_ONLY"
  });

  const signers = await hre.ethers.getSigners();

  const performanceFlow = new ethers.Contract(performanceFlowAddress, PerformanceFlowABI, provider);

  const daix = await sf.loadSuperToken("fDAIx");

  //approve contract to spend 1000 daix
  const performanceFlowApproval = daix.approve({
      receiver: performanceFlow.address,
      amount: ethers.utils.parseEther("1000")
  });

  await performanceFlowApproval.exec(signers[0]).then(function (tx) {
    console.log(`
        Owner has approved the PerformanceFlow contract to withdraw fDAIx.
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
