// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Emojis is ERC721, ERC721Enumerable,Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    uint8 maxSupply;
    uint64 public mintPrice;
    mapping(address => bool) public minted;
    string public baseExtension;

    constructor() ERC721("Emojis", "EMJS") {
           _tokenIdCounter.increment();
           maxSupply=16;
           mintPrice = 0.001 ether;
           baseExtension = ".json";
    }

 function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmQPs5nTTcv7TW4bg6wHvCXTC4AscFAysMKZQHmx3mUJ3p/";
    }

     function mint(address to) public payable {
        
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= maxSupply, "All nfts have been minted");
        require(minted[to]==false,"You can only mint once"); 
        require(msg.value==mintPrice,"Wrong mint price");
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        minted[to]=true;
     }

        function reserve(uint256 amount) public onlyOwner {
        uint256 tokenReserve = _tokenIdCounter.current();
        uint256 supply = totalSupply();
        require(amount <= maxSupply - tokenReserve +1, "You can't reserve more than the max");
        for (uint i = 1; i <= amount; i++) {
        _tokenIdCounter.increment();
        _safeMint(msg.sender, supply + i);

      }
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
  

  function tokenURI(uint256 tokenId) public view override returns (string memory){
        require( _exists(tokenId), "ERC721Metadata: URI query for nonexistent token" );
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0 ? string(
            abi.encodePacked(currentBaseURI,Strings.toString(tokenId),baseExtension))
                : "";
    }

    function tokensOfOwner(address _owner) public view returns (uint256[] memory){
    uint256 ownerTokenCount = balanceOf(_owner);
    uint256[] memory tokenIds = new uint256[](ownerTokenCount);
    for (uint256 i; i < ownerTokenCount; i++) {
      tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
    }
    return tokenIds;
  }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}