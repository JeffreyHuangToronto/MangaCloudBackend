/** @format */

const express = require("express");
const client = require("../connectDatabase"); // Connect to database

async function getAllLibraryNovels(userId) {
    const allNovels = client.db("NAMS").collection("NOVELS");
    const userLibraryNovels = await client.db("NAMS").collection("USERS").findOne({ _id: userId });
    var NOVEL_LIST = { novels: [] };

    if (userLibraryNovels == null) return NOVEL_LIST;
    await allNovels.find().forEach((novel) => {
        userLibraryNovels.library.forEach((libraryNovel) => {
            if (novel._id == libraryNovel.novel_id) {
                NOVEL_LIST.novels.push(novel);
            }
        });
    });
    return NOVEL_LIST;
}

var router = express.Router();

/**
 *  If you call this endpoint you need to add a body with
 **/
router.get("/", async function (req, res, next) {
    res.json(await getAllLibraryNovels(req.query.userId));
    res.end();
});

module.exports = router;
