import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployInheritanceFixture } from "../utils/fixtures";
import { ethers } from "hardhat";
import { depositEth } from "../utils/helpers";

describe("# RECEIVING #", function () {
  it("Should accept ETH from anyone", async function () {
    const [_, __, sender] = await ethers.getSigners();
    const { inheritance } = await loadFixture(deployInheritanceFixture);
    const value = ethers.parseEther("1");

    await expect(
      depositEth({
        account: sender,
        to: inheritance.target,
        amount: value,
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

    await depositEth({
      account: owner,
      to: inheritance.target,
      amount: value,
    });
    await depositEth({
      account: heir,
      to: inheritance.target,
      amount: value,
    });

    expect(await ethers.provider.getBalance(inheritance.target)).to.equal(
      value * 2n
    );
  });
});
