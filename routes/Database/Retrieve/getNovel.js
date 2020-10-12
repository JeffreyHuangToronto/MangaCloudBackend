/** @format */

const express = require("express");
const client = require("../connectDatabase"); // Connect to database

const DATABASE_QUERY_DETAILS = {
    db_novel_title: "",
};

async function getNovelDetails() {
    const queryNovel = await client.db("NAMS").collection("NOVELS").findOne({ db_novel_title: DATABASE_QUERY_DETAILS.db_novel_title });

    if (queryNovel != null) {
        return queryNovel;
    }
    return {};
}

var router = express.Router();

/**
 *  If you call this endpoint you need to add a body with
 *  Database Novel Title: db_novel_title
 **/
router.get("/", async function (req, res, next) {
    DATABASE_QUERY_DETAILS.db_novel_title = req.body.db_novel_title;

    res.json(await getNovelDetails());
    res.end();
});

module.exports = router;
