import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // Deploy Voting
  const votingDeployment = await deploy("Voting", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Optional init: start voting + allow deployer to vote
  const signer = await ethers.getSigner(deployer);
  const voting = await ethers.getContractAt("Voting", votingDeployment.address, signer);

  try {
    await (await voting.startVoting(["Alice", "Bob", "Charlie"])).wait();
  } catch {
    // ignore if already active / already initialized
  }

  try {
    await (await voting.allowVoter(deployer)).wait();
  } catch {
    // ignore if already allowed
  }
};

export default func;
func.tags = ["Voting"];
