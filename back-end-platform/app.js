
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
//const fetch = require("node-fetch");
const yelp = require('yelp-fusion');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const apiKey = "goaICLvtD-bg3_zKg3e8nxfLrjHSjzQajtq23nupPs6-GKLGHIoQ1ZoitB-FT_SjBUrdlLUdhJX-gJlViIx_x575xjwmmYWDHG-BMwYPwzdolNP7xUR_HS0HjsvKWnYx";
const client = yelp.client(apiKey);
var cacheModel = require("./models/cache.js");

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

//set up DB

// Connection URL
const MongoUrl = 'mongodb://admin:admin@ds119718.mlab.com:19718/uni-report';
let con = mongoose.connect(MongoUrl);
let cache = mongoose.model('cache');

// Routes
app.get('/', function(req, res){
  res.json("route");
});

app.get('/displayCache', function(req, res){
  cache.find(function(err, cache) {
    res.send(cache);
  });

});


app.get('/sat/:uniName', function(req, res){
  let uniName = req.params.uniName;

  //fist check cache
  cacheModel.checkCache("/sat", {uniName:uniName}).then(function(result) {
        cacheResponse = result;
        if(Object.keys(cacheResponse).length === 0 && cacheResponse.constructor === Object){
          //case if api call is not in cache
          callAPI();//just call the api
          return;
        }
        console.log("from the cache");
        res.json(cacheResponse);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });


  function callAPI(){
    var finished = _.after(1, respond);
    let satUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+csbApiKey+
    "&_fields=school.name,2015.admissions.sat_scores.midpoint.critical_reading,2015.admissions.sat_scores.midpoint.math,2015.admissions.sat_scores.midpoint.writing";

    let reading;
    let math;
    let writing;


    request(satUrl, function (error, response, body) {
      if (error) throw new Error(error);
      body = JSON.parse(body);
      if (body.metadata.total <= 0 ){
        //reading = null;
        res.json("No results");
        return;
      }
      reading = body.results[0]["2015.admissions.sat_scores.midpoint.critical_reading"];
      math = body.results[0]["2015.admissions.sat_scores.midpoint.math"];
      writing = body.results[0]["2015.admissions.sat_scores.midpoint.writing"];

      finished();
    });

    function respond(){
      let response = {"SAT Reading": reading,"SAT Math": math,"SAT Writing":writing,"title":"Average SAT Score"};
      let cacheSave = new cache({
        endpoint:"/sat",
        response: response,
        lastUsed: new Date(),
        args:{"uniName": uniName}
      });
      cacheSave.save(function (err) {
        if (err) return console.error(err);

      });
      res.json(response);
    }
  }
});   //end of SAT endpoint

app.get('/act/:uniName', function(req, res){
  let uniName = req.params.uniName;

  //fist check cache
  cacheModel.checkCache("/act", {uniName:uniName}).then(function(result) {
        cacheResponse = result;
        if(Object.keys(cacheResponse).length === 0 && cacheResponse.constructor === Object){
          //case if api call is not in cache
          callAPI();//just call the api
          return;
        }
        console.log("from the cache");
        res.json(cacheResponse);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });


  function callAPI(){
    var finished = _.after(1, respond);
    let actUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+csbApiKey+
    "&_fields=school.name,2015.admissions.act_scores.midpoint.english,2015.admissions.act_scores.midpoint.math,2015.admissions.act_scores.midpoint.writing";

    let english;
    let math;
    let writing;

    request(actUrl, function (error, response, body) {
      if (error) throw new Error(error);
      body = JSON.parse(body);
      if (body.metadata.total <= 0){
        //eng = null;
        res.json("No results");
        return;
      }
      english = body.results[0]["2015.admissions.act_scores.midpoint.english"];
      math = body.results[0]["2015.admissions.act_scores.midpoint.math"];
      writing = body.results[0]["2015.admissions.act_scores.midpoint.writing"];

      finished();
    });

    function respond(){
      let response = {"ACT English": english, "ACT Math": math, "ACT Writing":writing, "title":"Average ACT Score"};
      let cacheSave = new cache({
        endpoint:"/act",
        response: response,
        lastUsed: new Date(),
        args:{"uniName": uniName}
      });
      cacheSave.save(function (err) {
        if (err) return console.error(err);

      });
      res.json(response);
    }
  }
});   //end of ACT endpoint


