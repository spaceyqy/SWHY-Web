importScripts("https://cdn.jsdelivr.net/gh/ethereum/web3.js/dist/web3.min.js");
var Web3 = require('web3');
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // Set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/e4967975d16b4fa78c4eb2128504e519"));
}
var contractAbi = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "success", "type": "bool" }], "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "success", "type": "bool" }], "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" }, { "constant": true, "inputs": [], "name": "version", "outputs": [{ "name": "", "type": "string" }], "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "success", "type": "bool" }], "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_extraData", "type": "bytes" }], "name": "approveAndCall", "outputs": [{ "name": "success", "type": "bool" }], "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "type": "function" }, { "inputs": [{ "name": "_initialAmount", "type": "uint256" }, { "name": "_tokenName", "type": "string" }, { "name": "_decimalUnits", "type": "uint8" }, { "name": "_tokenSymbol", "type": "string" }], "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Approval", "type": "event" }];
var contractAddress = '0x9434b14A5B95256932ede97eA68842F110241107';//SWHY contract address
var fundDispatchAccount = "0xb2098ab85748fc69142c979b0b65f248db19a93f";//SWHY 发放账户，100W（Total Sypply）
var fundCollectEthAccount = '0x92A2E9F32c0F7C78E7D9F73362Ae2d390335e0A8';//SWHY 收款账户，个人账户以ETH汇款到这里
//define contract by contract address
var myContract = web3.eth.contract(contractAbi);
var myContractInstance = myContract.at(contractAddress);

//每隔1s就查询计算一次，并将数据post出去
setInterval(function(){
//基金兑换公式为：（合约总SWHY发行量-SWHY发放账户的SWHY余额)/ 基金汇款账户中得到的Eth余额
var fundCollectBalanceWei = web3.eth.getBalance(fundCollectEthAccount).toNumber();
var fundCollectBalance = web3.fromWei(fundCollectBalanceWei, 'ether');//fund collect Eth balance
//begin getter
var tokenName = myContractInstance.name();//Token name
var tokenBalance = myContractInstance.totalSupply().toNumber();//Token总发行量（小数点后多4位）
var tokenDecimals = myContractInstance.decimals().toNumber();//Token小数点位数
var fundDispatchSWHYRemain = myContractInstance.balanceOf(fundDispatchAccount).toNumber();//SWHY发放账户中SWHY余额（小数点后多4位）  
//begin calc
var tokenTotalSupply = tokenBalance / (10 ** tokenDecimals);//Token总发行量
var fundDispatchSWHYRemain = fundDispatchSWHYRemain / (10 ** tokenDecimals);//SWHY发放账户中SWHY余额
var fundDispatchSWHY = tokenTotalSupply - fundDispatchSWHYRemain;//SWHY发给客户总数量
var ethToSWHY = fundDispatchSWHY / fundCollectBalance;//Eth到SWHY的兑换比例
//return and post
var messageArray = [fundCollectBalance, fundDispatchSWHY, ethToSWHY];//[收款账户ETH，SWHY发给客户总数量，Eth到SWHY的兑换比例]
postMessage(messageArray);
},1000);
