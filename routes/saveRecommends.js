/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("./database"); // Connect to database
const { MongoClient, Db } = require("mongodb");
const uri = process.env.MONGODBURI;
const api_url = process.env.API_URL;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// const client = require("./database"); // Connect to database

async function connectDB() {
    // console.log("Connecting to my Database...");
    // try {
    //     // Connect to the MongoDB cluster
    //     await client.connect();
    //     console.log("Connected!");
    //     // Make the appropriate DB calls
    // } catch (e) {
    //     console.error(e);
    // }
}

// connectDB().catch(console.error);

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
    const inRec = await client.db("NAMS").collection("novels").findOne(query);

    if (!inRec) {
        // console.log("Novel not in rec");
        return false;
    }
    // console.log("Novel in rec");
    return true;
}

async function addNovelToDB(novel_url, novel_title_in_DB) {
    // console.log(nTitleDB);
    // novel_details = {
    //     novel_title: novel_title_in_DB,
    //     novel_url: novel_url,
    // };

    body = {
        url: novel_url,
        chapter_num: 0,
    };

    await axios
        .post(api_url + "/savechapterdb", body)
        .then((response) => {
            return JSON.stringify(response.data);
        })
        .catch(function (error) {
            console.log("Error", error);
        });
    // await client.db("NAMS").collection("novels").insertOne(novel_details);
    // console.log("Should be added");
}

var router = express.Router();
/* GET users listing. */
router.get("/", async function (req, res, next) {
    // const base_novel_url = req.body.url.toString();
    // const novel_title = url.parse(base_novel_url, true).pathname.slice(1, -1).split("/")[1];
    const PAGES = 64;
    for (var i = 0; i < 2; i++) {
        console.log("Looking at page: ", i);
        await axios
            .get("https://boxnovel.com/page/" + i + "/?s&post_type=wp-manga&m_orderby=trending")
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page
                $("div.post-title.font-title > h5 > a").each(async (index, element) => {
                    // novel_details.novels.push({ novel_title: $(element).text(), novel_url: $(element).attr("href") });
                    // console.log(`Title: ${$(element).text().trim()} HREF: ${$(element).attr("href")}`);
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        // console.log("Test", index);

                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            await addNovelToDB($(element).attr("href"), novel_title_in_DB);
                        }
                    }
                });
                $("div.item-summary > div.post-title.font-title").each(async (index, element) => {
                    // novel_details.novels.push({ novel_title: $(element).text(), novel_url: $(element).attr("href") });
                    // console.log(`Title: ${$(element).text().trim()} HREF: ${$(element).attr("href")}`);
                    // console.log("Test", index);
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            await addNovelToDB($(element).attr("href"), novel_title_in_DB);
                        }
                    }
                });
                $("div.post-title > h4 > a").each(async (index, element) => {
                    // novel_details.novels.push({ novel_title: $(element).text(), novel_url: $(element).attr("href") });
                    // console.log(`Title: ${$(element).text().trim()} HREF: ${$(element).attr("href")}`);
                    // console.log("Test", index);
                    console.log($(element).attr("href"));
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            await addNovelToDB($(element).attr("href"), novel_title_in_DB);
                        }
                    }
                });
                $("div.post-title > h5 > a").each(async (index, element) => {
                    // novel_details.novels.push({ novel_title: $(element).text(), novel_url: $(element).attr("href") });
                    // console.log(`Title: ${$(element).text().trim()} HREF: ${$(element).attr("href")}`);
                    // console.log("Test", index);
                    console.log($(element).attr("href"));
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            await addNovelToDB($(element).attr("href"), novel_title_in_DB);
                        }
                    }
                });
            })
            .catch((err) => {
                console.log("Error found:", err);
            });
    }
    // Now we have the data get it from the database
    // recNovels = JSON.stringify(await getRecommended());
    res.send("Success");
    // res.send("Test");
});

module.exports = router;
