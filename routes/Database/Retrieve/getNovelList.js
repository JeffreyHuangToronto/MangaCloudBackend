/** @format */

const express = require("express");
const client = require("../connectDatabase"); // Connect to database

async function getAllNovels() {
    const queryNovel = client.db("NAMS").collection("NOVELS");
    var NOVEL_LIST = { novels: [] };

    await queryNovel.find().forEach((NOVEL_CURSOR) => {
        NOVEL_LIST.novels.push(NOVEL_CURSOR);
    });
    return NOVEL_LIST;
}

var router = express.Router();

/**
 *  If you call this endpoint you need to add a body with
 **/
router.get("/", async function (req, res, next) {
    res.json(await getAllNovels());
    res.end();
});

module.exports = router;
