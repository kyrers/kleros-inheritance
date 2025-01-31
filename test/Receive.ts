import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployInheritanceFixture } from "./utils/fixtures";
import { ethers } from "hardhat";

describe("# RECEIVING #", function () {
  it("Should accept ETH from anyone", async function () {
    const [_, __, sender] = await ethers.getSigners();
    const { inheritance } = await loadFixture(deployInheritanceFixture);
    const value = ethers.parseEther("1");

    await expect(
      sender.sendTransaction({
        to: inheritance.target,
        value: value,
      })
    ).to.not.be.reverted;

    expect(await ethers.provider.getBalance(inheritance.target)).to.equal(
      value
    );
  });

  it("Should accumulate ETH correctly", async function () {
    const [owner, heir] = await ethers.getSigners();
    const { inheritance } = await loadFixture(deployInheritanceFixture);
    const value = ethers.parseEther("1");

    await owner.sendTransaction({
      to: inheritance.target,
      value: value,
    });

    await heir.sendTransaction({
      to: inheritance.target,
      value: value,
    });

    expect(await ethers.provider.getBalance(inheritance.target)).to.equal(
      value * 2n
    );
  });
});
