
/**
 * Module dependencies.
 */

var express = require('express')
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
const yelp = require('yelp-fusion');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const csbApiKey = "&api_key=NeR679qRO0IZsowkBu0xeTQfnMiO61a3z0bVl1DK";
const yelpApiKey = "goaICLvtD-bg3_zKg3e8nxfLrjHSjzQajtq23nupPs6-GKLGHIoQ1ZoitB-FT_SjBUrdlLUdhJX-gJlViIx_x575xjwmmYWDHG-BMwYPwzdolNP7xUR_HS0HjsvKWnYx";
const client = yelp.client(yelpApiKey);
var cacheModel = require("./models/cache.js");
var userModel = require("./models/user.js");
var oauth = require('oauth');
var authConfig = require('./auth/auth.js');
var jwt = require('jsonwebtoken');
//var cookieParser = require('cookie-parser');
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const uniqid =  require('uniqid');
var app = module.exports = express.createServer();
//oauth config
const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: authConfig.client_pass,
  signed: true
};

function extractProfile (profile) {
  let imageUrl = '';
  if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value;
  }
  return {
    id: profile.id,
    displayName: profile.displayName,
    image: imageUrl
  };
}

passport.use(new GoogleStrategy({
  clientID: authConfig.client_id,
  clientSecret: authConfig.client_pass,
  callbackURL: "http://localhost:8080/auth/callback",
  accessType: 'offline'
}, (accessToken, refreshToken, profile, cb) => {
  // Extract the minimal profile information we need from the profile object
  // provided by Google
  cb(null, extractProfile(profile));
}));

function addUser(user){
  /**
  *@details: Check if user already exists if then add to session state
            if they dont create a new user
  **/

  let name = user.name;
  let email = "";
  let id = user.id;
  userModel.userExists(id).then(function(result) {
        if(result == null || result == undefined){
          userModel.createUser(id, name, email);
        }else if(Object.keys(result).length === 0 && result.constructor === Object){
          userModel.createUser(id, name, email);
        }
        console.log(result);//send json'd cache object.

    }, function(err) {
        console.log(err);
  });
}

