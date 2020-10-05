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

async function getRecommended() {
    // const recommended = await client.db("NAMS").collection("recommended");
    // // Novel has to be on our database
    // var recommendNovels = { novels: [] };
    // await recommended.find().forEach((cursor) => {
    //     console.log(cursor);
    //     recommendNovels.novels.push({ title: cursor.title, url: cursor.url });
    // });
    // return recommendNovels;
}

async function recNovelInDB(novel_title) {
    // console.log(`Checking for chapter ${chapter_num} from database...`);

    query = {
        novel_title: novel_title,
    };
    const inRec = await client.db("NAMS").collection("recommended").findOne(query);

    if (!inRec) {
        // console.log("Novel not in rec");
        return false;
    }
    // console.log("Novel in rec");
    return true;
}

async function addNovelToDB(novel_url, novel_title_in_DB) {
    // console.log(nTitleDB);
    novel_details = {
        novel_title: novel_title_in_DB,
        novel_url: novel_url,
    };
    await client.db("NAMS").collection("recommended").insertOne(novel_details);
    // console.log("Should be added");
}

var router = express.Router();
/* GET users listing. */
router.get("/", async function (req, res, next) {
    // const base_novel_url = req.body.url.toString();
    // const novel_title = url.parse(base_novel_url, true).pathname.slice(1, -1).split("/")[1];
    await axios
        .get("https://boxnovel.com")
        .then(async (response) => {
            const $ = cheerio.load(response.data); // Load the page
            $("div.post-title.font-title > h5 > a").each(async (index, element) => {
                // novel_details.novels.push({ novel_title: $(element).text(), novel_url: $(element).attr("href") });
                // console.log(`Title: ${$(element).text().trim()} HREF: ${$(element).attr("href")}`);
                var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                // console.log("Test", index);

                if (!(await recNovelInDB(novel_title_in_DB))) {
                    await addNovelToDB($(element).attr("href"), novel_title_in_DB);
                }
            });
        })
        .catch((err) => {
            console.log("Error found:", err);
        });
    // Now we have the data get it from the database
    // recNovels = JSON.stringify(await getRecommended());
    res.send("Success");
    // res.send("Test");
});

module.exports = router;
