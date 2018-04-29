# Idea One: 

For constant Uber or Lyft users or even both, it is really inconvenient to open both apps to compare the price when traveling. As a result, we figure that if there is a web application that can compare multiple taxi booking app at the same time, it will save a lot time for the users. Google map has similar idea, but we decide that there should be more app to compare since other taxi booking apps grow rapidly. If this web application is developed successfully, we believe it will have users more than Uber’s and lyft’s.  
 
 # Idea Two:
 
 As high school seniors, one of the hardest decisions to make is where to spend the next four years of your life as a college student. So many questions are brought to light when making the final decision: 
	What are my chances of getting admitted with my test statistics?
	Where is the university located?
	How big is the university?
	Is it a liberal arts school?
	Is there a prominent city life?
	Will I fit in?
	And so much more…
	Keeping track of all these concerns can turn in to a hassle when trying to jump between each university’s site. If only there were a single application that had all of the answers to all of these question…
	Introducing CollegeTalks. It holds the answers to all of your college-related  questions. The site will make use of multiple databases to provide an easy way to address different concerns one may have of a university. Upon arriving on the site, the user will enter the name of the university in doubt. The user will be shown a list of things to possibly search - admission statistics, professor reviews, lifestyle, etc. When picking any of the options, the screen will display all of the requested information. 
	This site will also allow users to create a free account in which they can store their high school statistics and ask for a comparison of where they stand in relation to other university admits. Users will also have an option to save any of the school characteristics they like to an organized list. Note, that creating an account will not be necessary. 
	Why is CollegeTalks a “good idea”? When researching universities, students go to individual university affiliated sites and gather their information. CollegeTalks allows users to address all of questions to only one site. 
 
 
 
<h3>Software Specification </h3>

For both applications we will be using a MERN STACK:
<ul>
  <li>M : Our data base solutions will be non-relational. We will be using MongoDB </li>
  <li>E : Backend frame work will be Express 4.16.2 </li>
  <li>R : For some portions of our frontend we will be using React </li>
  <li>N : We will be using javascript in the back end </li>
</ul>
<h4> Authentication </h4>
We plan to use Google's Oauth API to log in users. Thankfully google has a Node libraries on NPM that we can use <a href="https://github.com/google/google-api-nodejs-client/" > Source </a>

<h4> API's </h4> 

<b> Car Service Comparison </b>
The two biggest API's we plan to use for this project is <b> Lyft's and Uber's </b>. With the help of Google Maps to create visual aids. 

<b> Uni-Report </b>
There are some API's that can provide general college statistics: College Scorecard Data.
For other user created data sets we should use API's including Rate My Professor.
And Yelp's public API for non academic data. 