passport.serializeUser((user, cb) => {
  console.log(cb);
  //add user to model
  addUser(user);
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views/pages');
  app.set('view engine', 'ejs');
  //app.engine('jsx', require('express-react-views').createEngine());
  //Oauth specific things

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session(sessionConfig));
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
let user = mongoose.model('user');

app.get('/auth/logout',function(req,res){
    //clear and all cookies and session id and render logout page
    //res.clearCookie("key"); ... have to first add jwts
    delete req.session.passport;
    delete req.session.jwtSecret;

    res.render('logout');

});

app.get(
  // Login url
  '/auth/login',

  // Save the url of the user's current page so the app can redirect back to
  // it after authorization
  (req, res, next) => {
    if (req.query.return) {
      req.session.oauth2return = req.query.return;
    }
    next();
  },
  // Start OAuth 2 flow using Passport.js
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// auth callback
app.get(
  // OAuth 2 callback url. Use this url to configure your OAuth client in the
  // Google Developers console
  '/auth/callback',
  // Finish OAuth 2 flow using Passport.js
  passport.authenticate('google'),

  // Redirect back to the original page, if any
  (req, res) => {
    const redirect = req.session.oauth2return || '/';
    if(redirect == "/auth/login"){
      redirect == "/";
    }
    delete req.session.oauth2return;

    let jwtSecret = authConfig.JWT_secret;
    req.session.jwtSecret = jwtSecret;
    var date = new Date();
    date.setTime(date.getTime() + (5 * 60 * 1000));// 5 hours

    const cookieOptions = {
      httpOnly: true,
      expires: 0
    }
    const jwtPayload = {
     googleAccessToken: jwtSecret
    }

    const authJwtToken = jwt.sign(jwtPayload, jwtSecret);
    res.cookie('googleAccessJwt', authJwtToken, cookieOptions);
    //res.json( req.headers.cookie);
    res.redirect(redirect);
  }
);

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
function authRequired (req, res, next) {
  if (!req.session.passport) {
    req.session.oauth2return = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
}

function checkJwtAuth(req, res, next){

  const userJWT = JSON.stringify(req.headers.cookie);
  //const payload = userJWT.split('.')[2];
  console.log(userJWT);
  const JWT = (userJWT.split("googleAccessJwt")[1]).replace("=","").split(";")[0]; //this needed to happend
  console.log("the JWT:::", authConfig.JWT_secret);
  console.log("XXX end of jwt");
    if (!userJWT) {
        res.send(401, 'Invalid or missing authorization token');
    }else {
        const userJWTPayload = jwt.verify(JWT, authConfig.JWT_secret)
        if (!userJWTPayload) {
            //Kill the token since it is invalid
            //
            res.clearCookie('googleAccessJwt');
            res.send(401, 'Invalid or missing authorization token');
        }else{
          next();
        }
    }
}


// Routes
app.get('/', authRequired,function(req, res){

  res.json(req.headers.cookie);
});

/*DEV functions of displaying and modifying the model*/
/*Not to be used in any part of the app*/
app.get('/displayCache',authRequired ,function(req, res){
  cache.find(function(err, cache) {
    res.send(cache);
  });
});
app.get('/displayUsers',authRequired ,function(req, res){
  user.find(function(err, users) {
    res.send(users);
  });
});
app.get('/deleteAllUsers',authRequired ,function(req, res){
  user.remove({}, function(err) {
   console.log('collection removed')
  });
  res.send('deleted');
});
app.get('/clearCache',authRequired ,function(req, res){
  cache.remove({}, function(err) {
   console.log('collection removed')
  });
  res.send('deleted');
});

app.get('/profile',authRequired, function(req, res){
  if(req.session.passport){
    console.log("user is logged in");
  }else{
    res.redirect("/auth/login");
    return;
  }

  let name = req.session.passport.user.displayName;
  let imageUrl = req.session.passport.user.image;

  res.render('profile', {
        name:name,
        imageUrl:imageUrl
    });
});

app.post('/updateLikes', function(req, res){
  let uniName =  req.body.uniName;
  //let userId = req.session.passport.user.id;
  let userId = 102882686044984762722;
  if(uniName == "" || uniName == undefined || uniName == null){
    res.status(400).send("Incorrect input");
    return;
  }
  userModel.updateUserLikes(userId, uniName).then(function(){
    console.log("updated ");
  });

  res.json("updated");
});

// end point for getting all used liked unis
app.get('/getLikedUnis' ,function(req, res){
  let userId = 102882686044984762722;
  userModel.getUserLikes(userId).then(function(response){
    res.json(response);
  });
});


app.get('/sat/:uniName' ,function(req, res){
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
      let response = {"SAT_Reading": reading,"SAT_Math": math,"SAT_Writing":writing,"title":"Average SAT Score"};
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
      let response = {"ACT_English": english, "ACT_Math": math, "ACT_Writing":writing, "title":"Average ACT Score"};
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


app.get('/location/:uniName' ,function(req, res){
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

app.get('/info/:uniName' ,function(req, res){
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


app.get('/earnings/gender/:uniName' , function(req, res){
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

app.get('/rmp/:uniName',function(req, res){
  console.log("THE HEADER", req.headers.cookie);
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


app.get('/schoolreport/:uniName',authRequired, function(req, res) {
    let uniName = req.params.uniName;
    res.render('school-report', {
        uniName:String(uniName.replace("+", " ")),
        uniNameApiString:String(uniName)

    });
});

app.get('/home',authRequired, function(req, res) {
  let imageSchool = "https://www.bu.edu/bostonia/files/2015/02/campus-photo.jpg";
  let imageSchool2 = "http://greenbillion.org/wp-content/uploads/2011/10/BostonUniversity.jpg";
    res.render('home', {
      imageSchool:imageSchool,
      imageSchool2: imageSchool2

    });
});


app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
