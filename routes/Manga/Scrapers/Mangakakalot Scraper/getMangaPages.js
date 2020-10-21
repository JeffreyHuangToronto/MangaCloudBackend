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
    let source = MangaSources.MangaKakalot.Source_Name;
    let manga_id = req.query.manga_id;
    let chapter_number = req.query.chapter_number;

    if (!(await DatabaseController.findMangaChapter(source, manga_id, chapter_number))) {
        // Can't find the chapter
        await scrapeChapter(source, manga_id, chapter_number, res);
    } else {
        // Return the data in the database
        res.send(await DatabaseController.getMangaChapter(source, manga_id, chapter_number));
    }
    res.end();
});

async function scrapeChapter(source, manga_id, chapter_number, res) {
    await axios
        .get(`https://mangakakalot.tv/chapter/${manga_id}/chapter_${chapter_number.toString()}`)
        .then(async (response) => {
            const $ = cheerio.load(response.data); // Load the response

            let schema = {
                _id: `${manga_id}-chapter-${chapter_number}`,
                source: source,
                manga_id: manga_id,
                manga_title: "",
                manga_pages: [],
                number_of_manga_pages: 0,
                chapter_number: Number(chapter_number),
            };

            // Find the manga title
            $("body > div:nth-child(2) > div > div > p > span:nth-child(4) > a > span").each(async (index, element) => {
                schema.manga_title = $(element).text();
            });

            // Find the manga pages
            $("#vungdoc > img").each(async (index, element) => {
                schema.manga_pages.push($(element).attr("data-src"));
            });
            // Set the number of pages found
            schema.number_of_manga_pages = schema.manga_pages.length;
            // Validate that we found all that we wanted
            if (schema.manga_title == "" || !(schema.source in MangaSources) || chapter_number < 0 || schema.number_of_manga_pages == 0) {
                // This means that we coulnd't find either manga title or manga pages or we entered a bad chapter number or it means the page was not found
                throw new Error();
            } else {
                // We have everything we were looking for.
                DatabaseController.addMangaPages(schema);
                res.send(schema);
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(404);
            res.send({
                code: 404,
                message:
                    "It seems that the url was invalid, please check the manga_id to see if it's correct and chapter_number and see if the chapter exists.",
            });
        });
}

module.exports = router;
