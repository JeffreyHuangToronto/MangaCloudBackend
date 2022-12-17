/** @format */

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var getMangaPages = require("./routes/Manga/Scrapers/Mangakakalot Scraper/getMangaPages");
var getCompletedMangaList = require("./routes/Manga/Scrapers/Mangakakalot Scraper/getCompletedMangaList");
var saveAllManga = require("./routes/Manga/Scrapers/saveAllManga");
var searchManga = require("./routes/Manga/searchManga");
var searchMangaById = require("./routes/Manga/Scrapers/Mangakakalot Scraper/getMangaById");
const { allowedNodeEnvironmentFlags } = require("process");

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

app.use("/api/manga/getpages", getMangaPages);
app.use("/api/manga/getcompletedlist", getCompletedMangaList);
app.use("/api/manga/database/saveallmanga", saveAllManga);
app.use("/api/manga/database/search", searchManga);
app.use("/api/manga/database/searchbyid", searchMangaById);

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
