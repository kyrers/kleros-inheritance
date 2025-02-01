# kleros-Inheritance

This repository contains the Inheritance contract, tests, and a script to deploy to the Sepolia network.

### Project setup

First, install the dependencies.

```sh
npm install
```

Then compile the contract and generate types:

```sh
npx hardhat compile
```

### Deploying to a live network

This example is for Sepolia. Other networks will require configuration.

First, create the `env` file and then fill the needed variables:

```sh
cp .env.example .env
```

Then run the script

```sh
npx hardhat run scripts/deploy.ts --network sepolia
```
