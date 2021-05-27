const DeloitteNFT = artifacts.require("DeloitteNFT");

module.exports = function(deployer) {
  deployer.deploy(DeloitteNFT);
};
