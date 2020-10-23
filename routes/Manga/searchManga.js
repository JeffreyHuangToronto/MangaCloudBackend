/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const DatabaseController = require("../Database/DatabaseController");

var router = express.Router();

const { MangaSources } = require("../Constants/Constants"); // Retrieve our constants
// const SOURCE = "MangaKakalot";
router.get("/", async function (req, res, next) {
    let source = req.query.source;
    let query = req.query.search_query;
    if (!source in MangaSources) {
        res.send({ code: 404, message: "Invalid Source Detected" });
        res.end();
    }
    res.send(await DatabaseController.search(source, query));
    res.end();
});

module.exports = router;
