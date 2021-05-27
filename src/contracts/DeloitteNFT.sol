pragma solidity ^0.5.0;

// import "./ERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract DeloitteNFT is ERC721Full {
    // array with all the links to the DeloitteNFT content
    string[] public deloitteNFTLinks;

    address private _owner;
    mapping(string => bool) _deloitteContentExists;
    // Mapping from ipfs hash to boolean.. true if the ipfs hash that was entered already has been used

    // Mapping from token ID to owner
    mapping(uint256 => address) private _tokenOwner;

    constructor() public ERC721Full("DeloitteNFT", "DELOITTENFT ") {
        // decide what our name and symbol will be
        _owner = msg.sender;
    }

    // E.G. _deloitteContentLink = "ipfs.io/xyz"
    function mint(string memory _deloitteContentLink, string memory tokenURI)
        public
    {
        require(!_deloitteContentExists[_deloitteContentLink]);
        require(isOwner());
        uint256 _id = deloitteNFTLinks.push(_deloitteContentLink);
        _safeMint(msg.sender, _id);
        _setTokenURI(_id, tokenURI);
        _deloitteContentExists[_deloitteContentLink] = true;
        // need to figure out how to handle secondary sales fees (how to pay creator a share)
        // and how does marketplace take a share
    }

    /**
     * @return the address of the owner.
     */
    function owner() external view returns (address) {
    // function owner() external view returns (address) {

        return _owner;
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    /**
     * @return true if the given token id is listed as for sale by the token owner
     */
    function isForSale() public view returns (bool) {
        return msg.sender == _owner;
        // TO DO (need to write the function)
    }

    function tokensOfOwner(address ownerParam) external view returns (uint256[] memory) {
      return _tokensOfOwner(ownerParam);
    }
}
