/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("./database"); // Connect to database

const SAVE_ALL_CONTENT = false;

const schema = {
    novel_title: "",
    db_novel_title: "",
    cover_url: "",
    total_chapters: 0,
    summary: [],
};

async function addNewNovel(novel_details) {
    //   Create a novel entry
    const db = await client.db("NAMS").collection("novels").insertOne(novel_details);
    console.log(`New novel added to database!: ${novel_details.novel_title}`);
}

async function novelInDB(novel_title) {
    const db = await client.db("NAMS").collection("novels").findOne({ db_novel_title: novel_title });
    if (db == null) {
        return false;
    }
    return true;
}

async function chapterInDB(novel_title, chapter_num) {
    query = {
        novel_title: novel_title,
        chapter: chapter_num,
    };

    const chapter = await client.db("NAMS").collection("chapters").findOne(query);

    if (!chapter) {
        // The chapter is not in our database.
        return false;
    }
    // The chapter is in our database.
    return true;
}

async function addChapterDetails(chapt, chapter_num) {
    // Adding

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
    const db_novel_title = url.parse(req.body.url, true).pathname.split("/")[2];
    const chapter_num = req.body.chapter_num;
    // Check if we need to add to database
    console.log(req.body);
    if (!(await novelInDB(db_novel_title))) {
        await axios
            .get(url.parse(req.body.url.toString(), true))
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page
                novel_details = {
                    novel_title: req.body.novel_title,
                    db_novel_title: db_novel_title,
                    novel_url: req.body.url,
                    total_chapters: 0,
                    summary: [],
                    cover_url: "https://www.grouphealth.ca/wp-content/uploads/2018/05/placeholder-image-300x225.png",
                };
                // -- Chapter Info -- //
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

                // -- Chapter Info End -- //
                await addNewNovel(novel_details);
            })
            .catch((err) => {
                console.log("Error found:", err);
            });
    }
    // We now have a database entry
    // Time to add chapters i < schema.total_chapters + 1
    while (!(await novelInDB(db_novel_title))) {}
    let chapter_url;
    if (SAVE_ALL_CONTENT) {
        for (let i = 1; i < schema.total_chapters + 1; i++) {
            chapter_url = req.body.url.toString() + "/chapter-" + i;
            await saveChapter(chapter_url, chapter_num, db_novel_title);
        }
    } else {
        chapter_url = req.body.url.toString() + "/chapter-" + chapter_num;
        await saveChapter(chapter_url, chapter_num, db_novel_title);
    }

    res.send(JSON.stringify(await parseChapter(db_novel_title, chapter_num)));
    // res.end();
});

async function parseChapter(db_novel_title, chapter_num) {
    const chapter = await client.db("NAMS").collection("chapters").findOne({ db_novel_title: db_novel_title, chapter: chapter_num });
    // Novel has to be on our database
    if (chapter_num == 0) {
        // Summary
        const novel = await client.db("NAMS").collection("novels").findOne({ db_novel_title: db_novel_title });
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

async function saveChapter(chapter_url, chapter_num, db_novel_title) {
    // The novel url base no /chapter-1/

    if (!(await chapterInDB(db_novel_title, chapter_num))) {
        // Chapter is not in database
        await axios
            .get(url.parse(chapter_url, true))
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page

                chapterObject = {
                    novel_title: db_novel_title,
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
