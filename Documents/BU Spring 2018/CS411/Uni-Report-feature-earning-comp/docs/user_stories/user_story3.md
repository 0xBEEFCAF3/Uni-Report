
#3.

As an unauthenticated user, I want to be able to authenticate and gain access to the application. 

I want to be able to sign in with my google account credential. Google's OAuth servers should provide the backend with the necessary information about to user, in order to customize their experience. The backend will concatenate a server secrete and an Oauth secrete and store it in a JWT which will be placed in the session cookie. For any request client side, we will first verify that request and then respond. 