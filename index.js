// Required packages
const fs = require("fs");
const yaml = require("yaml");

// User packages
const database = require("./database");

// Get environment variables
const NUM_DEVICES = process.env.NUM_DEVICES ? parseInt(process.env.NUM_DEVICES) : 1;

// Import data JSON file with database information
const data = require("./data/database.json");

// Parse settings YAML file
const tester_config_raw = fs.readFileSync("./data/config.yaml", "utf8");
const tester_config = yaml.parse(tester_config_raw);

// Parse settings data
const MSIN_START = parseInt(tester_config.ue.msin);
const data_replace = {
  KEY: tester_config.ue.key,
  OPC: tester_config.ue.opc,
  AMF: tester_config.ue.amf,
  DNN: tester_config.ue.dnn,

  MCC: tester_config.ue.hplmn.mcc,
  MNC: tester_config.ue.hplmn.mnc,
  SST: tester_config.gnodeb.slicesupportlist.sst,
  SST_INT: tester_config.ue.snssai.sst,
  SD: tester_config.ue.snssai.sd,
};

// Replace data on the original JSON files
data.collections.forEach((item) => {
  let file_raw = fs.readFileSync(`./data/${item.filename}`, "utf8");

  Object.entries(data_replace).forEach(([key, value]) => {
    file_raw = file_raw.replaceAll(`$(${key})`, value);
  });

  // Save current content to the data JSON
  item.content = file_raw;
});

// Prepare all UEs
let collections = {};
for (let msin = MSIN_START; msin < NUM_DEVICES + MSIN_START; msin++) {
  let msin_str = msin.toLocaleString("en-US", { minimumIntegerDigits: 10, useGrouping: false });

  data.collections.forEach((item) => {
    const content = JSON.parse(item.content.replaceAll("$(MSIN)", msin_str));

    if (!collections[item.collection])
      collections[item.collection] = [];

    collections[item.collection] = collections[item.collection].concat(content)
  });
}

// Write data to the DB
async function saveData() {
  await database.connect(data.host, data.database);

  await database.insertMultiple(collections);

  await database.disconnect();
}
saveData();
