/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");

var router = express.Router();

router.get("/", async function (req, res, next) {
    const PAGES = 64; // Manually Found
    for (var i = 0; i < PAGES; i++) {
        await axios
            .get("https://boxnovel.com/page/" + i + "/?s&post_type=wp-manga&m_orderby=alphabet")
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page

                $("div.post-title.font-title > h5 > a").each(async (index, element) => {
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            await addNovelToDB($(element).attr("href"), novel_title_in_DB, novel_title);
                        }
                    }
                });
                // $("div.item-summary > div.post-title.font-title").each(async (index, element) => {
                //     if ($(element).attr("href") != null) {
                //         var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                //         var novel_title = $(element).text();
                //         console.log(novel_title);
                //         if (!(await recNovelInDB(novel_title_in_DB))) {
                //             addNovelToDB($(element).attr("href"), novel_title_in_DB, novel_title);
                //         }
                //     }
                // });
                $("div.post-title > h4 > a").each(async (index, element) => {
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        var novel_title = $(element).text();
                        console.log(novel_title);
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            addNovelToDB($(element).attr("href"), novel_title_in_DB, novel_title);
                        }
                    }
                });
                $("div.post-title > h5 > a").each(async (index, element) => {
                    if ($(element).attr("href") != null) {
                        var novel_title_in_DB = url.parse($(element).attr("href"), true).pathname.slice(1).split("/")[1];
                        var novel_title = $(element).text();
                        console.log(novel_title);
                        if (!(await recNovelInDB(novel_title_in_DB))) {
                            addNovelToDB($(element).attr("href"), novel_title_in_DB, novel_title);
                        }
                    }
                });
            })
            .catch((err) => {
                console.log("Error found:", err);
            });
    }
    res.send("Success");
});

module.exports = router;
