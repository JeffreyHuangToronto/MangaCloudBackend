/** @format */

const express = require("express");
const client = require("../connectDatabase"); // Connect to database

const DATABASE_CHAPTER_DETAILS = {
    _id: "",
    chapter_title: "",
    chapter: 0,
    content: [],
};

async function saveNewChapter() {
    const queryChapter = await client.db("NAMS").collection("CHAPTERS").findOne({ _id: DATABASE_CHAPTER_DETAILS._id });

    if (queryChapter == null) {
        const db = await client.db("NAMS").collection("CHAPTERS").insertOne(DATABASE_CHAPTER_DETAILS);
        console.log(`New chapter added to database!: ${DATABASE_CHAPTER_DETAILS.novel_title}`);
    }
}

var router = express.Router();

/**
 *  If you call this endpoint you need to add a body with
 *  Database Novel Title: db_novel_title (the-kings-crown)
 *  Chapter Title: chapter_title (The Next Level)
 *  Chapter: chapter (1)
 *  Content: content []
 **/
router.post("/", async function (req, res, next) {
    const { _id, chapter_title, chapter, content } = req.body;

    // Setting our template to hold novel details
    DATABASE_CHAPTER_DETAILS._id = _id;
    DATABASE_CHAPTER_DETAILS.chapter_title = `Chapter ${chapter}: ${chapter_title}`;
    DATABASE_CHAPTER_DETAILS.chapter = chapter;
    DATABASE_CHAPTER_DETAILS.content = content;

    console.log(DATABASE_CHAPTER_DETAILS);

    saveNewChapter();
    res.end();
});

module.exports = router;
