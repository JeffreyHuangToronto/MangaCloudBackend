/** @format */

const express = require("express");
const client = require("../Database/connectDatabase"); // Connect to database

var router = express.Router();

/**
 *  If you call this endpoint you need to add a body with
 **/
router.get("/", async function (req, res, next) {
    // res.json(await getUserLibrary(req.body.userId));
    // console.log("Params: ", req.query.userId);

    await removeNovelFromLibrary(req.query.userId, req.query.novelId);
    res.send("Removed!");
    res.end();
});

async function removeNovelFromLibrary(userId, novel_id) {
    if (userId == null || isNaN(userId)) {
        console.log("Not a number");
    } else {
        const user = await client.db("NAMS").collection("USERS").findOne({ _id: userId });
        if (user == null) {
            // Create a new user
            return { Error: `Failed to remove novel to library because user does not exist.` };
        } else {
            const db = await client
                .db("NAMS")
                .collection("USERS")
                .updateOne({ _id: userId }, { $pull: { library: { novel_id: novel_id } } });
            return user.library;
        }
    }
}

module.exports = router;
