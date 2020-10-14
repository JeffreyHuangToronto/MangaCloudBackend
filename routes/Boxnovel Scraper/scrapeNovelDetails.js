/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const api_url = process.env.API_URL || "http://localhost:3001";
var router = express.Router();

async function collectDetails($, novel_url) {
    var body = {
        _id: "",
        novel_title: "",
        novel_url: novel_url,
        cover_url: "",
        total_chapters: 0,
        summary: [],
    };
    // Database Novel Title
    body._id = url.parse(novel_url, true).pathname.split("/")[2];

    $("div.post-title > h3").each(async (index, element) => {
        // Working
        if ($(element).text != null) {
            body.novel_title = $(element).text().replace("NEW", "").replace("HOT", "").trim(" ");
        }
    });
    // Summary
    $("#editdescription > p").each(async (index, element) => {
        // Working
        if ($(element).text != null) {
            body.summary.push($(element).text().trim(" "));
        }
    });

    // Summary
    $("div.summary__content > p").each(async (index, element) => {
        if ($(element).text != null) {
            body.summary.push($(element).text().trim(" "));
        }
    });

    // Summary
    $("div.summary__content.show-more > div").each(async (index, element) => {
        if ($(element).text != null) {
            body.summary.push($(element).text().trim(" "));
        }
    });

    // Latest Chapter
    $("div.page-content-listing.single-page > div > ul > li:nth-child(1) > a").each(async (index, element) => {
        total_chapters = Number($(element).text().trim().split(" ")[1]);
        if (isNaN(total_chapters)) {
            body.total_chapters = 1;
        } else {
            body.total_chapters = total_chapters;
        }
    });

    // Novel Cover
    $("div.summary_image > a > img").each((index, element) => {
        body.cover_url = $(element).attr("src");
    });

    // If there is no cover use a not found image
    if (body.cover_url == null) {
        body.cover_url = "https://boxnovel.com/wp-content/uploads/2019/05/boxnovel-193x278.jpg";
    }
    // console.log("Body ID:", body._id);
    await axios.post(api_url + "/database/saveNovel", body).catch(function (error) {
        console.log("[ScrapeNovelDetails] Error found while sending request to save novel details.");
    });
}

/**
 *  If you call this you need a body with
 *  Novel URL: novel_url (https://boxnovel.com/novel/a-valiant-life/)
 */
router.post("/", async function (req, res, next) {
    novel_url = req.body.novel_url;
    if (novel_url == undefined || novel_url == null || novel_url == "" || typeof novel_url != "string") {
        res.end("No URL Provided");
        console.log("BAD URL PROVIDED");
        return;
    }

    await axios
        .get(req.body.novel_url)
        .then(async (response) => {
            await collectDetails(cheerio.load(response.data), req.body.novel_url);
        })
        .catch((err) => {
            console.log("[ScrapeNovelDetails] Error found while scraping novel details", err);
        });
    res.send("Received!");
});

module.exports = router;
