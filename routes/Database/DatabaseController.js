/** @format */

const { default: Axios } = require("axios");
const { MangaSources } = require("../constants/constants");
const client = require("./DatabaseConnect"); // Connect to database

const axios = require("axios");
const cheerio = require("cheerio");

async function addMangaPages(schema) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${schema.source} Chapters`);
    // const CollectionManga = Db.collection(`${source}`);
    const mangaChapter = await Collection.findOne({ _id: schema._id });

    console.log("Schema", schema);

    // Check if there is
    if (mangaChapter == null) {
        console.log("Create a new database entry");
        // Create a new entry
        await Collection.insertOne(schema).catch((err) => {
            console.log("Error adding manga pages");
        });
    }
}

// Return true if found false otherwise
async function findMangaChapter(source, manga_id, chapter_index) {
    const Db = client.db("Manga");
    const CollectionManga = Db.collection(`${source}`);

    // console.log();
    let manga = await CollectionManga.findOne({ _id: manga_id });
    // console.log(manga.chapters);
    let chapter_num = manga.chapters[chapter_index];
    let _id = `${manga_id}-chapter-${chapter_num}`;

    const CollectionChapters = Db.collection(`${source} Chapters`);
    const mangaChapter = await CollectionChapters.findOne({ _id: _id });

    return mangaChapter != null;
}

async function getMangaChapter(source, manga_id, chapter_index) {
    const Db = client.db("Manga");
    const CollectionChapters = Db.collection(`${source} Chapters`);
    const CollectionManga = Db.collection(`${source}`);

    // CollectionManga.findOne({ _id: manga_id });

    let manga = await CollectionManga.findOne({ _id: manga_id });
    let chapter_num = manga.chapters[chapter_index];
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
                        if (isNaN(Number($(element).attr("href").split("chapter_")[1]))) {
                            console.log("Found one that is not a number", $(element).attr("href"));
                        }
                        schema.chapters.push(Number($(element).attr("href").split("chapter_")[1]));
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
                        // console.log($(element).attr("href").split("chapter_")[1]);
                        if (isNaN(Number($(element).attr("href").split("chapter_")[1]))) {
                            console.log("Found one that is not a number", $(element).attr("href"));
                        }
                        schema.chapters.push(Number($(element).attr("href").split("chapter_")[1]));
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
                        schema.chapters.push(Number($(element).attr("href").split("chapter_")[1]));
                    });

                    schema.chapters.reverse();
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
                        schema.chapters.push(Number($(element).attr("href").split("chapter_")[1]));
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

        while (page_number <= MAX_PAGES) {
            await axios
                .get(`https://mangakakalot.tv/manga_list/?type=newest&category=all&state=all&page=${page_number}`)
                .then(async (response) => {
                    const $ = cheerio.load(response.data); // Load the response
                    console.log(`Loaded page: ${page_number}`);
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
async function getMangaInfo(source, manga_id) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source}`);

    var cursor;

    // if (allCompletedMangaList.length == 0) {
    await Collection.find({ _id: manga_id }).forEach((manga) => {
        cursor = manga;
    });
    // }
    return cursor;
}

var allCompletedMangaList = [];

async function getCompletedManga(source, page) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source} Completed`);
    if (page == null) {
        page = 0;
    }
    // console.log(Collection.find());
    let completedMangaList = [];

    console.log("Before");
    if (allCompletedMangaList.length == 0) {
        console.log("There's no completed list on the server!");
        await Collection.find().forEach((manga) => {
            allCompletedMangaList.push(manga);
        });
    }

    console.log("After");

    for (var i = page * 25; i < page * 25 + 25; i++) {
        completedMangaList.push(allCompletedMangaList[i]);
    }

    return completedMangaList;
}

async function search(source, query) {
    const Db = client.db("Manga");
    const Collection = Db.collection(`${source}`);

    let searchResults = [];
    await Collection.find({ $text: { $search: query } }).forEach((manga) => {
        searchResults.push(manga);
    });

    return searchResults;
}

module.exports = {
    getMangaInfo,
    addMangaPages,
    findMangaChapter,
    getMangaChapter,
    saveAllManga,
    addManga,
    saveAllCompletedManga,
    getCompletedManga,
    search,
};
