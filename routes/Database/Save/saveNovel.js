/** @format */

const express = require("express");
const client = require("../connectDatabase"); // Connect to database

/**
 * This function will save a new novel if it is not in the database and will check if there is any new chapters
 * then it will update the chapter count.
 */
async function saveNewNovel(novel_title, cover_url, total_chapters, summary, _id) {
    // Setting our template to hold novel details
    var DATABASE_NOVEL_DETAILS = {
        _id: _id,
        novel_title: novel_title,
        cover_url: cover_url,
        total_chapters: total_chapters,
        summary: summary,
    };

    const queryNovel = await client.db("NAMS").collection("NOVELS").findOne({ _id: DATABASE_NOVEL_DETAILS._id });
    if (queryNovel == null) {
        const db1 = await client
            .db("NAMS")
            .collection("NOVELS")
            .insertOne(DATABASE_NOVEL_DETAILS)
            .catch((err) => {
                console.log("[SaveNovel] Error found trying to add new novel entry.", err);
            });
    } else if (queryNovel.total_chapters != DATABASE_NOVEL_DETAILS.total_chapters) {
        const db2 = await client
            .db("NAMS")
            .collection("NOVELS")
            .updateOne({ _id: DATABASE_NOVEL_DETAILS._id }, { $set: { total_chapters: DATABASE_NOVEL_DETAILS.total_chapters } })
            .catch(() => {
                console.log("[SaveNovel] Error found trying to update novel entry.");
            });
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
    const { novel_title, cover_url, total_chapters, summary, _id } = req.body;

    await saveNewNovel(novel_title, cover_url, total_chapters, summary, _id);

    res.send("Request recieved successfully.");
    res.end();
});

module.exports = router;
