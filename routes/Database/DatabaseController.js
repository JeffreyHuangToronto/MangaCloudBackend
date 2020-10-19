/** @format */

const { default: Axios } = require("axios");
const { MangaSources } = require("../constants/constants");
const client = require("./DatabaseConnect"); // Connect to database

const axios = require("axios");
const cheerio = require("cheerio");

async function addMangaPages(schema) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${schema.source} Chapters`);
    const CollectionManga = Db.collection(`${source}`);
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
    const CollectionChapters = Db.collection(`${source} Chapters`);
    const CollectionManga = Db.collection(`${source}`);

    // console.log();
    let manga = await CollectionManga.findOne({ _id: manga_id });
    // console.log(manga.chapters);
    let chapter_num = manga.chapters[chapter_number - 1];
    let _id = `${manga_id}-chapter-${chapter_num}`;

    const mangaChapter = await CollectionChapters.findOne({ _id: _id });

    return mangaChapter != null;
}

async function getMangaChapter(source, manga_id, chapter_number) {
    const Db = client.db("Manga");
    const CollectionChapters = Db.collection(`${source} Chapters`);
    const CollectionManga = Db.collection(`${source}`);

    // CollectionManga.findOne({ _id: manga_id });

    let manga = await CollectionManga.findOne({ _id: manga_id });
    let chapter_num = manga.chapters[chapter_number - 1];
    let _id = `${manga_id}-chapter-${chapter_num}`;

    const mangaChapter = await CollectionChapters.findOne({ _id: _id });
    // console.log("MangaChapter", mangaChapter);
    return mangaChapter;
}

async function addManga(source, title, id, summary) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source}`);

    if (source == MangaSources.MangaKakalot.Source_Name) {
        let manga_url = `${MangaSources.MangaKakalot.Source_Url}/manga/${id}`;
        // console.log(manga_url);
        let manga = await Collection.findOne({ _id: id });

        if (manga == null) {
            await axios
                .get(`${manga_url}`)
                .then(async (response) => {
                    const $ = cheerio.load(response.data); // Load the response

                    let schema = {
                        _id: id,
                        manga_title: title,
                        chapters: [],
                        summary: summary,
                    };

                    $("div.chapter-list > div > span > a").each(async (index, element) => {
                        let c = $(element).text().trim().replace(":", "").split(" ");
                        let indexOfChapterNumber = c.indexOf("Chapter") + 1;
                        // Get each chapter number
                        // console.log();
                        schema.chapters.push(Number(c[indexOfChapterNumber]));
                    });

                    schema.chapters.reverse();
                    // console.log(schema.chapters);
                    await Collection.insertOne(schema).catch((err) => {
                        console.log(err);
                    });
                })
                .catch((err) => {});
        } else {
            await axios
                .get(`${manga_url}`)
                .then(async (response) => {
                    const $ = cheerio.load(response.data); // Load the response

                    let schema = {
                        _id: id,
                        manga_title: title,
                        chapters: [],
                        summary: summary,
                    };

                    $("div.chapter-list > div > span > a").each(async (index, element) => {
                        let c = $(element).text().trim().replace(":", "").split(" ");
                        let indexOfChapterNumber = c.indexOf("Chapter") + 1;
                        // Get each chapter number
                        // console.log();
                        schema.chapters.push(Number(c[indexOfChapterNumber]));
                    });

                    schema.chapters.reverse();
                    await Collection.updateOne({ _id: id }, { $set: { chapters: schema.chapters } }).catch((err) => {
                        console.log(err);
                    });
                })
                .catch((err) => {});
        }
    }
}
async function addCompletedManga(source, title, id, summary) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source} Completed`);

    if (source == MangaSources.MangaKakalot.Source_Name) {
        let manga_url = `${MangaSources.MangaKakalot.Source_Url}/manga/${id}`;
        // console.log(manga_url);
        let manga = await Collection.findOne({ _id: id });

        if (manga == null) {
            await axios
                .get(`${manga_url}`)
                .then(async (response) => {
                    const $ = cheerio.load(response.data); // Load the response

                    let schema = {
                        _id: id,
                        manga_title: title,
                        chapters: [],
                        summary: summary,
                    };

                    $("div.chapter-list > div > span > a").each(async (index, element) => {
                        let c = $(element).text().trim().replace(":", "").split(" ");
                        let indexOfChapterNumber = c.indexOf("Chapter") + 1;
                        // Get each chapter number
                        // console.log();
                        schema.chapters.push(Number(c[indexOfChapterNumber]));
                    });

                    schema.chapters.reverse();
                    // console.log(schema.chapters);
                    await Collection.insertOne(schema).catch((err) => {
                        console.log(err);
                    });
                })
                .catch((err) => {});
        } else {
            await axios
                .get(`${manga_url}`)
                .then(async (response) => {
                    const $ = cheerio.load(response.data); // Load the response

                    let schema = {
                        _id: id,
                        manga_title: title,
                        chapters: [],
                        summary: summary,
                    };

                    $("div.chapter-list > div > span > a").each(async (index, element) => {
                        let c = $(element).text().trim().replace(":", "").split(" ");
                        let indexOfChapterNumber = c.indexOf("Chapter") + 1;
                        // Get each chapter number
                        // console.log();
                        schema.chapters.push(Number(c[indexOfChapterNumber]));
                    });

                    schema.chapters.reverse();
                    await Collection.updateOne({ _id: id }, { $set: { chapters: schema.chapters } }).catch((err) => {
                        console.log(err);
                    });
                })
                .catch((err) => {});
        }
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
                    // body > div.container > div.main-wrapper >
                    let titles = [];
                    let manga_ids = [];
                    let summarys = [];
                    // let total_chapters = [];
                    // Find the manga id
                    $("div.leftCol.listCol > div > div > h3 > a").each(async (index, element) => {
                        // console.log($(element).text());
                        titles.push($(element).attr("title"));
                        manga_ids.push($(element).attr("href").replace("/manga/", ""));
                    });
                    // $("div.leftCol.listCol > div > div > a.list-story-item-wrap-chapter").each(async (index, element) => {
                    //     console.log($(element).text().split("Chapter")[1].split(":")[0]);
                    //     // total_chapters.push(Number($(element).text()));
                    //     // titles.push($(element).attr("title"));
                    //     // manga_ids.push($(element).attr("href").replace("/manga/", ""));
                    // });

                    $("div.leftCol.listCol > div > div > p").each(async (index, element) => {
                        if (index != 0) {
                            summarys.push($(element).text().trim());
                        }
                    });
                    for (var i = 0; i < titles.length; i++) {
                        addManga(source, titles[i], manga_ids[i], summarys[i]);
                    }
                })
                .catch((err) => {
                    console.log("Error", err);
                });
            page_number++;
        }
    }
}
async function saveAllCompletedManga(source) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source}`);
    console.log("Save all manga");
    if (source == MangaSources.MangaKakalot.Source_Name) {
        let page_number = 1;
        let MAX_PAGES = 2;
        await axios
            .get(`https://mangakakalot.tv/manga_list/?type=newest&category=all&state=Completed&page=${page_number}`)
            .then(async (response) => {
                const $ = cheerio.load(response.data); // Load the response
                $("div.group_page > a.page_blue.page_last").each(async (index, element) => {
                    MAX_PAGES = Number($(element).text().replace("Last(", "").replace(")", ""));
                    // console.log($(element).text().replace("Last(", "").replace(")", ""));
                });
            })
            .catch((err) => {});

        // console.log(MAX_P)
        console.log(page_number, MAX_PAGES);
        while (page_number <= MAX_PAGES) {
            await axios
                .get(`https://mangakakalot.tv/manga_list/?type=newest&category=all&state=Completed&page=${page_number}`)
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
                    // body > div.container > div.main-wrapper >
                    let titles = [];
                    let manga_ids = [];
                    let summarys = [];
                    // let total_chapters = [];
                    // Find the manga id
                    $("div.leftCol.listCol > div > div > h3 > a").each(async (index, element) => {
                        // console.log($(element).text());
                        titles.push($(element).attr("title"));
                        manga_ids.push($(element).attr("href").replace("/manga/", ""));
                    });
                    // $("div.leftCol.listCol > div > div > a.list-story-item-wrap-chapter").each(async (index, element) => {
                    //     console.log($(element).text().split("Chapter")[1].split(":")[0]);
                    //     // total_chapters.push(Number($(element).text()));
                    //     // titles.push($(element).attr("title"));
                    //     // manga_ids.push($(element).attr("href").replace("/manga/", ""));
                    // });

                    $("div.leftCol.listCol > div > div > p").each(async (index, element) => {
                        if (index != 0) {
                            summarys.push($(element).text().trim());
                        }
                    });
                    for (var i = 0; i < titles.length; i++) {
                        addCompletedManga(source, titles[i], manga_ids[i], summarys[i]);
                    }
                })
                .catch((err) => {
                    console.log("Error", err);
                });
            page_number++;
        }
    }
}

async function getCompletedManga(source) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source} Completed`);

    // console.log(Collection.find());
    var completedMangaList = [];

    await Collection.find().forEach((manga) => {
        completedMangaList.push(manga);
    });

    return completedMangaList;
}

module.exports = { addMangaPages, findMangaChapter, getMangaChapter, saveAllManga, addManga, saveAllCompletedManga, getCompletedManga };
