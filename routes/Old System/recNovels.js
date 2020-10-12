/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("../database/database"); // Connect to database

async function getRecommended() {
    const novels = await client.db("NAMS").collection("novels");
    // Novel has to be on our database
    var novelsList = { novels: [] };

    await novels.find().forEach((cursor) => {
        novelsList.novels.push({ title: cursor.novel_title, novel_url: cursor.novel_url, cover_url: cursor.cover_url });
    });
    return novelsList;
}

var router = express.Router();

router.get("/", async function (req, res, next) {
    recNovels = await getRecommended();
    res.json(recNovels);
});

module.exports = router;
