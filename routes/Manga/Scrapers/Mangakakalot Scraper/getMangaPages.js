/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const DatabaseController = require("../../../Database/DatabaseController");

var router = express.Router();

const { MangaSources } = require("../../../Constants/Constants"); // Retrieve our constants
// const SOURCE = "MangaKakalot";
router.get("/", async function (req, res, next) {
    res.end();
});

module.exports = router;
