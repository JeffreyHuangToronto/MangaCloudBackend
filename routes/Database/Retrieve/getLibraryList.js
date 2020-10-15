/** @format */

const express = require("express");
const client = require("../connectDatabase"); // Connect to database

async function getAllLibraryNovels(userId) {
    const allNovels = client.db("NAMS").collection("NOVELS");
    const userLibraryNovels = await client.db("NAMS").collection("USERS").findOne({ _id: userId });
    var NOVEL_LIST = { novels: [] };

    // Check if they already have a library
    if (userLibraryNovels == null) {
        // Add them to the database
        await client.db("NAMS").collection("USERS").insertOne({ _id: userId, library: [] });
        // Return nothing
        return NOVEL_LIST;
    }
    await allNovels.find().forEach((novel) => {
        userLibraryNovels.library.forEach((libraryNovel) => {
            if (novel._id == libraryNovel.novel_id) {
                NOVEL_LIST.novels.push(novel);
            }
        });
    });
    return NOVEL_LIST;
}

// router.get("/", async function (req, res, next) {
//     console.log("Params: ", req.query.userId);
//     if (req.query.userId == null || isNaN(req.query.userId) || req.query.userId == "") {
//         console.log("Not a number");
//         res.send({ Error: `userId: ${req.query.userId} is not a number.` });
//     } else {
//         res.json(await getUserLibrary(req.query.userId));
//     }
// });

// async function getUserLibrary(userId) {
//     const user = await client.db("NAMS").collection("USERS").findOne({ _id: userId });
//     if (user == null) {
//         // Create a new user
//         await client.db("NAMS").collection("USERS").insertOne({ _id: userId, library: [] });
//         return { library: [] };
//     } else {
//         // console.log("In library");
//         return { library: user.library };
//     }
// }

var router = express.Router();

/**
 *  If you call this endpoint you need to add a body with
 **/
router.get("/", async function (req, res, next) {
    res.json(await getAllLibraryNovels(req.query.userId));
    res.end();
});

module.exports = router;
