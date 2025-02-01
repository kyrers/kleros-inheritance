import { expect } from "chai";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployInheritanceFixture } from "../utils/fixtures";
import { ethers } from "hardhat";
import { depositEth } from "../utils/helpers";

const DAYS_31 = 31 * 24 * 60 * 60;

describe("# CLAIM INHERITANCE #", function () {
  it("Should successfully transfer ownership, emit events, and update state", async function () {
    const [_, __, newHeir] = await ethers.getSigners();
    const { inheritance, heir } = await loadFixture(deployInheritanceFixture);

    await time.increase(DAYS_31);
    const lastActionBefore = await inheritance.lastAction();

    await expect(inheritance.connect(heir).claimInheritance(newHeir.address))
      .to.emit(inheritance, "InheritanceClaimed")
      .withArgs(heir.address)
      .to.emit(inheritance, "HeirUpdated")
      .withArgs(newHeir.address);

    expect(await inheritance.owner()).to.equal(heir.address);
    expect(await inheritance.heir()).to.equal(newHeir.address);
    expect(await inheritance.lastAction()).to.be.greaterThan(lastActionBefore);
  });

  it("Should allow new owner to withdraw after successful claim", async function () {
    const [_, heir, newHeir] = await ethers.getSigners();
    const { inheritance, deployTxReceipt } = await loadFixture(
      deployInheritanceFixture
    );
    const value = ethers.parseEther("1.0");

    await depositEth({
      account: heir,
      to: inheritance.target,
      amount: value,
    });

    await time.increase(DAYS_31);
    await inheritance.connect(heir).claimInheritance(newHeir.address);

    const balanceBefore = await ethers.provider.getBalance(heir.address);
    await inheritance.connect(heir).withdraw(value);
    const balanceAfter = await ethers.provider.getBalance(heir.address);

    expect(balanceAfter).to.be.closeTo(
      balanceBefore + value,
      deployTxReceipt.fee
    );
  });

  it("Should revert if claiming before period", async function () {
    const [_, __, newHeir] = await ethers.getSigners();
    const { inheritance, heir } = await loadFixture(deployInheritanceFixture);

    await time.increase(29 * 24 * 60 * 60);

    await expect(
      inheritance.connect(heir).claimInheritance(newHeir.address)
    ).to.be.revertedWithCustomError(inheritance, "InheritancePeriodNotReached");
  });

  it("Should revert if claiming exactly after 30 days", async function () {
    const [_, __, newHeir] = await ethers.getSigners();
    const { inheritance, heir, block } = await loadFixture(
      deployInheritanceFixture
    );

    await time.setNextBlockTimestamp(block.timestamp + 30 * 24 * 60 * 60);
    await expect(
      inheritance.connect(heir).claimInheritance(newHeir.address)
    ).to.be.revertedWithCustomError(inheritance, "InheritancePeriodNotReached");
  });

  it("Should revert if someone other than the heir attempts to claim", async function () {
    const [_, __, newHeir] = await ethers.getSigners();
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await expect(
      inheritance.claimInheritance(newHeir.address)
    ).to.be.revertedWithCustomError(inheritance, "NotTheHeir");
  });

  it("Should revert if new heir is address zero", async function () {
    const { inheritance, heir } = await loadFixture(deployInheritanceFixture);

    await expect(
      inheritance.connect(heir).claimInheritance(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(inheritance, "InvalidHeir");
  });

  it("Should revert if the heir attempts to also be the new heir", async function () {
    const [_, heir] = await ethers.getSigners();
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await expect(
      inheritance.connect(heir).claimInheritance(heir.address)
    ).to.be.revertedWithCustomError(inheritance, "InvalidHeir");
  });

  it("Should revert if new heir attempts to claim before period", async function () {
    const [_, heir, newHeir1, newHeir2] = await ethers.getSigners();
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await time.increase(DAYS_31);
    await inheritance.connect(heir).claimInheritance(newHeir1.address);

    await expect(
      inheritance.connect(newHeir1).claimInheritance(newHeir2.address)
    ).to.be.revertedWithCustomError(inheritance, "InheritancePeriodNotReached");
  });
});
