/** @format */

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
// var retrieveNovel = require("./routes/retriveNovel");
// var saveChapterDB = require("./routes/saveChapterDB");
// var retrieveNovelInfo = require("./routes/retrieveNovelInfo");
// var recNovels = require("./routes/recNovels");
// var saveRecommends = require("./routes/saveRecommends");

// New System
var DATABASE_SAVE_NOVEL = require("./routes/Database/Save/saveNovel");
var DATABASE_SAVE_CHAPTER = require("./routes/Database/Save/saveChapter");
var DATABASE_GET_NOVEL_LIST = require("./routes/Database/Retrieve/getNovelList");
var DATABASE_GET_NOVEL = require("./routes/Database/Retrieve/getNovel");

var BOXNOVEL_SCRAPE_NOVEL_CHAPTER = require("./routes/Boxnovel Scraper/getChapter");
var BOXNOVEL_SCRAPE_NOVEL_DETAILS = require("./routes/Boxnovel Scraper/scrapeNovelDetails");
var BOXNOVEL_SCRAPE_ALL_NOVELS = require("./routes/Boxnovel Scraper/scrapeAllNovels");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// New System
app.use("/DATABASE/SAVENOVEL", DATABASE_SAVE_NOVEL);
app.use("/DATABASE/SAVECHAPTER", DATABASE_SAVE_CHAPTER);
app.use("/DATABASE/GETNOVELLIST", DATABASE_GET_NOVEL_LIST);
app.use("/DATABASE/GETNOVEL", DATABASE_GET_NOVEL);

app.use("/SCRAPE/BOXNOVEL/GETCHAPTER", BOXNOVEL_SCRAPE_NOVEL_CHAPTER);
app.use("/SCRAPE/BOXNOVEL/ALLNOVELS", BOXNOVEL_SCRAPE_ALL_NOVELS);
app.use("/SCRAPE/BOXNOVEL/NOVELDETAILS", BOXNOVEL_SCRAPE_NOVEL_DETAILS);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
