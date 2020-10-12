/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const api_url = process.env.API_URL || "http://250e62977aa7.ngrok.io";
var router = express.Router();

/**
 *  If you call this you need a body with
 *  Novel URL: novel_url (https://boxnovel.com/novel/a-valiant-life/)
 */
router.get("/", async function (req, res, next) {
    let novel_url = req.body.novel_url;
    if (novel_url == null || novel_url == "" || typeof novel_url != "string") res.end("No URL Provided");

    await axios
        .get(novel_url)
        .then(async (response) => {
            const $ = cheerio.load(response.data); // Load the page
            let novel_title, db_novel_title, summary, chapters, cover_url;

            // Database Novel Title
            db_novel_title = url.parse(novel_url, true).pathname.split("/")[2];

            // Novel Title
            $("div.post-title > h3").each(async (index, element) => {
                // Working
                if ($(element).text != null) {
                    novel_title = $(element).text().trim(" ");
                    // console.log(novel_title);
                }
            });
            // Synposis
            $("#editdescription > p").each(async (index, element) => {
                // Working
                if ($(element).text != null) {
                    summary = $(element).text().trim(" ");
                    // console.log(summary);
                }
            });

            // Synopsis
            $("div.summary__content > p").each(async (index, element) => {
                // console.log("Element: ", $(element).text());
                if ($(element).text != null) {
                    summary = $(element).text().trim(" ");
                    // console.log(`Summary: ${summary}`);
                }
            });

            // Latest Chapter
            $("div.page-content-listing.single-page > div > ul > li:nth-child(1) > a").each(async (index, element) => {
                // console.log("LATEST CHAPTER:", isNaN($(element).text().trim().split(" ")[1]));
                chapters = Number($(element).text().trim().split(" ")[1]);

                if (isNaN(chapters)) {
                    chapters = 1;
                }
                console.log(`Chapters: ${chapters}`);
            });

            // Novel Cover
            $("div.summary_image > a > img").each((index, element) => {
                cover_url = $(element).attr("src");
                console.log(`Cover URL: ${cover_url}`);
            });

            // If there is no cover use a not found image
            if (cover_url == null) {
                cover_url = "https://boxnovel.com/wp-content/uploads/2019/05/boxnovel-193x278.jpg";
            }

            body = {
                novel_title: novel_title,
                db_novel_title: db_novel_title,
                cover_url: cover_url,
                total_chapters: chapters,
                summary: summary,
            };
            await axios
                .post(api_url + "/database/saveNovel", body)
                .then((response) => {
                    return JSON.stringify(response.data);
                })
                .catch(function (error) {
                    console.log("Error", error);
                });
        })
        .catch((err) => {
            console.log("Error Found While Scraping Novel Details");
        });
    res.send("Success");
});

module.exports = router;
