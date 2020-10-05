/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const { json } = require("express");
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
/**
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 */
// const uri = "mongodb+srv://Jeffrey:Jeffrey@nam-clutster.rp3ox.mongodb.net/NAMS?retryWrites=true&w=majority";

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const SAVE_ALL_CONTENT = false;

// async function connectDB() {
//     console.log("Connecting to my Database...");
//     try {
//         // Connect to the MongoDB cluster
//         await client.connect();
//         console.log("Connected!");
//         // Make the appropriate DB calls
//     } catch (e) {
//         console.error("Error Connecting To DB", e);
//     }
// }

// connectDB().catch(console.error);

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
    // console.log("Adding New Novel to Database...");
    // schema.novel_title = novel_details.novel_title;
    // schema.summary = novel_details.summary;
    // schema.cover_url = novel_details.cover_url;
    // schema.total_chapters = novel_details.total_chapters;

    const db = await client.db("NAMS").collection("novels").insertOne(novel_details);
    console.log(`New novel added to database!: ${novel_details.novel_title}`);
}

let once = false;
/**
 *
 * @param {String} novel_title Novel title
 */
async function novelInDB(novel_title) {
    if (!once) {
        // console.log(`Checking if ${novel_title} is in our database (SAVE DB)...`);
    }

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
    // console.log(`CHAPTER TITLE -> (${chapter_details.chapter_title}, ${chapt.chapter_title})`);
    // console.log(`CHAPTER CONTENT -> (${(chapter_details.content[0], chapter_details.content[1])})`);
    await client.db("NAMS").collection("chapters").insertOne(chapter_details);
    // var db = await client.db("NAMS").collection("chapters").insertOne(chapter_details);
    // console.log(`${db.insertedCount} document(s) was/were inserted.`);
    // console.log(`New chapter should be added to database!: ${chapt.chapterTitle}`);
}

var router = express.Router();

router.post("/", async function (req, res, next) {
    // console.log("YOU CALLED SAVE DB");
    // console.log(req.body.url);
    const novel_title = url.parse(req.body.url, true).pathname.split("/")[2];
    const chapter_num = req.body.chapter_num;
    // console.log(chapter_num);
    //   const chapter_url = req.body.url.toString() + "/chapter-" + i; // The novel url base no /chapter-1/
    // Check if we need to add to database

    if (!(await novelInDB(novel_title))) {
        // We need to add to database
        // console.log("ADD NOVEL SCHEMA TO DATABASE");
        // console.log(req.body.url);
        await axios // "https://boxnovel.com/novel/the-human-emperor/"
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
                // console.log(`${novel_title}'s Total Chapters: ${$(".wp-manga-chapter").first().text().trim().split(" ")[1]}`);
                // Get Summary
                $("#editdescription").each((index, element) => {
                    novel_details.summary.push($(element).text());
                    // console.log(`Summary: ${$(element).text()}`);
                });
                //
                // console.log(`Description: ${$(element).text()}`);
                // body > div.wrap > div > div > div.profile-manga > div > div > div > div.tab-summary >
                // Get cover_url
                $("div.summary_image > a > img").each((index, element) => {
                    novel_details.cover_url = $(element).attr("src");
                });
                // console.log(`Cover_url: ${novel_details.cover_url}`);
                // console.log("------- CHAPTER INFO END: -------");
                await addNewNovel(novel_details);
            })
            .catch((err) => {
                console.log("Error found:", err);
            });
    }
    // We now have a database entry
    // Time to add chapters i < schema.total_chapters + 1

    // console.log("Waiting");
    while (!(await novelInDB(novel_title))) {}
    let chapter_url;
    if (SAVE_ALL_CONTENT) {
        for (let i = 1; i < schema.total_chapters + 1; i++) {
            chapter_url = req.body.url.toString() + "/chapter-" + i;
            // console.log(chapter_url);
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
                //body > div.wrap > div > div > div > div > div > div > div > div > div.c-blog-post > div.entry-content > div > div > div.reading-content > div > div.panel-heading
                // Get Chapter Title
                if ($("div.reading-content > div > div.panel-heading").text() != null) {
                    chapterObject.chapter_title = $("div.reading-content > div > div.panel-heading").text();
                    // console.log(`FOUND FROM PANEL HEADING: ${$("div.reading-content > div > div.panel-heading").text()}`);
                } else if ($("div.reading-content > div > h3").text() == null) {
                    chapterObject.chapter_title = $("h4", ".reading-content").text();
                    // console.log(`FOUND FROM H4 HEADING: ${$("h4", ".reading-content").text()}`);
                } else {
                    console.log("Couldn't Find Chapter Title");
                }

                // console.log(`Chapter Title: ${chapterObject.chapter_title}`);

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
