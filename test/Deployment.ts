import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployInheritanceFixture } from "./utils/fixtures";
import { ethers } from "hardhat";

describe("# DEPLOYMENT #", function () {
  it("Should deploy the contract with the right owner and heir addresses", async function () {
    const { owner, heir, inheritance } = await loadFixture(
      deployInheritanceFixture
    );

    expect(await inheritance.owner()).to.equal(owner.address);
    expect(await inheritance.heir()).to.equal(heir.address);
  });

  it("Should emit HeirUpdated event", async function () {
    const { inheritance, deployTx, heir } = await loadFixture(
      deployInheritanceFixture
    );

    await expect(deployTx)
      .to.emit(inheritance, "HeirUpdated")
      .withArgs(heir.address);
  });

  it("Should set lastAction to block timestamp", async function () {
    const { inheritance, deployTx } = await loadFixture(
      deployInheritanceFixture
    );

    if (!deployTx || !deployTx.blockNumber) {
      throw new Error("No deployment tx or block number available");
    }

    const block = await ethers.provider.getBlock(deployTx.blockNumber);

    expect(await inheritance.lastAction()).to.equal(block?.timestamp);
  });

  it("Should accept ETH during deployment", async function () {
    const [_, heir] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("Inheritance");
    const value = ethers.parseEther("1");

    const inheritance = await factory.deploy(heir.address, {
      value: value,
    });

    expect(await ethers.provider.getBalance(inheritance.target)).to.equal(
      value
    );
  });

  it("Should revert if heir is address zero", async function () {
    const factory = await ethers.getContractFactory("Inheritance");

    await expect(
      factory.deploy(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(factory, "InvalidHeir");
  });

  it("Should revert if heir is the owner", async function () {
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("Inheritance");

    await expect(factory.deploy(owner.address)).to.be.revertedWithCustomError(
      factory,
      "InvalidHeir"
    );
  });
});
