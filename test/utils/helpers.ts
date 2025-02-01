import { Addressable, Signer } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Inheritance } from "../../typechain-types";
import { ethers } from "hardhat";

interface BaseParams {
  account: HardhatEthersSigner;
  amount: bigint;
}

interface DepositParams extends BaseParams {
  to: string | Addressable;
}

export async function depositEth(params: DepositParams) {
  await params.account.sendTransaction({
    to: params.to,
    value: params.amount,
  });
}

interface WithdrawParams extends BaseParams {
  inheritanceContract: Inheritance;
}

export async function withdrawEth(params: WithdrawParams) {
  const accountBalanceBefore = await ethers.provider.getBalance(
    params.account.address
  );
  await params.inheritanceContract.withdraw(params.amount);
  const accountBalanceAfter = await ethers.provider.getBalance(
    params.account.address
  );
  const contractBalance = await ethers.provider.getBalance(
    params.inheritanceContract.target
  );

  return { accountBalanceBefore, accountBalanceAfter, contractBalance };
}
