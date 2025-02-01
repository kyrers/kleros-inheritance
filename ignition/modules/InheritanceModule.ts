import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const InheritanceModule = buildModule("InheritanceModule", (m) => {
  const heir = m.getParameter("heir");
  const value = m.getParameter("value");
  const inheritance = m.contract("Inheritance", [heir], {
    value: value,
  });
  return { inheritance };
});

export default InheritanceModule;
