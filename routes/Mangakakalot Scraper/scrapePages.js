/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("../Database/DatabaseConnect"); // Connect to database

var router = express.Router();
// async function scrapeContent(DATABASE_CHAPTER_DETAILS, $) {
//     // Get Chapter Title 1
//     if ($("div.cha-tit > h3").text() != "") {
//         DATABASE_CHAPTER_DETAILS.chapter_title = $("div > div.cha-tit > h3").text();
//         // console.log("Chapter Title Selector 1: ", $("div > div.cha-tit > h3").text());
//     }
//     // Get Chapter Title 2
//     if ($("div.reading-content > div > p:nth-child(1) > strong").text() != "") {
//         DATABASE_CHAPTER_DETAILS.chapter_title = $("div.reading-content > div > p:nth-child(1) > strong").text();
//         // console.log("Chapter Title Selector 2: ", $("div.reading-content > div > p:nth-child(1) > strong").text());
//     }

//     // Get Chapter Title 3
//     if ($("div.cha-tit.skiptranslate > div > h3").text() != "") {
//         DATABASE_CHAPTER_DETAILS.chapter_title = $("div.cha-tit.skiptranslate > div > h3").text();
//         // console.log("Chapter Title Selector 3: ", $("div.cha-tit.skiptranslate > div > h3").text());
//     }

//     // Get Chapter Title 4
//     if ($("div.reading-content > div > h1").text() != "") {
//         DATABASE_CHAPTER_DETAILS.chapter_title = $("div.reading-content > div > h1").text();
//         // console.log("Chapter Title Selector 4: ", $("div.reading-content > div > h1").text());
//     }
//     // Get Paragraphs
//     $("div.cha-content > div > p").each((index, p) => {
//         let paragraph = $(p).text();
//         DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
//     });

//     // Get Paragraphs
//     $("div.reading-content > div > p").each((index, p) => {
//         let paragraph = $(p).text();
//         DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
//     });

//     // Get Paragraphs
//     $("div.reading-content > div > div.cha-content > div").each((index, p) => {
//         let paragraph = $(p).text();
//         DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
//     });

//     // Get Paragraphs
//     $("div.reading-content > div > div > p").each((index, p) => {
//         let paragraph = $(p).text();
//         DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
//     });
// }

/**
 * This endpoint will scrape for the manga pages given
 */
router.get("/", async function (req, res, next) {
    let chapter_number = req.query.chapter_number;
    let manga_name = req.query.manga_id; // Manga ID will be the name like so, i.e saikyou_no_shuzoku_ga_ningen_datta_ken, mq918999
    console.log("Chapter Number: ", chapter_number);
    console.log(`https://mangakakalot.tv/chapter/saikyou_no_shuzoku_ga_ningen_datta_ken/chapter_${chapter_number.toString()}`);
    await axios
        .get(`https://mangakakalot.tv/chapter/saikyou_no_shuzoku_ga_ningen_datta_ken/chapter_${chapter_number.toString()}`)
        .then(async (response) => {
            const $ = cheerio.load(response.data);

            $("body > div:nth-child(2) > div > div > p > span:nth-child(4) > a > span").each(async (index, element) => {
                // DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
                console.log(`Title: ${$(element).text()}`);
                console.log(`Chapter: ${chapter_number}}`);
            });

            $("#vungdoc > img").each(async (index, element) => {
                // DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
                console.log($(element).attr("data-src"));
            });
        });

    res.send({ Response: "Sent!" });
    res.end();
});

module.exports = router;
