/** @format */

const { default: Axios } = require("axios");
const { MangaSources } = require("../constants/constants");
const client = require("./DatabaseConnect"); // Connect to database

const axios = require("axios");
const cheerio = require("cheerio");

async function addMangaPages(schema) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${schema.source} Chapters`);

    const mangaChapter = await Collection.findOne({ _id: schema._id });

    console.log("Schema", schema);

    // Check if there is
    if (mangaChapter == null) {
        console.log("Create a new database entry");
        // Create a new entry
        await Collection.insertOne(schema).catch(() => {
            console.log("Error adding manga pages");
        });
    }
}

// Return true if found false otherwise
async function findMangaChapter(source, manga_id, chapter_number) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source} Chapters`);

    let _id = `${manga_id}-chapter-${chapter_number}`;

    const mangaChapter = await Collection.findOne({ _id: _id });
    console.log(mangaChapter != null);
    return mangaChapter != null;
}

async function getMangaChapter(source, manga_id, chapter_number) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source} Chapters`);

    let _id = `${manga_id}-chapter-${chapter_number}`;

    const mangaChapter = await Collection.findOne({ _id: _id });
    console.log("MangaChapter", mangaChapter);
    return mangaChapter;
}

async function scrapeMangaDetails() {}

async function saveAllManga(source) {
    if (source == MangaSources.MangaKakalot) {
        let page_number = 1;
        let MAX_PAGES = 2;
        await axios
            .get(`https://mangakakalot.tv/manga_list/?type=newest&category=all&state=all&page=${page_number}`)
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the response
                // Find the manga pages

                $("div.group_page > a.page_blue.page_last").each(async (index, element) => {
                    MAX_PAGES = Number($(element).text().replace("Last(", "").replace(")", ""));
                });
            })
            .catch((err) => {});

        while (page_number <= 1) {
            await axios
                .get(`https://mangakakalot.tv/manga_list/?type=newest&category=all&state=all&page=${page_number}`)
                .then(async (response) => {
                    const $ = cheerio.load(response.data); // Load the response

                    let schema = {
                        manga_id: "",
                        source: source,
                        manga_title: "",
                        chapters: [],
                        summary: [],
                    };

                    // Find the manga pages
                    $("#vungdoc > img").each(async (index, element) => {
                        schema.manga_pages.push($(element).attr("data-src"));
                    });

                    scrapeMangaDetails();

                    // Set the number of pages found
                    schema.number_of_manga_pages = schema.manga_pages.length;
                    // Validate that we found all that we wanted
                    if (schema.manga_title == "" || !(schema.source in MangaSources) || chapter_number < 0 || schema.number_of_manga_pages == 0) {
                        // This means that we coulnd't find either manga title or manga pages or we entered a bad chapter number or it means the page was not found
                        throw new Error();
                    } else {
                        // We have everything we were looking for.
                        res.send(schema);
                        await DatabaseController.addMangaPages(schema);
                    }
                })
                .catch((err) => {});
            page_number++;
        }
    }
}

module.exports = { addMangaPages, findMangaChapter, getMangaChapter, saveAllManga };
