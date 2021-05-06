/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");

const DatabaseController = require("../../../Database/DatabaseController");

var router = express.Router();

const { MangaSources } = require("../../../Constants/Constants"); // Retrieve our constants

router.get("/", async function (req, res, next) {
    // let source = MangaSources.MangaKakalot.Source_Name;
    let manga_id = req.query.manga_id;

    let manga = await DatabaseController.getMangaById(manga_id);

    console.log(manga);
    if (!manga) {
        res.status(404);
        res.end();
    }
    res.json(manga[0]);
    res.end();
});

module.exports = router;
