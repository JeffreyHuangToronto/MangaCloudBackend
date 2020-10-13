/** @format */
// @TODO

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const client = require("../Database/connectDatabase"); // Connect to database

var router = express.Router();

async function getChapterDetails(novel_url, chapter_number) {
    // Return content if found
    let _id = url.parse(novel_url, true).pathname.split("/")[2] + "-chapter-" + chapter_number;
    var DATABASE_CHAPTER_DETAILS = {
        _id: _id,
        chapter_title: "",
        chapter_content: [],
    };
    console.log(novel_url);
    const queryChapter = await client.db("NAMS").collection("CHAPTERS").findOne({ _id: DATABASE_CHAPTER_DETAILS._id });
    if (queryChapter == null) {
        let chapter_url = novel_url + "chapter-" + chapter_number;
        // Do the scrape
        console.log(chapter_url);
        await axios.get(url.parse(chapter_url, true)).then(async (response) => {
            const $ = cheerio.load(response.data); // Load the page
            console.log("Scraping for chapter content!");
            // Get Chapter Title Working
            if ($("div.cha-tit > h3").text() != null) {
                DATABASE_CHAPTER_DETAILS.chapter_title = $("div > div.cha-tit > h3").text();
                // console.log($("div > div.cha-tit > h3").text());
            }
            // Get Paragraphs
            $("div.cha-content > div > p").each((index, p) => {
                let paragraph = $(p).text();
                // console.log(paragraph);
                DATABASE_CHAPTER_DETAILS.chapter_content.push(paragraph);
            });
        });

        console.log("Checking for bad input", DATABASE_CHAPTER_DETAILS.chapter_title, " - ", DATABASE_CHAPTER_DETAILS.chapter_content.length());
        if (DATABASE_CHAPTER_DETAILS.chapter_title == "") return {};
        if (DATABASE_CHAPTER_DETAILS.chapter_content.length() == 0) return {};

        console.log("Returning");
        const db1 = client
            .db("NAMS")
            .collection("CHAPTERS")
            .insertOne(DATABASE_CHAPTER_DETAILS)
            .catch((err) => {
                console.log("[GetChapter - Save] Error found trying to add new novel entry.", err);
            });

        return { chapter_title: DATABASE_CHAPTER_DETAILS.chapter_title, chapter_content: DATABASE_CHAPTER_DETAILS.chapter_content };
    } else {
        // We have the chapter in our database
        return { chapter_title: queryChapter.chapter_title, chapter_content: queryChapter.chapter_content };
    }
    // Otherwise scrape for it.
    // Scrape and send back the content
    // Save it to our database.
}

/**
 *  When you call this endpoint you need to provide a body with
 *  Novel URL: novel_url
 *  Chapter Number: chapter_number
 *  You will receieve a JSON object that contains
 *  {
 *      chapter_title: "The Chapter Title";
 *      chapter_content: ["P1", "P2", ...];
 *  }
 */
