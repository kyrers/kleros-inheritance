import { expect } from "chai";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployInheritanceFixture } from "../utils/fixtures";
import { ethers } from "hardhat";
import { depositEth, withdrawEth } from "../utils/helpers";

describe("# WITHDRAW #", function () {
  it("Should allow owner to fully withdraw", async function () {
    const { inheritance, owner, deployTxReceipt } = await loadFixture(
      deployInheritanceFixture
    );

    const value = ethers.parseEther("1.0");
    await depositEth({
      account: owner,
      to: inheritance.target,
      amount: value,
    });

    const { accountBalanceBefore, accountBalanceAfter, contractBalance } =
      await withdrawEth({
        account: owner,
        inheritanceContract: inheritance,
        amount: value,
      });

    expect(contractBalance).to.equal(0);
    expect(accountBalanceAfter).to.be.closeTo(
      accountBalanceBefore + value,
      deployTxReceipt.fee
    );
  });

  it("Should allow owner to partially withdraw", async function () {
    const { inheritance, owner, deployTxReceipt } = await loadFixture(
      deployInheritanceFixture
    );

    const value = ethers.parseEther("1.0");
    const withdrawValue = ethers.parseEther("0.5");
    await depositEth({
      account: owner,
      to: inheritance.target,
      amount: value,
    });

    const { accountBalanceBefore, accountBalanceAfter, contractBalance } =
      await withdrawEth({
        account: owner,
        inheritanceContract: inheritance,
        amount: withdrawValue,
      });

    expect(contractBalance).to.equal(withdrawValue);
    expect(accountBalanceAfter).to.be.closeTo(
      accountBalanceBefore + withdrawValue,
      deployTxReceipt.fee
    );
  });

  it("Should allow withdrawing 0 ETH", async function () {
    const { inheritance, owner } = await loadFixture(deployInheritanceFixture);
    const value = ethers.parseEther("1");
    await depositEth({
      account: owner,
      to: inheritance.target,
      amount: value,
    });

    const { accountBalanceBefore, accountBalanceAfter, contractBalance } =
      await withdrawEth({
        account: owner,
        inheritanceContract: inheritance,
        amount: 0n,
      });

    expect(accountBalanceBefore).to.be.greaterThan(accountBalanceAfter);
    expect(contractBalance).to.equal(value);
  });

  it("Should allow withdrawing after 30 days have passed", async function () {
    const { inheritance, owner } = await loadFixture(deployInheritanceFixture);
    const value = ethers.parseEther("1");
    await depositEth({
      account: owner,
      to: inheritance.target,
      amount: value,
    });

    await time.increase(30 * 24 * 60 * 60);
    expect(await inheritance.timeUntilClaimable()).to.equal(0);

    const { accountBalanceBefore, accountBalanceAfter, contractBalance } =
      await withdrawEth({
        account: owner,
        inheritanceContract: inheritance,
        amount: 0n,
      });

    expect(accountBalanceBefore).to.be.greaterThan(accountBalanceAfter);
    expect(contractBalance).to.equal(value);
  });

  it("Should update lastAction on withdrawal", async function () {
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    const lastActionBefore = await inheritance.lastAction();
    await inheritance.withdraw(0);
    const lastActionAfter = await inheritance.lastAction();

    expect(lastActionAfter).to.be.greaterThan(lastActionBefore);
  });

  it("Should emit Withdrawal event", async function () {
    const { inheritance, owner } = await loadFixture(deployInheritanceFixture);
    const value = ethers.parseEther("1.0");

    await depositEth({
      account: owner,
      to: inheritance.target,
      amount: value,
    });
    await expect(inheritance.withdraw(value))
      .to.emit(inheritance, "Withdrawal")
      .withArgs(value);
  });

  it("Should revert if trying to withdraw more than balance", async function () {
    const { inheritance } = await loadFixture(deployInheritanceFixture);
    const value = ethers.parseEther("1.0");

    await expect(inheritance.withdraw(value)).to.be.revertedWithCustomError(
      inheritance,
      "InvalidWithdrawAmount"
    );
  });

  it("Should revert if non-owner tries to withdraw", async function () {
    const { inheritance, heir } = await loadFixture(deployInheritanceFixture);

    await expect(inheritance.connect(heir).withdraw(0))
      .to.be.revertedWithCustomError(inheritance, "OwnableUnauthorizedAccount")
      .withArgs(heir.address);
  });
});
