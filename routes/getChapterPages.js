/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("./Database/DatabaseConnect"); // Connect to database

var router = express.Router();

router.get("/", async function (req, res, next) {
    // const queryNovel = await client.db("NAMS").collection("MANGAPAGES").findOne({ _id: DATABASE_NOVEL_DETAILS._id });
    // if (queryNovel == null) {
    //     const db1 = await client
    //         .db("NAMS")
    //         .collection("NOVELS")
    //         .insertOne(DATABASE_NOVEL_DETAILS)
    //         .catch((err) => {
    //             console.log("[SaveNovel] Error found trying to add new novel entry.", err);
    //         });
    // }

    res.send({ Response: "Sent!" });
    res.end();
});

module.exports = router;
