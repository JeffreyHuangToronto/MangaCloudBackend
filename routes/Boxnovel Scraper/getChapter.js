/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("../Database/connectDatabase"); // Connect to database

var router = express.Router();

async function getChapterDetails(novel_url, chapter_number) {
    // Return content if found
    let novel_id = url.parse(novel_url, true).pathname.split("/")[2];
    let _id = novel_id + "-chapter-" + chapter_number;
    var DATABASE_CHAPTER_DETAILS = {
        _id: _id,
        chapter_title: "",
        chapter_content: [],
    };
    console.log(novel_url);
    const queryChapter = await client.db("NAMS").collection("CHAPTERS").findOne({ _id: DATABASE_CHAPTER_DETAILS._id });
    if (queryChapter == null) {
        let chapter_url = novel_url + "chapter-" + chapter_number;
        const queryNovel = await client.db("NAMS").collection("NOVELS").findOne({ _id: novel_id });

        // Do the scrape
        // console.log(chapter_url);
        if (queryNovel.total_chapters == 1) {
            var new_url;
            await axios.get(url.parse(novel_url, true)).then(async (response) => {
                const $ = cheerio.load(response.data);
                $("div.page-content-listing.single-page > div > ul > li > a").each(async (index, element) => {
                    // DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
                    if ($(element).attr("href") != null) {
                        new_url = $(element).attr("href");
                    }
                });
            });
            await axios.get(new_url).then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page
                await scrapeContent(DATABASE_CHAPTER_DETAILS, $);
            });
        } else {
            await axios.get(url.parse(chapter_url, true)).then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page
                await scrapeContent(DATABASE_CHAPTER_DETAILS, $);
            });
        }

        // console.log("Checking for bad input - Title: |", DATABASE_CHAPTER_DETAILS.chapter_title, "|");
        if (DATABASE_CHAPTER_DETAILS.chapter_title == "") {
            DATABASE_CHAPTER_DETAILS.chapter_title = `Chapter ${chapter_number}`;
        }
        if (DATABASE_CHAPTER_DETAILS.chapter_content.length == 0) return { Error: "We could not find the content." };
        // console.log("Seems like we don't have any bad input.");
        // console.log("Adding chapter to our database -", DATABASE_CHAPTER_DETAILS.chapter_title, "Chapter", chapter_number);
        // client
        //     .db("NAMS")
        //     .collection("CHAPTERS")
        //     .insertOne(DATABASE_CHAPTER_DETAILS)
        //     .catch((err) => {
        //         console.log("[GetChapter - Save] Error found trying to add new novel entry.", err);
        //     });

        // console.log("Returning scraped content.");
        return { chapter_title: DATABASE_CHAPTER_DETAILS.chapter_title, chapter_content: DATABASE_CHAPTER_DETAILS.chapter_content };
    } else {
        // We have the chapter in our database
        return { chapter_title: queryChapter.chapter_title, chapter_content: queryChapter.chapter_content };
    }
}

async function scrapeContent(DATABASE_CHAPTER_DETAILS, $) {
    // Get Chapter Title 1
    if ($("div.cha-tit > h3").text() != "") {
        DATABASE_CHAPTER_DETAILS.chapter_title = $("div > div.cha-tit > h3").text();
        // console.log("Chapter Title Selector 1: ", $("div > div.cha-tit > h3").text());
    }
    // Get Chapter Title 2
    if ($("div.reading-content > div > p:nth-child(1) > strong").text() != "") {
        DATABASE_CHAPTER_DETAILS.chapter_title = $("div.reading-content > div > p:nth-child(1) > strong").text();
        // console.log("Chapter Title Selector 2: ", $("div.reading-content > div > p:nth-child(1) > strong").text());
    }

    // Get Chapter Title 3
    if ($("div.cha-tit.skiptranslate > div > h3").text() != "") {
        DATABASE_CHAPTER_DETAILS.chapter_title = $("div.cha-tit.skiptranslate > div > h3").text();
        // console.log("Chapter Title Selector 3: ", $("div.cha-tit.skiptranslate > div > h3").text());
    }

    // Get Chapter Title 4
    if ($("div.reading-content > div > h1").text() != "") {
        DATABASE_CHAPTER_DETAILS.chapter_title = $("div.reading-content > div > h1").text();
        // console.log("Chapter Title Selector 4: ", $("div.reading-content > div > h1").text());
    }
    // Get Paragraphs
    $("div.cha-content > div > p").each((index, p) => {
        let paragraph = $(p).text();
        DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
    });

    // Get Paragraphs
    $("div.reading-content > div > p").each((index, p) => {
        let paragraph = $(p).text();
        DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
    });

    // Get Paragraphs
    $("div.reading-content > div > div.cha-content > div").each((index, p) => {
        let paragraph = $(p).text();
        DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
    });

    // Get Paragraphs
    $("div.reading-content > div > div > p").each((index, p) => {
        let paragraph = $(p).text();
        DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
    });
}

/**
 *  When you call this endpoint you need to provide a body with
 *  Novel URL: novel_url
 *  Chapter Number: chapter_number
 *  You will receieve a JSON object that contains
 *  {
 *      chapter_title: "The Chapter Title";
 *      chapter_content: ["P1", "P2", ...];
 *  }
 */
router.post("/", async function (req, res, next) {
    let novel_url = req.body.novel_url;
    let chapter_number = req.body.chapter_number;
    // console.log(novel_url, chapter_number);
    // Find chapter in our database

    res.send(JSON.stringify(await getChapterDetails(novel_url, chapter_number)));
    res.end();
});

module.exports = router;
