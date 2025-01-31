// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title A simple inheritance contract
 * @author kyrers
 * @notice Allows the owner to withdraw ETH and designate an heir. If the owner is inactive for 1 month, the heir can take control of the inheritance and designate a new heir.
 */
contract Inheritance is Ownable, ReentrancyGuard {
    address public heir;
    uint256 public lastAction;
    uint256 public constant INHERITANCE_PERIOD = 30 days;

    event InheritanceClaimed(address claimer);
    event HeirUpdated(address indexed newHeir);
    event Withdrawal(uint256 amount);

    error InheritancePeriodNotReached();
    error InvalidHeir();
    error InvalidWithdrawAmount();
    error NotTheHeir();
    error WithdrawFailed();

    modifier onlyHeir() {
        if (msg.sender != heir) {
            revert NotTheHeir();
        }
        _;
    }

    modifier validHeir(address newHeir, address currentOwner) {
        if (newHeir == address(0) || newHeir == currentOwner) {
            revert InvalidHeir();
        }
        _;
    }

    /**
     * @notice Creates the inheritance contract while setting the owner and the heir. The deployer can send ETH here.
     * @param _heir The heir address
     */
    constructor(
        address _heir
    ) payable Ownable(msg.sender) validHeir(_heir, msg.sender) {
        heir = _heir;
        lastAction = block.timestamp;
        emit HeirUpdated(heir);
    }

    receive() external payable {}

    /**
     * @notice Allow the owner to withdraw ETH
     * @dev 0 is a valid amount, in case the owner just wants to reset the countdown
     * @param amount The amount to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        if (address(this).balance < amount) {
            revert InvalidWithdrawAmount();
        }

        lastAction = block.timestamp;

        if (amount > 0) {
            (bool success, ) = payable(owner()).call{value: amount}("");
            if (!success) {
                revert WithdrawFailed();
            }
        }

        emit Withdrawal(amount);
    }

    /**
     * @notice Allow the heir to take control of the contract, if the owner has been inactive for 1 month
     * @dev This also resets the countdown, to avoid a race condition between the new owner being active and the new heir claiming control
     * @param newHeir The new heir address
     */
    function claimInheritance(
        address newHeir
    ) external onlyHeir validHeir(newHeir, msg.sender) {
        if (block.timestamp < lastAction + INHERITANCE_PERIOD) {
            revert InheritancePeriodNotReached();
        }

        _transferOwnership(heir);
        heir = newHeir;
        lastAction = block.timestamp;

        emit InheritanceClaimed(msg.sender);
        emit HeirUpdated(newHeir);
    }

    /**
     * @notice Allow the owner to set a new heir. Useful if the current heir is compromised
     * @param newHeir The new heir address
     */
    function setHeir(
        address newHeir
    ) external onlyOwner validHeir(newHeir, msg.sender) {
        heir = newHeir;
        emit HeirUpdated(newHeir);
    }

    /**
     * @notice Allows users to know when the heir can take control of the contract
     * @dev 0 means the heir can claim control
     * @return The time until heir can claim control of the contract
     */
    function timeUntilClaimable() external view returns (uint256) {
        uint256 timePassed = block.timestamp - lastAction;
        if (timePassed >= INHERITANCE_PERIOD) {
            return 0;
        }
        return INHERITANCE_PERIOD - timePassed;
    }
}