app.get('/location/:uniName', function(req, res){
  let uniName = req.params.uniName;
  let cacheResponse = null;
  //fist check cache
  cacheModel.checkCache("/location", {uniName:uniName}).then(function(result) {
        cacheResponse = result;
        if(Object.keys(cacheResponse).length === 0 && cacheResponse.constructor === Object){
          //case if api call is not in cache
          callAPI();//just call the api
          return;
        }
        console.log("from the cache");
        res.json(cacheResponse);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });

  function callAPI(){
    var finished = _.after(1, getYelp);
    //first we need the state city and zip -- call score card api
    let infoUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+
    "&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,school.state,school.zip,school.city,school.school_url";
    let state;
    let zip;
    let city;


    request(infoUrl, function (error, response, body) {
      if (error) throw new Error(error);
      body = JSON.parse(body);
      if (body.metadata.total <= 0 ){
        price = null;
        res.json("No results");
        return;
      }
      state = body.results[0]["school.state"];
      zip = body.results[0]["school.zip"];
      city = body.results[0]["school.city"];

      finished();
    });

    function getYelp(){
       client.search({
          location: state + " " + city + " " + zip
        }).then(response => {
          parseData(response.jsonBody);
        }).catch(e => {
          console.log(e);
        });
    }

    function parseData(data){
      /**
      *@param: (Json Object)
      **/
      let dollars = [];
      let ratings = [];
      data = data["businesses"];

      data.forEach(function(item,index,array){
          ratings.push(item.rating);
          dollars.push(item.price.length);

      });

      let avgRating = ratings.reduce(function(a, b) { return a + b; }, 0) / ratings.length;
      let avgDollars = Math.floor(dollars.reduce(function(a, b) { return a + b; }, 0) / dollars.length);
      let response = {"rating": avgRating, "dollars": avgDollars};

      let cacheSave = new cache({
        endpoint:"/location",
        response: response,
        lastUsed: new Date(),
        args:{"uniName": uniName}
      });
      cacheSave.save(function (err) {
        if (err) return console.error(err);

      });
      res.json(response);
    }
 }
});//end of location endpoint

app.get('/info/:uniName', function(req, res){
  let uniName = req.params.uniName;


  //fist check cache
  cacheModel.checkCache("/info", {uniName:uniName}).then(function(result) {
        cacheResponse = result;
        if(Object.keys(cacheResponse).length === 0 && cacheResponse.constructor === Object){
          //case if api call is not in cache
          callAPI();//just call the api
          return;
        }
        console.log("from the cache");
        res.json(cacheResponse);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });


  function callAPI(){
    var finished = _.after(1, respond);
    let infoUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+
    "&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,school.state,school.zip,school.city,school.school_url";

    let state;
    let zip;
    let city;
    let website;


    request(infoUrl, function (error, response, body) {
      if (error) throw new Error(error);
      body = JSON.parse(body);
      if (body.metadata.total <= 0 ){
        price = null;
        res.json("No results");
        return;
      }
      state = body.results[0]["school.state"];
      zip = body.results[0]["school.zip"];
      city = body.results[0]["school.city"];
      school_url = body.results[0]["school.school_url"];

      finished();
    });

    function respond(){
      let response = {"state": state,"zip": zip,"city":city,"school_url":school_url,"title":"Location and school website"};
      let cacheSave = new cache({
        endpoint:"/info",
        response: response,
        lastUsed: new Date(),
        args:{"uniName": uniName}
      });
      cacheSave.save(function (err) {
        if (err) return console.error(err);

      });
      res.json(response);
    }
  }
});

