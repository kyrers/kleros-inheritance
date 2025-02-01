import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployInheritanceFixture } from "../utils/fixtures";
import { ethers } from "hardhat";

describe("# SET HEIR #", function () {
  it("Should allow owner to set new heir", async function () {
    const [_, __, newHeir] = await ethers.getSigners();
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await expect(inheritance.setHeir(newHeir.address))
      .to.emit(inheritance, "HeirUpdated")
      .withArgs(newHeir.address);

    expect(await inheritance.heir()).to.equal(newHeir.address);
  });

  it("Should revert if non-owner tries to set heir", async function () {
    const [_, heir, newHeir] = await ethers.getSigners();
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await expect(inheritance.connect(heir).setHeir(newHeir.address))
      .to.be.revertedWithCustomError(inheritance, "OwnableUnauthorizedAccount")
      .withArgs(heir.address);
  });

  it("Should revert if new heir is address zero", async function () {
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await expect(
      inheritance.setHeir(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(inheritance, "InvalidHeir");
  });

  it("Should revert if new heir is the owner", async function () {
    const { inheritance, owner } = await loadFixture(deployInheritanceFixture);

    await expect(
      inheritance.setHeir(owner.address)
    ).to.be.revertedWithCustomError(inheritance, "InvalidHeir");
  });
});
