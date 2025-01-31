import { ethers } from "hardhat";

export async function deployInheritanceFixture() {
  const [owner, heir] = await ethers.getSigners();

  const factory = await ethers.getContractFactory("Inheritance");
  const inheritance = await factory.deploy(heir.address);

  return {
    inheritance,
    deployTx: inheritance.deploymentTransaction(),
    owner,
    heir,
  };
}
