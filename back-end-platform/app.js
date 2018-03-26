
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var request = require('request');
var cheerio = require('cheerio');


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.write("String(test)");
  res.end();
});



app.get('/rmp/:uniName', function(req, res){


  let uniName = req.params.uniName;
  let url = 'http://www.ratemyprofessors.com/search.jsp?query='+ uniName;
  let sid;


  request(url, function(error, response, html){
      if(!error){
          var $ = cheerio.load(html);

      let sid = $('div.listings-wrap ul.listings li.SCHOOL a').attr("href");

      if(sid == undefined || sid == null){
        res.send("Incorrect Response");
        return;
      }

      sid = sid.split("?")[1];
      console.log("the sid");
      console.log(sid);

      //request to get info
          //URL EXAMPLE http://www.ratemyprofessors.com/campusRatings.jsp?sid=1280

          let ratingURL =  "http://www.ratemyprofessors.com/campusRatings.jsp?" + sid;
          console.log("the rating url and sid");
          console.log(ratingURL, sid);
          request(ratingURL, function(error, response, html){
            if(!error){
                var $ = cheerio.load(html);

            let ratings = {};
            $(".school-averages div.rating").each(function(index){
                if(index > 7)
                  return;
                let rating = $(this).children()[1];
                let cat =  $(this).children()[2];
                ratings[$(cat).text()] = $(rating).text();
                //console.log($(rating).text(), $(cat).text());

            });
            console.log(ratings);
            res.json(ratings);


            }

          });

      }

    });//first request





//end of the rmp route

})


app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