router.post("/", async function (req, res, next) {
    let novel_url = req.body.novel_url;
    let chapter_number = req.body.chapter_number;
    console.log(novel_url, chapter_number);
    // Find chapter in our database
    res.send(JSON.stringify(await getChapterDetails(novel_url, chapter_number)));
    res.end();
    // const db_novel_title = url.parse(req.body.url, true).pathname.split("/")[2];
    // const chapter_num = req.body.chapter_num;
    // Check if we need to add to database
    // console.log(req.body);
    // if (!(await novelInDB(db_novel_title))) {
    //     await axios
    //         .get(url.parse(req.body.url.toString(), true))
    //         .then(async (response) => {
    //             const $ = cheerio.load(response.data); // Load the page
    //             novel_details = {
    //                 novel_title: req.body.novel_title,
    //                 db_novel_title: db_novel_title,
    //                 novel_url: req.body.url,
    //                 total_chapters: 0,
    //                 summary: [],
    //                 cover_url: "https://www.grouphealth.ca/wp-content/uploads/2018/05/placeholder-image-300x225.png",
    //             };
    //             // -- Chapter Info -- //
    //             // Get Total Chapters
    //             novel_details.total_chapters = Number($(".wp-manga-chapter").first().text().trim().split(" ")[1]);
    //             // Get Summary
    //             $("#editdescription").each((index, element) => {
    //                 novel_details.summary.push($(element).text());
    //             });
    //             // Get cover_url
    //             $("div.summary_image > a > img").each((index, element) => {
    //                 novel_details.cover_url = $(element).attr("src");
    //             });
    //             // -- Chapter Info End -- //
    //             await addNewNovel(novel_details);
    //         })
    //         .catch((err) => {
    //             console.log("Error found:", err);
    //         });
    // }
    // // We now have a database entry
    // // Time to add chapters i < schema.total_chapters + 1
    // while (!(await novelInDB(db_novel_title))) {}
    // let chapter_url;
    // if (SAVE_ALL_CONTENT) {
    //     for (let i = 1; i < schema.total_chapters + 1; i++) {
    //         chapter_url = req.body.url.toString() + "/chapter-" + i;
    //         await saveChapter(chapter_url, chapter_num, db_novel_title);
    //     }
    // } else {
    //     chapter_url = req.body.url.toString() + "/chapter-" + chapter_num;
    //     await saveChapter(chapter_url, chapter_num, db_novel_title);
    // }
    // res.send(JSON.stringify(await parseChapter(db_novel_title, chapter_num)));
    // res.end();
});

module.exports = router;

// async function parseChapter(db_novel_title, chapter_num) {
//     const chapter = await client.db("NAMS").collection("chapters").findOne({ db_novel_title: db_novel_title, chapter: chapter_num });
//     // Novel has to be on our database
//     if (chapter_num == 0) {
//         // Summary
//         const novel = await client.db("NAMS").collection("novels").findOne({ db_novel_title: db_novel_title });
//         return {
//             content: novel.summary,
//             chapter_title: novel.total_chapters,
//         };
//     }
//     return {
//         content: chapter.content,
//         chapter_title: chapter.chapter_title,
//     };
// }

// async function saveChapter(chapter_url, chapter_num, db_novel_title) {
//     // The novel url base no /chapter-1/

//     if (!(await chapterInDB(db_novel_title, chapter_num))) {
//         // Chapter is not in database
//         await axios
//             .get(url.parse(chapter_url, true))
//             .then(async (response) => {
//                 const $ = cheerio.load(response.data); // Load the page

//                 chapterObject = {
//                     novel_title: db_novel_title,
//                     chapter_title: "",
//                     paragraphs: [],
//                 };

//                 // Get Chapter Title
//                 if ($("div.reading-content > div > div.panel-heading").text() != null) {
//                     chapterObject.chapter_title = $("div.reading-content > div > div.panel-heading").text();
//                 } else if ($("div.reading-content > div > h3").text() == null) {
//                     chapterObject.chapter_title = $("h4", ".reading-content").text();
//                 } else {
//                     console.log("Couldn't Find Chapter Title");
//                 }

//                 // Get Paragraphs
//                 $("p", ".reading-content").each((index, p) => {
//                     const paragraph = $(p).text();
//                     chapterObject.paragraphs.push(paragraph);
//                 });
//                 await addChapterDetails(chapterObject, chapter_num);
//             })
//             .catch((err) => {
//                 console.log("Error found:", err);
//             });
//     }
// }

// const schema = {
//     novel_title: "",
//     db_novel_title: "",
//     cover_url: "",
//     total_chapters: 0,
//     summary: [],
// };

// async function chapterInDB(novel_title, chapter_num) {
//     query = {
//         db_novel_title: novel_title,
//         chapter: chapter_num,
//     };

//     const chapter = await client.db("NAMS").collection("chapters").findOne(query);

//     if (!chapter) {
//         // The chapter is not in our database.
//         return false;
//     }
//     // The chapter is in our database.
//     return true;
// }

// async function addChapterDetails(chapt, chapter_num) {
//     // Adding

//     const chapter_details = {
//         novel_title: chapt.novel_title,
//         chapter_title: chapt.chapter_title,
//         chapter: chapter_num,
//         content: chapt.paragraphs,
//     };
//     await client.db("NAMS").collection("chapters").insertOne(chapter_details);
// }
