/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
// const client = require("./database"); // Connect to database
const { MongoClient, Db } = require("mongodb");
const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    console.log("Connecting to my Database...");
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        console.log("Connected!");
        // Make the appropriate DB calls
    } catch (e) {
        console.error(e);
    }
}

connectDB().catch(console.error);
const globalvars = require("../Global/variables.json");
const api_url = globalvars.API_URL;
/**
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 */
// const uri = "mongodb+srv://Jeffrey:Jeffrey@nam-clutster.rp3ox.mongodb.net/NAMS?retryWrites=true&w=majority";

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function connectDB() {
//   console.log("Connecting to my Database...");
//   try {
//     // Connect to the MongoDB cluster
//     await client.connect();
//     console.log("Connected!");
//     // Make the appropriate DB calls
//   } catch (e) {
//     console.error(e);
//   }
// }

// connectDB().catch(console.error);

async function novelInDB(novel_title) {
    const db = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
    if (db == null) {
        return false;
    }
    return true;
}

async function getCover(novel_title) {
    body = {
        url: "https://boxnovel.com/novel/" + novel_title,
        chapter_num: 0,
    };
    if (!(await novelInDB(novel_title))) {
        await axios
            .post(api_url + "/savechapterdb", body)
            // .then((response) => {
            //     // console.log(JSON.stringify(response.data));
            //     // console.log(JSON.stringify(response.data));
            //     // console.log("HEY");
            //     // console.log("We have the novel in our database");
            // })
            .catch(function (error) {
                console.log("Error HERE", error);
            });
    }
    const novel = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
    // Novel has to be on our database
    // console.log("Cover URL: ", novel.cover_url);
    if (novel == null) return JSON.stringify({});
    // console.log("NovelCur", novel);
    // console.log(novel.novel_title);
    // console.log(novel_title);
    return {
        cover_url: novel.cover_url,
        novel_url: "https://boxnovel.com/novel/" + novel_title,
    };
}

var router = express.Router();
/* GET users listing. */
router.post("/", async function (req, res, next) {
    // console.log("Body Recieved:", req.body);
    const novel_title = req.body.novel_title;
    novelJSON = JSON.stringify(await getCover(novel_title));
    // console.log("Sending:", novelJSON);
    res.send(novelJSON);
});

module.exports = router;
