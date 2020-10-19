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

async function scrapeMangaDetails(source, url) {
    if (source == MangaSources.MangaKakalot.Source_Name) {
        let manga_url = `${MangaSources.MangaKakalot.Source_Url}${url}`;
        console.log(manga_url);
    }
}

async function saveAllManga(source) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source}`);
    console.log("Save all manga");
    if (source == MangaSources.MangaKakalot.Source_Name) {
        let page_number = 1;
        let MAX_PAGES = 2;
        await axios
            .get(`https://mangakakalot.tv/manga_list/?type=newest&category=all&state=all&page=${page_number}`)
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the response
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
                        manga_cover: "",
                        total_chapters: 0,
                        summary: [],
                    };
                    // Find the manga id
                    $("div.main-wrapper > div.leftCol.listCol > div > div > h3 > a").each(async (index, element) => {
                        await scrapeMangaDetails(source, $(element).attr("href"));
                    });
                })
                .catch((err) => {
                    console.log("Error");
                });
            page_number++;
        }
    }
}

module.exports = { addMangaPages, findMangaChapter, getMangaChapter, saveAllManga };
