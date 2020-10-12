/** @format */

// /** @format */

// const express = require("express");
// const axios = require("axios");
// const cheerio = require("cheerio");
// const { MongoClient } = require("mongodb");
// const url = require("url");
// const { json } = require("express");
// /**
//  * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
//  * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
//  */
// const uri = "mongodb+srv://Jeffrey:Jeffrey@nam-clutster.rp3ox.mongodb.net/NAMS?retryWrites=true&w=majority";

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function connectDB() {
//   console.log("Connecting to my Database...");
//   try {
//     // Connect to the MongoDB cluster
//     await client.connect();
//     console.log("Connected!");
//     // Make the appropriate DB calls
//   } catch (e) {
//     console.error(e);
//   }
// }

// // async function findChapter(title) {
// //   console.log(`Trying to find chapter`);
// //   const db = await client.db("NAMS").collection("novels").findOne({ title: title });
// //   if (db == null) {
// //     // console.log(db);
// //     createNewChapter(client, {
// //       novel_title: title,
// //       cover_url: "",
// //       summary: "novel_summary_1",
// //       chapters: { next: "", prev: "", chapter_title: "", paragraphs: [] },
// //     });
// //   } else {
// //     console.log("Novel Listing Found...");
// //   }
// // }

// const schema = {
//   novel_title: "",
//   cover_url: "",
//   total_chapters: 0,
//   summary: [],
//   chapters: [],
// };

// // async function insertChapter(client, title, paragraphArray) {
// //   db = await client
// //     .db("NAMS")
// //     .collection("novels")
// //     .updateOne({ summary: "novel_summary_1" }, { $addToSet: { chapters: { $each: [paragraphArray] } } });
// //   // .updateOne({ summary: "novel_summary_1" }, { $addToSet: { chapters: { $each: [paragraphArray] } } });
// //   console.log(`${db.matchedCount} document(s) matched the query criteria.`);
// //   console.log(`${db.modifiedCount} document(s) was/were updated.`);
// // }

// // async function createNewChapter(client, newListing) {
// //   const db = await client.db("NAMS").collection("novels").insertOne(newListing);
// //   console.log(`New listing created with the following id: ${db.insertedId}`);
// // }

// /**
//  * ADD NOVEL ENTRY TO DATABASE
//  * @param {String} novel_title Novel Title
//  * @param {String} summary Novel Summary
//  * @param {String} cover_url Novel Cover URL
//  */
// async function addNewNovel(novel_details) {
//   //   Create a novel entry
//   console.log("Adding New Novel to Database...");
//   schema.novel_title = novel_details.novel_title;
//   schema.summary = novel_details.summary;
//   schema.cover_url = novel_details.cover_url;
//   schema.total_chapters = novel_details.total_chapters;

//   const db = await client.db("NAMS").collection("novels").insertOne(schema);
//   console.log(`New novel added to database!: ${novel_details.novel_title}`);
// }

// let once = false;
// /**
//  *
//  * @param {String} novel_title Novel title
//  */
// async function novelInDB(novel_title) {
//   if (!once) {
//     console.log(`Checking if ${novel_title} is in our database (SAVE DB)...`);
//   }

//   const db = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
//   if (db == null) {
//     if (!once) {
//       console.log(`Novel is not within our database.`);
//       once = true;
//     }
//     return false;
//   }
//   if (!once) {
//     console.log(`It is within our database.`);
//     once = true;
//   }
//   return true;
// }

// async function chapterInDB(novel_title, chapter_num) {
//   console.log(`Checking for chapter ${chapter_num} from database...`);
//   const aggOptions = [
//     {
//       $match: {
//         novel_title: novel_title,
//       },
//     },
//     {
//       $unwind: {
//         path: "$chapters",
//       },
//     },
//     {
//       $match: {
//         "chapters.chapter": chapter_num,
//       },
//     },
//     {
//       $count: "chapters",
//     },
//   ];

//   const cursor = client.db("NAMS").collection("novels").aggregate(aggOptions);
//   count = 0;
//   await cursor.forEach((doc) => {
//     if (doc.chapters != null && count == 0) {
//       count = doc.chapters;
//     }
//   });
//   if (count == 0) {
//     console.log("Chapter is not within our database.");
//     return false;
//   }
//   console.log("Found Chapter in our database");
//   return true;
// }

// async function addChapterDetails(chapterObject, chapter_num) {
//   console.log("Adding Chapter Details To DB...");

//   var db = await client
//     .db("NAMS")
//     .collection("novels")
//     .updateOne(
//       { novel_title: chapterObject.novel_title },
//       {
//         $addToSet: {
//           chapters: {
//             chapter: chapter_num,
//             chapter_title: chapterObject.chapterTitle,
//             content: chapterObject.paragraphs,
//           },
//         },
//       }
//     );
//   console.log(`${db.matchedCount} document(s) matched the query criteria.`);
//   console.log(`${db.modifiedCount} document(s) was/were updated.`);
//   console.log(`New chapter should be added to database!: ${chapterObject.chapterTitle}`);
// }

// connectDB().catch(console.error);

// var router = express.Router();

// router.post("/", async function (req, res, next) {
//   console.log("YOU CALLED SAVE DB");
//   console.log(req.body.url);
//   const novel_title = url.parse(req.body.url, true).pathname.split("/")[2];
//   const chapter_num = req.body.chapter_num;
//   console.log(chapter_num);
//   //   const chapter_url = req.body.url.toString() + "/chapter-" + i; // The novel url base no /chapter-1/
//   // Check if we need to add to database

//   if (!(await novelInDB(novel_title))) {
//     // We need to add to database
//     console.log("ADD NOVEL SCHEMA TO DATABASE");
//     console.log(req.body.url);
//     axios // "https://boxnovel.com/novel/the-human-emperor/"
//       .get(url.parse(req.body.url.toString(), true))
//       .then(async (response) => {
//         const $ = cheerio.load(response.data); // Load the page
//         novel_details = {
//           novel_title: novel_title,
//           total_chapters: 0,
//           summary: [],
//           cover_url: "",
//         };

//         // Get Total Chapters
//         novel_details.total_chapters = Number($(".wp-manga-chapter").first().text().trim().split(" ")[1]);
//         // console.log($(".wp-manga-chapter").first().text().split(" ")[1]); .split(" ")[0]
//         console.log(`${novel_title}'s Total Chapters: ${$(".wp-manga-chapter").first().text().trim().split(" ")[1]}`);
//         // Get Summary
//         $(".editdescription").each((index, element) => {
//           novel_details.summary.push($(element).text());
//           console.log($(element).text());
//         });
//         // Get cover_url
//         novel_details.cover_url = $(".summary_image").attr("href");
//         console.log(`Cover url: ${$(".summary_image").attr("href")}`);
//         await addNewNovel(novel_details);
//       })
//       .catch((err) => {
//         console.log("Error found:", err);
//       });
//   }
//   // We now have a database entry
//   // Time to add chapters i < schema.total_chapters + 1

//   console.log("Waiting");
//   while (!(await novelInDB(novel_title))) {
//     // console.log("WAIT");
//   }

//   // var intervalObject = setInterval(async function () {
//   //   if (await novelInDB(novel_title)) {
//   //     console.log("Novel is now in database");
//   //     clearInterval(intervalObject);
//   //   }
//   //   console.log();
//   // }, 1000);
//   // console.log("TOTAL:", schema.total_chapters);
//   for (let i = 1; i < schema.total_chapters; i++) {
//     const chapter_url = req.body.url.toString() + "/chapter-" + i; // The novel url base no /chapter-1/

//     if (!(await chapterInDB(novel_title, i))) {
//       // Chapter is not in database
//       // "https://boxnovel.com/novel/the-human-emperor/"
//       await axios
//         .get(url.parse(chapter_url, true))
//         .then((response) => {
//           const $ = cheerio.load(response.data); // Load the page

//           chapterObject = {
//             novel_title: novel_title,
//             chapterTitle: "",
//             paragraphs: [],
//           };

//           // Get Chapter Title
//           chapterObject.chapterTitle = $(".panel-heading").text();
//           //   console.log(chapterObject.chapterTitle);

//           // Get Paragraphs
//           $("p", ".reading-content").each((index, p) => {
//             // Get the paragraphs
//             // console.log($(p).text());
//             const paragraph = $(p).text();
//             chapterObject.paragraphs.push(paragraph);
//           });
//           addChapterDetails(chapterObject, i);
//         })
//         .catch((err) => {
//           console.log("Error found:", err);
//         });
//     }
//   }
//   res.send(JSON.stringify(await parseChapter(novel_title, chapter_num)));
//   // res.end();
// });
// async function parseChapter(novel_title, chapter_num) {
//   const db = await client.db("NAMS").collection("novels").findOne({ novel_title: novel_title });
//   // Novel has to be on our database
//   const chapter = db.chapters[chapter_num - 1];
//   return {
//     chapter_title: chapter.chapter_title,
//     content: chapter.content,
//   };
//   // console.log(db.chapters[chapter_num]);
// }

// router.get("/", async function (req, res, next) {
//   res.send("GET IS NOT SUPPORTED");
// });
// module.exports = router;
