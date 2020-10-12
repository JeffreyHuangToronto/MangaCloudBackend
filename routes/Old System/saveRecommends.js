/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("./database/database"); // Connect to database
const api_url = process.env.API_URL;

async function recNovelInDB(novel_title) {
    query = {
        novel_title: novel_title,
    };
    const inRec = await client.db("NAMS").collection("novels").findOne(query);

    if (!inRec) {
        return false;
    }
    return true;
}
async function addNewNovel(novel_details) {
    const db = await client.db("NAMS").collection("novels").insertOne(novel_details);
    console.log(`New novel added to database!: ${novel_details.novel_title}`);
}

async function novelInDB(novel_title) {
    const db = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
    if (db == null) {
        return false;
    }
    return true;
}

async function addNovelToDB(novel_url, novel_title_in_DB, novel_title) {
    body = {
        novel_title: novel_title,
        url: novel_url,
        chapter_num: 0,
    };
    console.log(body);
    await axios
        .post(api_url + "/savechapterdb", body)
        .then((response) => {
            return JSON.stringify(response.data);
        })
        .catch(function (error) {
            console.log("Error", error);
        });
}

var router = express.Router();

router.get("/", async function (req, res, next) {
    const PAGES = 64;
    for (var i = 0; i < PAGES; i++) {
        console.log("Looking at page: ", i);
        await axios
            .get("https://boxnovel.com/page/" + i + "/?s&post_type=wp-manga&m_orderby=alphabet")
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page
                $("div.post-title.font-title > h5 > a").each(async (index, element) => {
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            await addNovelToDB($(element).attr("href"), novel_title_in_DB, novel_title);
                        }
                    }
                });
                $("div.item-summary > div.post-title.font-title").each(async (index, element) => {
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        var novel_title = $(element).text();
                        console.log(novel_title);
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            addNovelToDB($(element).attr("href"), novel_title_in_DB, novel_title);
                        }
                    }
                });
                $("div.post-title > h4 > a").each(async (index, element) => {
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        var novel_title = $(element).text();
                        console.log(novel_title);
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            addNovelToDB($(element).attr("href"), novel_title_in_DB, novel_title);
                        }
                    }
                });
                $("div.post-title > h5 > a").each(async (index, element) => {
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        var novel_title = $(element).text();
                        console.log(novel_title);
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            addNovelToDB($(element).attr("href"), novel_title_in_DB, novel_title);
                        }
                    }
                });
            })
            .catch((err) => {
                console.log("Error found:", err);
            });
    }
    res.send("Success");
});

module.exports = router;
