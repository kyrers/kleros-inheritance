import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const InheritanceModule = buildModule("InheritanceModule", (m) => {
  const heir = m.getParameter("heir");
  const inheritance = m.contract("Inheritance", [heir]);
  return { inheritance };
});

export default InheritanceModule;
