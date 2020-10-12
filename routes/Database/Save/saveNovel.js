/** @format */

const express = require("express");
const client = require("../connectDatabase"); // Connect to database

var DATABASE_NOVEL_DETAILS = {
    novel_title: "",
    db_novel_title: "",
    cover_url: "",
    total_chapters: 0,
    summary: [],
};

async function saveNewNovel() {
    const queryNovel = await client.db("NAMS").collection("NOVELS").findOne({ db_novel_title: DATABASE_NOVEL_DETAILS.db_novel_title });

    if (queryNovel == null) {
        const db = await client.db("NAMS").collection("NOVELS").insertOne(DATABASE_NOVEL_DETAILS);
        console.log(`New novel added to database!: ${DATABASE_NOVEL_DETAILS.novel_title}`);
    }
    if (queryNovel.total_chapters != DATABASE_NOVEL_DETAILS.total_chapters) {
        const db = await client.db("NAMS").collection("NOVELS").updateOne(DATABASE_NOVEL_DETAILS); // LEFT HERE @TODO
    }
}

var router = express.Router();

/**
 *  If you call this endpoint you need to add a body with
 *  Novel Title : novel_title (The Kings Crown)
 *  Database Novel Title: db_novel_title (the-kings-crown)
 *  Cover URL: cover_url (www.abc.com/abc.png)
 *  Total Chapters: total_chapters (1)
 *  Summary: summary[]
 **/
router.post("/", async function (req, res, next) {
    const { novel_title, db_novel_title, cover_url, total_chapters, summary } = req.body;

    // Setting our template to hold novel details
    DATABASE_NOVEL_DETAILS.novel_title = novel_title;
    DATABASE_NOVEL_DETAILS.db_novel_title = db_novel_title;
    DATABASE_NOVEL_DETAILS.cover_url = cover_url;
    DATABASE_NOVEL_DETAILS.total_chapters = total_chapters;
    DATABASE_NOVEL_DETAILS.summary = summary;

    console.log(DATABASE_NOVEL_DETAILS);

    saveNewNovel();
    res.send("Request Sent!");
    res.end();
});

module.exports = router;
