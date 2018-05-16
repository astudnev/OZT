npm install -g solc
pip install git+https://github.com/dostu/solidity-flattener.git

solidity_flattener --allow-paths "$(pwd)/contracts" --output build/src/OZTToken_flat.sol contracts/OZTToken.sol