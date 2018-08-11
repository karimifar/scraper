var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();


var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperHW";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.get("/", function(req, res) {
    res.render("index")
});


app.get("/scrape", function(req, res) {
    axios.get("https://www.fastcompany.com/co-design").then(function(response) {
        var $ = cheerio.load(response.data);
        $("article.card a").each(function(i,element){
            var result = {};
            result.title = $(this).attr("title")
            result.link= "https://www.fastcompany.com" +$(this).attr("href")
            // result.imglink= $(this).children("figure  > picture > img")

            db.Article.create(result)
            .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                // return res.json(err);
            });
        })
        // res.render("index", {success: "Scraped Successfully!"})
        res.end();
    })
    
})


app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .populate("note")
        .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.render("scraped", {articles: dbArticle});
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
        });
});

app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.get("/saved-articles", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.find({ saved: true })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


  app.post("/article/save/:id", function(req,res){
      var id = req.params.id;
      var save = req.body.saved;
      console.log(id, save)
      db.Article.findByIdAndUpdate(id, {saved:save} , function(err,result){
        if(err){
            console.log(err)
        }
        console.log("RESULT: " + result);
        res.send(result)
      })
  })
  
  app.post("/note/:id", function(req,res){
      var id = req.params.id;
      var note = req.body;

      db.Note.create(note)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({_id:id}, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  })

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  