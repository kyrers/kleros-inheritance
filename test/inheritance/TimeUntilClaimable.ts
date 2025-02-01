import { expect } from "chai";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployInheritanceFixture } from "../utils/fixtures";

const DAYS_30 = 30 * 24 * 60 * 60;
const DAYS_15 = 15 * 24 * 60 * 60;

describe("# TIME UNTIL CLAIMABLE #", function () {
  it("Should return full period after deployment", async function () {
    const { inheritance } = await loadFixture(deployInheritanceFixture);
    expect(await inheritance.timeUntilClaimable()).to.equal(DAYS_30);
  });

  it("Should decrease as time passes", async function () {
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await time.increase(DAYS_15);
    expect(await inheritance.timeUntilClaimable()).to.equal(DAYS_15);
  });

  it("Should return zero after period has passed", async function () {
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await time.increase(31 * 24 * 60 * 60);
    expect(await inheritance.timeUntilClaimable()).to.equal(0);
  });

  it("Should reset after withdrawal", async function () {
    const { inheritance } = await loadFixture(deployInheritanceFixture);

    await time.increase(DAYS_15);
    await inheritance.withdraw(0);
    expect(await inheritance.timeUntilClaimable()).to.equal(DAYS_30);
  });
});
