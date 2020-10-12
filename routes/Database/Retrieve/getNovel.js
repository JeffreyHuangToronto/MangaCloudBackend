/** @format */

const express = require("express");
const client = require("../connectDatabase"); // Connect to database

// The details for the query
const DATABASE_QUERY_DETAILS = {
    _id: "",
};

/**
 * This function will return novel details given the database novel title
 * @Return novel details and returns an empty object if not found.
 */
async function getNovelDetails() {
    const queryNovel = await client.db("NAMS").collection("NOVELS").findOne({ _id: DATABASE_QUERY_DETAILS._id });

    if (queryNovel != null) {
        return queryNovel;
    }
    return {};
}

var router = express.Router();

/**
 *  If you call this endpoint you need to add a body with
 *  Database Novel Title: _id
 **/
router.get("/", async function (req, res, next) {
    DATABASE_QUERY_DETAILS._id = req.body._id;

    res.json(await getNovelDetails());
    res.end();
});

module.exports = router;
