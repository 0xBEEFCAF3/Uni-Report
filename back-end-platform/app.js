
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
//const fetch = require("node-fetch");

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views/pages');
  app.set('view engine', 'ejs');
  //app.engine('jsx', require('express-react-views').createEngine());

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.locals({ layout: false }) // app level default
  app.set('view options', { layout: false }) // pretty much same as above
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.json("route");
});

app.get('/earnings/gender/:uniName', function(req, res){
  let uniName = req.params.uniName;
  uniName = uniName.replace("+", "%20");
  var finished = _.after(2, respond);

  let femaleUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,2013.earnings.10_yrs_after_entry.female_students"
  let maleUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,2013.earnings.10_yrs_after_entry.male_students"
  
  let female;
  let mean;

  request(femaleUrl, function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body);
    if (body.metadata.total <= 0 ){
      female = null;
      res.json("No results");
      return;
    }
    female = body.results[0]["2013.earnings.10_yrs_after_entry.female_students"];
    finished();
  });

  request(maleUrl, function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body);
    if (body.metadata.total <= 0 ){
      male = null;
      res.json("No results");
      return;
    }
    male = body.results[0]["2013.earnings.10_yrs_after_entry.male_students"];
    finished();
  });

  function respond(){
    res.json({"females":female, "males": male, "title":"Male and females entry ratoi"});
  }
});


app.get('/earnings/avg/:uniName', function(req, res){
  let uniName = req.params.uniName;
  uniName = uniName.replace("+", "%20");
  var finished = _.after(2, respond);

  let urlMean = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,2013.earnings.10_yrs_after_entry.working_not_enrolled.mean_earnings"
  let urlMedian = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,2013.earnings.10_yrs_after_entry.median"
  
  let median;
  let mean;

  request(urlMedian, function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body);
    if (body.metadata.total <= 0 ){
      median = null;
      res.json("No results");
      return;
    }
    median = body.results[0]["2013.earnings.10_yrs_after_entry.median"];
    finished();
  });

  request(urlMean, function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body);
    if (body.metadata.total <= 0 ){
      mean = null;
      res.json("No results");
      return;
    }
    mean = body.results[0]["2013.earnings.10_yrs_after_entry.working_not_enrolled.mean_earnings"];
    finished();
    
  });

  function respond(){
    res.json({"mean":mean, "median": median, "title":"Median/Mean earnings 10 years after entry"});
  }

});


app.get('/schoolreport/:uniName', function(req, res) {
    let uniName = req.params.uniName;
    res.render('school-report', {
        uniName:String(uniName.replace("+", " ")),
        uniNameApiString:String(uniName)
        
    });
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
