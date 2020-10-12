/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("./database"); // Connect to database
// const { MongoClient, Db } = require("mongodb");
// const uri = process.env.MONGODBURI;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// const api_url = process.env.API_URL;
const api_url = "http://250e62977aa7.ngrok.io";

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
        await axios.post(api_url + "/savechapterdb", body).catch(function (error) {
            console.log("Error HERE", error);
        });
    }
    const novel = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
    if (novel == null) return JSON.stringify({});
    return {
        cover_url: novel.cover_url,
        novel_url: "https://boxnovel.com/novel/" + novel_title,
    };
}

var router = express.Router();
/* GET users listing. */
router.post("/", async function (req, res, next) {
    const novel_title = req.body.novel_title;
    novelJSON = JSON.stringify(await getCover(novel_title));
    res.send(novelJSON);
});

module.exports = router;
