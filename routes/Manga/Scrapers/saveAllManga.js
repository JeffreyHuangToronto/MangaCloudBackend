/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const DatabaseController = require("../../Database/DatabaseController");

var router = express.Router();

const { MangaSources } = require("../../Constants/Constants"); // Retrieve our constants
// const SOURCE = "MangaKakalot";
router.get("/", async function (req, res, next) {
    let source = req.query.source;
    if (!source in MangaSources) {
        res.send({ code: 404, message: "Invalid Source Detected" });
        res.end();
    }
    // DatabaseController.saveAllCompletedManga(source);
    DatabaseController.saveAllManga(source);
    res.send({ message: "Success, please wait while we update our database!" });
    res.end();
});

module.exports = router;
