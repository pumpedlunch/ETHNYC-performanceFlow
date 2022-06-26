const hre = require("hardhat");
const { Framework } = require("@superfluid-finance/sdk-core");
require("dotenv").config();

async function main() {
  const receiver = "0x64e89807E4C2c006202834404FDb40C6F13a4279";

  const provider = new hre.ethers.providers.JsonRpcProvider(process.env.KOVAN_URL);

  const sf = await Framework.create({
    chainId: (await provider.getNetwork()).chainId,
    provider,
    customSubgraphQueriesEndpoint: "",
    dataMode: "WEB3_ONLY"
  });

  const signers = await hre.ethers.getSigners();

  // We get the contract to deploy
  const PerformanceFlow = await hre.ethers.getContractFactory("PerformanceFlow");
  
  //deploy the money router account using the proper host address and the address of the first signer
  const performanceFlow = await PerformanceFlow.deploy(sf.settings.config.hostAddress, receiver);
  await performanceFlow.deployed();

  console.log("New PerformanceFlow Contract deployed to:", performanceFlow.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
