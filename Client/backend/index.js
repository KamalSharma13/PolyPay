const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;
const ABI = require("./abi.json");

app.use(cors());
app.use(express.json())


function convertArrayToObjects(arr) {
  const dataArray = arr.map((transaction, index) => ({
    key: (arr.length + 1 - index).toString(),
    type: transaction[0],
    amount: transaction[1],
    message: transaction[2],
    address: `${transaction[3].slice(0,4)}...${transaction[3].slice(0,4)}`,
    subject: transaction[4],
  }));

  return dataArray.reverse();
}


app.get("/getNameAndBalance", async (req,res) => {
  const { userAddress } = req.query;
  //console.log("df",userAddress)
  const response = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881",
    address: "0x66Ac9f2F58fBAC56F050b0e47C01c963698b295a",
    functionName: "getMyName",
    abi:ABI,
    params: { _user: userAddress },
  });
 

  const jsonResponseName = response.raw;


  const secResponse = await Moralis.EvmApi.balance.getNativeBalance({
    chain: "0x13881",
    address:userAddress,
  })

  const jsonResponseBal = (secResponse.raw.balance/1e18).toFixed(2);
  //console.log(jsonResponseBal)

  const thirdResponse = await Moralis.EvmApi.token.getTokenPrice({
    address:"0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
  })
  //console.log(thirdResponse)

  const jsonResponseDollar = (thirdResponse.raw.usdPrice * jsonResponseBal).toFixed(2);



  const fourResponse = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881",
    address: "0x66Ac9f2F58fBAC56F050b0e47C01c963698b295a",
    functionName: "getMyHistory",
    abi:ABI,
    params: { _user: userAddress },
  });

  const jsonResponseHistory = convertArrayToObjects(fourResponse.raw);

  const fiveResponse = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881",
    address: "0x66Ac9f2F58fBAC56F050b0e47C01c963698b295a",
    functionName: "getMyRequest",
    abi:ABI,
    params: { _user:userAddress },
  });

  const jsonResponseRequests = fiveResponse.raw;
  const jsonResponse = {
    name: jsonResponseName,
    balance : jsonResponseBal,
    dollar : jsonResponseDollar,
    history: jsonResponseHistory,
    request : jsonResponseRequests
  };

  return res.status(200).json(jsonResponse);
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
