import hre, { ethers } from "hardhat";
import InheritanceModule from "../ignition/modules/InheritanceModule";

async function main() {
  const [owner, heir] = await ethers.getSigners();
  console.log("OWNER:", owner.address);
  console.log("HEIR:", heir.address);

  const { inheritance } = await hre.ignition.deploy(InheritanceModule, {
    parameters: {
      InheritanceModule: {
        heir: heir.address,
        value: ethers.parseEther("0.01"),
      },
    },
  });
  console.log("Inheritance deployed to:", inheritance.target.toString());

  try {
    await hre.run("verify:verify", {
      address: inheritance.target,
      constructorArguments: [heir.address],
    });
    console.log("## Contract verified successfully");
  } catch (error) {
    console.log("## Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
