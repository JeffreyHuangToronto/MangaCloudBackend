/** @format */

const { default: Axios } = require("axios");
const { MangaSources } = require("../constants/constants");
const client = require("./DatabaseConnect"); // Connect to database

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

async function saveAllManga(source) {
    if (source == MangaSources.MangaKakalot) {
        while (true) {
            await axios
                .get(``)
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
                        res.send(schema);
                        await DatabaseController.addMangaPages(schema);
                    }
                })
                .catch((err) => {});
        }
    }
}

module.exports = { addMangaPages, findMangaChapter, getMangaChapter };
