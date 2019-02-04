const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });

  // The token name and token symbol are added properly.
  it('token name was added properly', async() => {
    let instance = await StarNotary.deployed();
    let instanceName = await instance.name.call();
    assert.equal(instanceName, "StarNotaryToken");
  });

  it('token symbol was added properly', async() => {
    let instance = await StarNotary.deployed();
    let instanceSymbol = await instance.symbol.call();
    assert.equal(instanceSymbol, "SNT");
  });

  // 2 users can exchange their stars.
  it('lets two users to exchange their stars', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[3];
    let user2 = accounts[4];
    let user1StarId = 6;
    let user2StarId = 7;
    await instance.createStar('Awesome Star6!', user1StarId, {from: user1});
    await instance.createStar('Awesome Star7!', user2StarId, {from: user2});
    await instance.exchangeStars(user1,user1StarId,user2,user2StarId);
    newOwnerStart1 = await instance.ownerOf.call(user1StarId);
    newOwnerStart2 = await instance.ownerOf.call(user2StarId);
    assert.equal((newOwnerStart1 == user2) && (newOwnerStart2 == user1), true);
  });

  // Stars Tokens can be transferred from one address to another.
  it('lets a user to transfer his token to another user', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let user1StarId = 8;
    await instance.createStar('Awesome Star8!', user1StarId, {from: user1});
    await instance.transferStar(user2,user1StarId);
    newOwnerStart1 = await instance.ownerOf.call(user1StarId);
    assert.equal(newOwnerStart1 == user2, true);
  });