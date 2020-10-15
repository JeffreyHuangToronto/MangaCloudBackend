/** @format */

const express = require("express");
const client = require("../Database/connectDatabase"); // Connect to database

var router = express.Router();

router.get("/", async function (req, res, next) {
    console.log("Params: ", req.query.userId);
    if (req.query.userId == null || isNaN(req.query.userId) || req.query.userId == "") {
        console.log("Not a number");
        res.send({ Error: `userId: ${req.query.userId} is not a number.` });
    } else {
        res.json(await getUserLibrary(req.query.userId));
    }
});

async function getUserLibrary(userId) {
    const user = await client.db("NAMS").collection("USERS").findOne({ _id: userId });
    if (user == null) {
        // Create a new user
        await client.db("NAMS").collection("USERS").insertOne({ _id: userId, library: [] });
        return { library: [] };
    } else {
        // console.log("In library");
        return { library: user.library };
    }
}

module.exports = router;