app.get('/price/:uniName', function(req, res){
  let uniName = req.params.uniName;

  //fist check cache
  cacheModel.checkCache("/price", {uniName:uniName}).then(function(result) {
        cacheResponse = result;
        if(Object.keys(cacheResponse).length === 0 && cacheResponse.constructor === Object){
          //case if api call is not in cache
          callAPI();//just call the api
          return;
        }
        console.log("from the cache");
        res.json(cacheResponse);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });

  function callAPI(){
    var finished = _.after(1, respond);
    let priceUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniName+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.price_calculator_url";
    //school.price_calculator_url
    let price;

    request(priceUrl, function (error, response, body) {
      if (error) throw new Error(error);
      body = JSON.parse(body);
      if (body.metadata.total <= 0 ){
        price = null;
        res.json("No results");
        return;
      }
      price = body.results[0]["school.price_calculator_url"];
      finished();
    });

    function respond(){
      let response = {"price": price, "title":"School price calculator"};
      let cacheSave = new cache({
        endpoint:"/price",
        response: response,
        lastUsed: new Date(),
        args:{"uniName": uniName}
      });
      cacheSave.save(function (err) {
        if (err) return console.error(err);

      });
      res.json(response);
    }
  }
});


app.get('/earnings/gender/:uniName', function(req, res){
  let uniName = req.params.uniName;
  //fist check cache
  cacheModel.checkCache("/earnings/gender", {uniName:uniName}).then(function(result) {
        cacheResponse = result;
        if(Object.keys(cacheResponse).length === 0 && cacheResponse.constructor === Object){
          //case if api call is not in cache
          callAPI();//just call the api
          return;
        }
        console.log("from the cache");
        res.json(cacheResponse);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });


  function callAPI(){
    uniNameUrl = uniName.replace("+", "%20");
    var finished = _.after(2, respond);

    let femaleUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniNameUrl+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,2013.earnings.10_yrs_after_entry.female_students"
    let maleUrl = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniNameUrl+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,2013.earnings.10_yrs_after_entry.male_students"

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
      let response = {"females":female, "males": male, "title":"Male and females entry ratio"};
      let cacheSave = new cache({
        endpoint:"/earnings/gender",
        response: response,
        lastUsed: new Date(),
        args:{"uniName": uniName}
      });
      cacheSave.save(function (err) {
        if (err) return console.error(err);

      });
      res.json(response);
    }

  }
});


app.get('/earnings/avg/:uniName', function(req, res){
  let uniName = req.params.uniName;

  //fist check cache
  cacheModel.checkCache("/earnings/avg", {uniName:uniName}).then(function(result) {
        cacheResponse = result;
        if(Object.keys(cacheResponse).length === 0 && cacheResponse.constructor === Object){
          //case if api call is not in cache
          console.log(cacheResponse);
          callAPI();//just call the api
          return;
        }
        console.log("from the cache");
        res.json(cacheResponse);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });


  function callAPI(){
    uniNameUrl = uniName.replace("+", "%20");
    var finished = _.after(2, respond);

    let urlMean = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniNameUrl+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,2013.earnings.10_yrs_after_entry.working_not_enrolled.mean_earnings"
    let urlMedian = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name="+uniNameUrl+"&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK&fields=school.name,id,2013.earnings.10_yrs_after_entry.median"

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
      let response = {"mean":mean, "median": median, "title":"Median/Mean earnings 10 years after entry"};
      let cacheSave = new cache({
        endpoint:"/earnings/avg",
        response: response,
        lastUsed: new Date(),
        args:{"uniName": uniName}
      });
      cacheSave.save(function (err) {
        if (err) return console.error(err);

      });

      res.json(response);
    }
  }
});

app.get('/rmp/:uniName', function(req, res){
  let uniName = req.params.uniName;

  //fist check cache
  cacheModel.checkCache("/rmp", {uniName:uniName}).then(function(result) {
        cacheResponse = result;
        if(Object.keys(cacheResponse).length === 0 && cacheResponse.constructor === Object){
          //case if api call is not in cache
          console.log(cacheResponse);
          callAPI();//just call the api
          return;
        }
        console.log("from the cache");
        res.json(cacheResponse);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });

  function callAPI(){
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
              });
              //save in cache
              let response = ratings;
              let cacheSave = new cache({
                endpoint:"/rmp",
                response: response,
                lastUsed: new Date(),
                args:{"uniName": uniName}
              });
              cacheSave.save(function (err) {
                if (err) return console.error(err);

              });
              res.json(ratings);
              }
            });
        }

      });//first request

  //end of the rmp route
  }
});


app.get('/schoolreport/:uniName', function(req, res) {
    let uniName = req.params.uniName;
    res.render('school-report', {
        uniName:String(uniName.replace("+", " ")),
        uniNameApiString:String(uniName)

    });
});


app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
