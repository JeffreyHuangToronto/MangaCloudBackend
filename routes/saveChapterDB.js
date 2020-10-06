/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const { json } = require("express");
// const client = require("./database"); // Connect to database
const { MongoClient, Db } = require("mongodb");
const uri = process.env.MONGODBURI;
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

const SAVE_ALL_CONTENT = false;

const schema = {
    novel_title: "",
    cover_url: "",
    total_chapters: 0,
    summary: [],
};

/**
 * ADD NOVEL ENTRY TO DATABASE
 * @param {String} novel_title Novel Title
 * @param {String} summary Novel Summary
 * @param {String} cover_url Novel Cover URL
 */
async function addNewNovel(novel_details) {
    //   Create a novel entry

    const db = await client.db("NAMS").collection("novels").insertOne(novel_details);
    console.log(`New novel added to database!: ${novel_details.novel_title}`);
}

let once = false;
/**
 *
 * @param {String} novel_title Novel title
 */
async function novelInDB(novel_title) {
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

async function addChapterDetails(chapt, chapter_num) {
    // console.log("Adding Chapter Details To DB...");

    const chapter_details = {
        novel_title: chapt.novel_title,
        chapter_title: chapt.chapter_title,
        chapter: chapter_num,
        content: chapt.paragraphs,
    };
    await client.db("NAMS").collection("chapters").insertOne(chapter_details);
}

var router = express.Router();

router.post("/", async function (req, res, next) {
    const novel_title = url.parse(req.body.url, true).pathname.split("/")[2];
    const chapter_num = req.body.chapter_num;
    // Check if we need to add to database

    if (!(await novelInDB(novel_title))) {
        await axios
            .get(url.parse(req.body.url.toString(), true))
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page
                novel_details = {
                    novel_title: novel_title,
                    total_chapters: 0,
                    summary: [],
                    cover_url: "",
                };
                // console.log("------- CHAPTER INFO: -------");

                // Get Total Chapters
                novel_details.total_chapters = Number($(".wp-manga-chapter").first().text().trim().split(" ")[1]);

                // Get Summary
                $("#editdescription").each((index, element) => {
                    novel_details.summary.push($(element).text());
                });

                // Get cover_url
                $("div.summary_image > a > img").each((index, element) => {
                    novel_details.cover_url = $(element).attr("src");
                });

                // console.log("------- CHAPTER INFO END: -------");
                await addNewNovel(novel_details);
            })
            .catch((err) => {
                console.log("Error found:", err);
            });
    }
    // We now have a database entry
    // Time to add chapters i < schema.total_chapters + 1
    while (!(await novelInDB(novel_title))) {}
    let chapter_url;
    if (SAVE_ALL_CONTENT) {
        for (let i = 1; i < schema.total_chapters + 1; i++) {
            chapter_url = req.body.url.toString() + "/chapter-" + i;
            await saveChapter(chapter_url, chapter_num, novel_title);
        }
    } else {
        chapter_url = req.body.url.toString() + "/chapter-" + chapter_num;
        await saveChapter(chapter_url, chapter_num, novel_title);
    }

    res.send(JSON.stringify(await parseChapter(novel_title, chapter_num)));
    // res.end();
});

async function parseChapter(novel_title, chapter_num) {
    const chapter = await client.db("NAMS").collection("chapters").findOne({ novel_title: novel_title, chapter: chapter_num });
    // Novel has to be on our database
    if (chapter_num == 0) {
        const novel = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
        return {
            content: novel.summary,
            chapter_title: novel.total_chapters,
        };
    }
    return {
        content: chapter.content,
        chapter_title: chapter.chapter_title,
    };
}

async function saveChapter(chapter_url, chapter_num, novel_title) {
    // The novel url base no /chapter-1/

    if (!(await chapterInDB(novel_title, chapter_num))) {
        // Chapter is not in database
        await axios
            .get(url.parse(chapter_url, true))
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page

                chapterObject = {
                    novel_title: novel_title,
                    chapter_title: "",
                    paragraphs: [],
                };

                // Get Chapter Title
                if ($("div.reading-content > div > div.panel-heading").text() != null) {
                    chapterObject.chapter_title = $("div.reading-content > div > div.panel-heading").text();
                } else if ($("div.reading-content > div > h3").text() == null) {
                    chapterObject.chapter_title = $("h4", ".reading-content").text();
                } else {
                    console.log("Couldn't Find Chapter Title");
                }

                // Get Paragraphs
                $("p", ".reading-content").each((index, p) => {
                    const paragraph = $(p).text();
                    chapterObject.paragraphs.push(paragraph);
                });
                await addChapterDetails(chapterObject, chapter_num);
            })
            .catch((err) => {
                console.log("Error found:", err);
            });
    }
}

router.get("/", async function (req, res, next) {
    res.send("GET IS NOT SUPPORTED");
});
module.exports = router;
