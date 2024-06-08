const getAction = require("../actions/get");
const sleep = require("./sleep");
const config = require("../config.json");

async function getBalance(token, ua) {
  let retry = 0;
  let data = null;
  while (retry < config.retryCount) {
    if (!!data) {
      break;
    }
    data = await getBalanceInternal(token, ua);
    retry++;
  }

  return data;
}

async function getBalanceInternal(token, ua) {
  try {
    const response = await getAction(token, "balance/get", ua);
    // console.log("getBalance", response);
    const wallets = extractWalletsInfo(response);
    return wallets;
  } catch (error) {
    console.log("getBalance error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      console.log("data", error.response.data);
      const status = error.response.status;
      // console.log(error.response.headers);
      if (status === 503 || status === 502) {
        console.log("Mat ket noi, tu dong ket noi sau 30s");
        await sleep(30);
        return null;
      } else if (status === 401) {
        console.log(`\nToken loi hoac het han roi\n`);
        process.exit(1);
      } else if (status === 400) {
        await sleep(10);
        return null;
      } else {
        await sleep(5);
        return null;
      }
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

async function getBalance(token, ua) {
  try {
    let wallets = [];
    let walletStr = "";

    const balanceInfo = await getAction(token, "balance/get", ua);
    // console.log("balanceInfo", balanceInfo.data);

    balanceInfo.data.data.data.map((bl) => {
      if (bl.symbol === "PET") {
        wallets.push({
          symbol: "PEPET",
          balance: bl.balance,
        });
      } else if (bl.symbol === "EGG") {
        wallets.push({
          symbol: "EGG",
          balance: bl.balance,
        });
      }
    });

    wallets.map((w) => {
      walletStr += `| ${Number(w.balance).toFixed(2)} ${w.symbol} |`;
    });          
    console.log("[        WALLETS       ] :", walletStr);

    return "getBalance ok";
  } catch (error) {
    console.log("getBalance error");
    if (error.response) {
      // console.log(error.response.data);
      console.log("status", error.response.status);
      // const { status } = error.response;
      // if (status >= 500) {
      //   sleep(randomTime());
      //   getBalance(token);
      // }
      // console.log(error.response.headers);
    } else if (error.request) {
      console.log("request", error.request);
    } else {
      console.log("error", error.message);
    }
  }
}

module.exports = getBalance;
