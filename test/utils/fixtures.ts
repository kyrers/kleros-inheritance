import { ethers } from "hardhat";

export async function deployInheritanceFixture() {
  const [owner, heir] = await ethers.getSigners();

  const factory = await ethers.getContractFactory("Inheritance");
  const inheritance = await factory.deploy(heir.address);
  const deployTx = inheritance.deploymentTransaction();

  if (!deployTx || !deployTx.blockNumber) {
    throw new Error("No deployment tx or block number available");
  }

  const block = await ethers.provider.getBlock(deployTx.blockNumber);
  const deployTxReceipt = await ethers.provider.getTransactionReceipt(
    deployTx.hash
  );

  if (!deployTxReceipt || !block) {
    throw new Error("No deployment tx receipt or block available");
  }

  return {
    inheritance,
    deployTx,
    deployTxReceipt,
    block,
    owner,
    heir,
  };
}
