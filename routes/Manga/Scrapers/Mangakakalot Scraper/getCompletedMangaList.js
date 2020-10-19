/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");

const DatabaseController = require("../../../Database/DatabaseController");

var router = express.Router();

const { MangaSources } = require("../../../Constants/Constants"); // Retrieve our constants
// const SOURCE = "MangaKakalot";
router.get("/", async function (req, res, next) {
    let source = req.query.source;
    let page = req.query.page;
    res.send(await DatabaseController.getCompletedManga(source, page));
    res.end();
});

module.exports = router;
