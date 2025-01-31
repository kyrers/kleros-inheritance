import hre, { ethers } from "hardhat";
import InheritanceModule from "../ignition/modules/InheritanceModule";

async function main() {
  const [owner, heir] = await ethers.getSigners();
  console.log("OWNER:", owner.address);
  console.log("HEIR:", heir.address);

  const { inheritance } = await hre.ignition.deploy(InheritanceModule, {
    parameters: {
      InheritanceModule: { heir: heir.address },
    },
  });

  console.log("Inheritance deployed to:", inheritance.target.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
