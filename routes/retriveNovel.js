/** @format */

const express = require("express");
const axios = require("axios");
const url = require("url");
const api_url = process.env.API_URL;
const client = require("./database"); // Connect to database

let once = false;
async function novelInDB(novel_title) {
    const db = await client.db("NAMS").collection("novels").findOne({ db_novel_title: novel_title });
    if (db == null) {
        if (!once) {
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
        db_novel_title: novel_title,
        chapter: chapter_num,
    };
    console.log(novel_title);
    if (chapter_num == 0) {
        const novel = await client.db("NAMS").collection("novels").findOne({ db_novel_title: novel_title });
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
        chapter_title: `Chapter ${chapter_num}: ` + chapter.chapter_title,
        // total_chapters: chapter.total_chapters,
    };
}

async function chapterInDB(novel_title, chapter_num) {
    // console.log(`Checking for chapter ${chapter_num} from database...`);
    query = {
        db_novel_title: novel_title,
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
        await axios
            .post(api_url + "/savechapterdb", body)
            .then((response) => {
                return JSON.stringify(response.data);
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    }
    if (!(await chapterInDB(novel_title, chapter_num))) {
        await axios
            .post(api_url + "/savechapterdb", body)
            .then((response) => {
                return JSON.stringify(response.data);
            })
            .catch(function (error) {
                console.log("Error HERE", error);
            });
    }
    chapterJSON = JSON.stringify(await parseChapter(novel_title, chapter_num));
    res.send(chapterJSON);
    res.end();
});

module.exports = router;
