/** @format */

var express = require("express");
var router = express.Router();
var path = require("path");

var package = require("../package.json");
/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Manga Cloud Backend", version: package.version });
    // res.sendFile("index.html", {
    //     root: path.join(__dirname, "../public/html"),
    // });
});

module.exports = router;
