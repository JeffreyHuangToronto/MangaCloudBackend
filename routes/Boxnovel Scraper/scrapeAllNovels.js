/** @format */

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");

const api_url = process.env.API_URL || "localhost:3001";

var router = express.Router();

router.get("/", async function (req, res, next) {
    const PAGES = 63; // Manually Found
    for (var i = 0; i <= PAGES; i++) {
        console.log("Looking at page", i);
        await axios
            .get(`https://boxnovel.com/novel/page/${i}/?m_orderby=alphabet`)
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the page
                // $("div.post-title > h5 > a").each(async (index, element) => {
                //     if ($(element).attr("href") != null) {
                //         const body = {
                //             novel_url: $(element).attr("href"),
                //         };
                //         // console.log("Sending Save:", body.novel_url);
                //         await axios.post(api_url + "/scrape/boxnovel/noveldetails", body).catch(function (error) {
                //             console.log("[ScrapeAllNovels1] Error found while sending request to scrape novel details.");
                //         });
                //     }
                // });
                $("div.post-title.font-title > h5 > a").each(async (index, element) => {
                    if ($(element).attr("href") != null) {
                        const body = {
                            novel_url: $(element).attr("href"),
                        };
                        // console.log("Sending Save:", body.novel_url);
                        await axios.post(api_url + "/scrape/boxnovel/noveldetails", body).catch(function (error) {
                            console.log("[ScrapeAllNovels2] Error found while sending request to scrape novel details.", error);
                        });
                    }
                });
            })
            .catch((err) => {
                console.log("[ScrapeAllNovels] Error found while trying to scrape all the novels from Boxnovel.");
            });
    }
    res.send("Received!");
});

module.exports = router;
