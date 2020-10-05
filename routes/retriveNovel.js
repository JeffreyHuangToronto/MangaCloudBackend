/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
// const { CLIENT_RENEG_LIMIT } = require("tls");
// const client = require("./database"); // Connect to database
const { MongoClient, Db } = require("mongodb");
const globalvars = require("../Global/variables.json");
const api_url = globalvars.API_URL;

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
let once = false;
async function novelInDB(novel_title) {
    // if (!once) {
    //   console.log(`Checking if ${novel_title} is in our database (RETRIEVENOVEL)...`);
    // }

    const db = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
    if (db == null) {
        if (!once) {
            // console.log(`Novel is not within our database.`);
            once = true;
        }

        return false;
    }
    if (!once) {
        // console.log(`It is within our database.`);
        once = true;
    }
    return true;
}

async function parseChapter(novel_title, chapter_num) {
    query = {
        novel_title: novel_title,
        chapter: chapter_num,
    };
    console.log(novel_title);
    if (chapter_num == 0) {
        const novel = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
        return {
            content: novel.summary,
            chapter_title: "Novel Title: " + novel_title + "\nTotal Chapters: " + novel.total_chapters,
            total_chapters: novel.total_chapters,
        };
    }
    const chapter = await client.db("NAMS").collection("chapters").findOne(query);
    if (chapter == null) return { content: ["", "..."], chapter_title: `Chapter ${chapter_num}: Not Found` };
    return {
        content: chapter.content,
        chapter_title: chapter.chapter_title,
        // total_chapters: chapter.total_chapters,
    };
}

async function chapterInDB(novel_title, chapter_num) {
    // console.log(`Checking for chapter ${chapter_num} from database...`);
    query = {
        novel_title: novel_title,
        chapter: chapter_num,
    };

    const chapter = await client.db("NAMS").collection("chapters").findOne(query);

    if (!chapter) {
        // console.log("Chapter is not within our database.");
        return false;
    }
    // console.log("Found Chapter in our database");
    return true;
}

var router = express.Router();
/* GET users listing. */
router.post("/", async function (req, res, next) {
    const base_novel_url = req.body.url;
    const novel_title = url.parse(base_novel_url, true).pathname.slice(1).split("/")[1];
    // console.log("NOVEL_TITLE:", base_novel_url);
    const chapter_num = req.body.chapter_num;

    body = {
        url: base_novel_url,
        chapter_num: chapter_num,
    };

    // Check if we have novel data in our database
    if (!(await novelInDB(novel_title))) {
        // If not send request to webscrape it
        // console.log("We don't have the novel in our database... (SENDING SAVE REQUEST)");
        // console.log(base_novel_url);

        await axios
            .post(api_url + "/savechapterdb", body)
            .then((response) => {
                // console.log(JSON.stringify(response.data));
                // console.log(JSON.stringify(response.data));
                // console.log("HEY");
                // console.log("We have the novel in our database");
                return JSON.stringify(response.data);
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    }
    // console.log("We have the novel in our database");
    if (!(await chapterInDB(novel_title, chapter_num))) {
        await axios
            .post(api_url + "/savechapterdb", body)
            .then((response) => {
                // console.log(JSON.stringify(response.data));
                // console.log(JSON.stringify(response.data));
                // console.log("HEY");
                // console.log("We have the novel in our database");
                return JSON.stringify(response.data);
            })
            .catch(function (error) {
                console.log("Error HERE", error);
            });
    }
    chapterJSON = JSON.stringify(await parseChapter(novel_title, chapter_num));
    // console.log(chapterJSON);
    // console.log("SENDING RESPONSE BACK");
    res.send(chapterJSON);
    res.end();

    // console.log("I'm going to wait here...");
    // while (!(await novelInDB(novel_title))) {}
    // while (!(await chapterInDB(novel_title, chapter_num))) {}
    // console.log("I stopped waiting...");
    // // Now we have the data get it from the database
});

module.exports = router;
