
#1.

As a log-in user, I want to be able to save any of the school characteristics that I like to an organized list. 
I am expecting seeing a bunch of options that I can click to find my ideal colleges after I logged in. There should at least be "location", "average SAT score", and "tuition fees". If I click one of the schools on the list, I want to see its information and I want to save it on my list if I like it. Whenever I log in, the web app should show me the list what I saved. 



#2.

As a log-in user, I want to customize my portal with my accomplishments, test scores, school interests, etc. to get possible college matches. This way, every time I log on, I don't have to re-enter my statistics to see if I have a possible "chance" for a university of my choice. I want to have the option to categorize schools that are of interest as safety, match, or reach. The customization option should also suggest other schools that could possibly interest me. 



#3.

As an unauthenticated user, I want to be able to authenticate and gain access to the application. 

I want to be able to sign in with my google account credential. Google's OAuth servers should provide the backend with the necessary information about to user, in order to customize their experience. The backend will concatenate a server secrete and an Oauth secrete and store it in a JWT which will be placed in the session cookie. For any request client side, we will first verify that request and then respond. 
