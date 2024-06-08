const loadToken = require("./modules/loadToken");
const ACCESS_TOKEN = loadToken();
const randomUseragent = require("random-useragent");

const ua = randomUseragent.getRandom((ua) => {
  return ua.browserName === "Microsoft Edge";
});
// console.log(ua);

const config = require("./config.json");
// console.log(config);

const getBalance = require("./modules/getBalance");
const getListReload = require("./modules/getListReload");
const collectEgg = require("./modules/collectEgg");
const layEgg = require("./modules/layEgg");
const sleep = require("./modules/sleep");
const getGoldenDuckInfo = require("./modules/getGoldenDuckInfo");
const getGoldenDuckReward = require("./modules/getGoldenDuckReward");
const claimGoldenDuck = require("./modules/claimGoldenDuck");
const addLog = require("./modules/addLog");
const Timer = require("easytimer.js").Timer;

let run = false;
let wallets = null;
let timerInstance = new Timer();
let eggs = 0;
let timeToGoldenDuck = 0;

function getDuckToLay(ducks) {
  let duck = null;
  let lastTime = Number((Date.now() / 1e3).toFixed(0));

  ducks.forEach((duck) => {
    if (duck.last_active_time < lastTime) lastTime = duck.last_active_time;
  });

  ducks.map((item) => {
    if (item.last_active_time === lastTime) duck = item;
  });

  return duck;
}

async function collectFromList(token, ua, listNests, listDucks) {
  if (listNests.length === 0) return console.clear(), harvestAllEgg();

  const { data } = await collectEgg(token, ua, listNests[0].id);
  // console.log(data);
  if (data) {
    const duck = getDuckToLay(listDucks);
    await layEgg(token, ua, listNests[0].id, duck.id);
      console.log(`Auto Claim Nest Done `);
    eggs++;
    listNests.shift();
    listDucks = listDucks.filter((d) => d.id !== duck.id);
    // console.log(listNests.length, listDucks.length);

    await sleep(config.sleepTime);
    collectFromList(token, ua, listNests, listDucks);
  }
}

async function harvestAllEgg() {
  try {
    if (!run) {
      timerInstance.start();
    }
    console.log("--------------------QTieee-xXx-mhqb365--------------------");
    const { listNests, listDucks } = await getListReload(
      ACCESS_TOKEN,
      ua,
      run ? false : true
    );
    // console.log(listNests, listDucks);

    run = true;
    const nestIds = listNests.map((i) => i.id);
    wallets = await getBalance(ACCESS_TOKEN, ua);
    console.log(`[         NESTS        ] : ${listNests.length} `);
    console.log(`[     GOLDEN DUCK      ] : ${timeToGoldenDuck} minutes later`);


    // wallets = await getBalance(ACCESS_TOKEN, ua);
    console.log(`[   Total Tool Claim   ] : ${eggs} EGG `);
    console.log("----------------------------------------------------------");
    collectFromList(ACCESS_TOKEN, ua, listNests, listDucks);
    if (timeToGoldenDuck <= 0) {
      const data = await getGoldenDuckInfo(ACCESS_TOKEN, ua);

      if (data.time_to_golden_duck === 0) {
        console.log("[ GOLDEN DUCK ] : Zit Zang xuat hien");
        const rewardData = await getGoldenDuckReward(ACCESS_TOKEN, ua);
        // console.log("rewardData", rewardData);
        if (rewardData.data.type === 0) {
          console.log("[ GOLDEN DUCK ] : Chuc ban may man lan sau");
          addLog("[ GOLDEN DUCK ] : Chuc ban may man lan sau\n");
        } else if (rewardData.data.type === 1 || rewardData.data.type === 4) {
          console.log("[ GOLDEN DUCK ] : TON | TRU -> Bo qua");
          addLog("[ GOLDEN DUCK ] : TON | TRU -> Bo qua\n");
        } else {
          const claimReward = await claimGoldenDuck(
            ACCESS_TOKEN,
            ua,
            rewardData.data
          );
        }
      } else {
        timeToGoldenDuck = Math.ceil(data.time_to_golden_duck / 60);
      }

      setInterval(() => {
        if (timeToGoldenDuck > 0) {
          timeToGoldenDuck--;
        }
      }, 60000);
    }
  } catch (error) {
    console.log("harvestAllEgg error", error);
  }
}

harvestAllEgg();
