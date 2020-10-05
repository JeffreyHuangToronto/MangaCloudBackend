/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
// const client = require("./database"); // Connect to database
const { MongoClient, Db } = require("mongodb");
const uri = "mongodb+srv://Jeffrey:Jeffrey@nam-clutster.rp3ox.mongodb.net/NAMS?retryWrites=true&w=majority";
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

async function getRecommended() {
    const recommended = await client.db("NAMS").collection("recommended");
    // Novel has to be on our database

    var recommendNovels = { novels: [] };

    await recommended.find().forEach((cursor) => {
        // console.log(cursor);
        // console.log("CURSOR INFO:", cursor.novel_title:, cursor.novel_url:);
        recommendNovels.novels.push({ title: cursor.novel_title, novel_url: cursor.novel_url });
    });
    // console.log("Rec Object", recommendNovels);
    return recommendNovels;
}

var router = express.Router();
/* GET users listing. */
router.get("/", async function (req, res, next) {
    // const base_novel_url = req.body.url.toString();
    // const novel_title = url.parse(base_novel_url, true).pathname.slice(1, -1).split("/")[1];

    // Now we have the data get it from the database
    recNovels = JSON.stringify(await getRecommended());
    res.send(recNovels);
    // res.send("Test");
});

module.exports = router;
