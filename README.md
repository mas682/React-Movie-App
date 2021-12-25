# React Movie App (MovieFanatics)

## Overview
This project started around June 2020 with the intent of building a web application in which users can rate movies and share it with their friends.  There were a few reasons for building the project.  The first reason is I wanted to just have fun building something that I wanted to build.  In the past, just about all of my project have been something for work or school in which there were some sort of guidelines for what I was building.  The second reason is that I wanted to learn new technologies and tools that I have never used before.  Prior to this project, I had no previous experience with React or Express.js, and I also had limited prior exposure to technologies such as Docker and PostgreSQL.  Lastly, I wanted to put together everything I have learned over the years into one project to see what I could build.  Overall, I can say I have thoroughly enjoyed building this project.  I have been able to learn things I have never knew while also being tasked with challenges that I could have never anticipated.  I think the project has and will continue to make me a better software developer as well as continue to push me to places I have never gone before. 

## What technologies were used and why
Prior to even starting the project, I wanted to make sure I learned some new frameworks and technologies that I have never used before.  I also wanted to make sure I did not try to take a easy way out or shy away from a challenge.  Given this, I decided to use a few things I have never used before such as React, Express.Js, and Redis, along with a few things I needed to become more familiar with such as Docker, JavaScript, Linux, and PostgreSQL.  I was also able to utilize some things that I was familiar with such as Python, CSS, and HTML but I was able to enhance my skills with these due to this project.

## What did I learn
I could go on for a long time about what I learned from this project.  As I alluded to above, I intentionally wanted to bring a lot of these challenges upon myself as a oppurtunity to learn new things.  Prior to building the application, I had no experience with React, Express.Js, Redis, or Cron from Linux.  I also had very limited experience with Docker, PostgreSQL, and SQL.  Given that probably around 90% of the project was based upon using these tools, I had a lot to learn.  I have always learned better by being more hands on than by following a tutorial or book so I tried to limit myself to the very basics from the start so I could learn as I built the application.  Learning to use all these tools was challenging but I think the two most challenging things for me were learning to build a application that is scalable as well as determing the best design decisions for the application.  I honestly probably spent more time thinking through the design of the application than I did actually writing the code.  I had all sorts of problems that I had to come up with solutions for related to the design of the application and a few times I had to rethink my previous solution.  Here are some examples of the problems that I encountered:
- [How should the sign up process work?](https://github.com/mas682/React-Movie-App/blob/master/README.md#how-should-the-sign-up-process-work)
- [How can I build the build error handling and logging on the backend server in a way that helps me provide stability to the application?](https://github.com/mas682/React-Movie-App/blob/master/README.md#how-can-i-build-the-build-error-handling-and-logging-on-the-backend-server-in-a-way-that-helps-me-provide-stability-to-the-application)
- How should the login process work?
- How should the forgot password process work?
- How should the job scheduler work?
- How can I know when something goes wrong on the backend?
- How can I set up the application so that I can easily move it from one server to another?
- What should the layout of the front-end UI be?

These problems are just a few that I encountered but each of these questions often led to even more questions I had to answer.  I am going to walk through my solutions and thought process to the first two questions below but feel free to skip to whichever one(s) you are most interested in.  For the purpose of leaving some suspense, I am going to only answer the top 2 questions but I would love to talk through my solutions to any of the other questions if you are interested as well.![image](https://user-images.githubusercontent.com/47037892/147377807-c6a8dd0d-33cc-44ed-9053-7eb8576695a4.png)

### How should the sign up process work?
The sign up process for my application involves users entering their first name, last name, a username, email, and their password.  From a high level view this seems relatively easy to implement but I did find quiet a few challenges with this.  One of the first challenges I came across was how can I verify user accounts so that I do not get a lot of spam accounts in the system?  I decided I would use the users email as a way to verify users which would mean that I would have to generate some sort of secret that I could use to verify a user was who they claimed to be.  I made the process so that whenever a user signed up, a 6 digit code would be generated and sent to their email.  While waiting for the user to send back the response, the account was stored in a temporary table full of unverified users.  There was a restriction such that a user could request that up to 3 verification codes before the account was considered invalid. There is also another restriction so that a user could only try to validate a passcode 3 times at most so that someone could not try to brute-force the passcode. Once the user verified the email by sending back the right code, the account would then be moved to the actual users table and the user could now login.

For a while I thought this process was solid but I eventually noticed some rather glaring security holes.  One issue I had was I was storing user passwords in plaintext in the database.  Another somewhat related issue was that I was storing the generated passcode in the database in plain text as well.  These two were relatively simple to solve by simply creating a process that would add a salt value to the secret (the password or the passcode) and then hash it so that the value was encrypted.  I did this so that if the database ever became exposed, an attacker would not be able to know everyones passwords and they also would not be able to impersonate someone who has yet to verify their account.

Another problem that I encountered was someone could try to do a denial of service attack on users trying to sign up.  This would be somewhat challenging as the attacker would have to know when a user was signing up, but if they did they could request 3 verification codes be sent out immediately and then put in 3 invalid codes immediately so that a users temporary account would be considered invalid and they would have to sign up again.  I did not come up with a full proof way to prevent this yet but I did try to mitigate it some.  I added in a feature so that a user can only request a passcode be resent once every 1 minute.  I also removed the restriction of only being able to send 3 passcodes but the account would only be considered valid for 10 minutes before someone else could try to sign up with the username or email.  I did this for two reasons, the first being so that it would slow down an attacker trying to do a denial of service attack on a user signing up.  Every time they request to send a verification code, they will have to wait another minute for a new one to be sent.  The second reason I did this was to try to slow down someone flooding my backend server with requests for passcodes.  My idea behind this is if you wanted to flood the system with requests, you would have to keep creating many different accounts so that you could continuosly send requests.  This does not solve the issue of someone entering a invalid passcode 3 times immediately but it does help make the attack a little more challenging.  

The last problem I am going to mention for the sign up process was me putting the users into their own temporary table.  I did this originally as I did not want someone to flood my users table with fake accounts and cause a delay on the backend for the users who were actually verified.  The main issue with this is I had to ensure that a real user and a temporary user did not have the same email or username.  I built in some checks to see if a user already existed in the main user table when adding a temporary user account but there could still be a scenario where a actual user updates their email around the same time that another user was signing up with that same email.  In this case, two users would have the same email which would lead to issues with my forgot password functionality which revolved around users requesting a passcode to reset their password.  I ended up fixing this by putting all users(verified and unverified) into a single table with a boolean field indicating if the user was verified or not.  This was honestly just a bad design decisions by me but it was a learning experience as if I would of thought these things through more I could of avoided most of these issues.

### How can I build the build error handling and logging on the backend server in a way that helps me provide stability to the application?
One thing that I think can define any application is if it has poor stability, no matter how cool or useful the application is.  In order to provide that stability, I think you need to be able to have a good understanding of what is going on in your application when something breaks.  I think this is especially crucial in the early stages of the application as there are likely to be a lot of issues and errors that you could not have anticipated when the application was not actually live yet.  Everything may run smoothly when running the application you built on your local machine, but that may not always be the case when you move the application to a different platform or when you have hundreds of users sending requests at once.  Given all of this, I wanted to ensure that I built logging and error handling within the application in a way that is actually useful and helps provide stability to my application.  I have never built an actual full scale application until now, nor have I used many of the tools prior to this project, so I know there are going to be challenges with standing the application up that I did not anticipate.  In order to achieve long-term stability for my application, I needed to be able to not only catch any errors that occur but also be able to track the errors and fix them.

Catching the errors is relatively easy in Express as you can add a middleware function at that catches all uncaught errors.  Within my applications code, there are very few try catch blocks unless absolutely needed as I wanted to be able to keep the code clean.  I did add a lot of catches to async functions as this allowed me to append where in the code the error happened at.  I found that it could be quiet challenging to do a stack trace when the error occurs in a async function as the stack gets somewhat messy when utilizing await.  Whenever I am calling an async function, I catch all of the async functions errors in the calling function.  When the errors are caught,  I create a new error within the catch so that I can get a rough estimate of what line called the async function.  I then take the first line of the stack from the stack of the new error and append it to the existing stack of the original error and rethrow the error so that it can propagate all the way up the stack, appending what functions called each other as needed.   Once the error makes it all the way back to the top of the stack, I have the original error still along with a full stack trace of what functions were called to get to that point.  For all of the functions that are not async functions, the errors are simply thrown without appending the stack as I should already have where it occurred in the stack trace.  All errors that are uncaught will eventually make their way to my error handling middleware function.  There are some exceptions where I do catch the error without throwing it again as I may have expected it and do not necessarily need to propagate it all the way up.
  
Once I have the error within my error handler function, I have to determine how I am going to log it.  I decided to build out a few [functions](https://github.com/mas682/React-Movie-App/tree/master/movie-app-api/src/ErrorHandlers) to handle different types of errors that come into my error handling middleware function along with the Winston package to be able to handle logging in my application.  At a high level overview, I have a general [error receiver](https://github.com/mas682/React-Movie-App/blob/master/movie-app-api/src/ErrorHandlers/ErrorReceiver.js) that receives all the errors.  This function determines the type of error and then sends the error to the appropriate error handling function.  For example, I have a [Sequelize error handler](https://github.com/mas682/React-Movie-App/blob/master/movie-app-api/src/ErrorHandlers/SequelizeErrorHandler.js) that is used to handle all of the errors that come in due to errors with Sequelize, which I am using to do the database queries.  I also have a [default error handler](https://github.com/mas682/React-Movie-App/blob/master/movie-app-api/src/ErrorHandlers/DefaultErrorHandler.js) which is used for any error that I do not classify into a specific type such as a variable using before it was actually declared.  These functions take into account where the error occurred so that they can know what to do with the error.  In some cases I may simply catch the error and return the appropriate status code.  In other cases, I may log the error and then return the appropriate status code.  To give an example of how this would work, if a user tries to sign up with a username that already exists, I will get a unique constraint error back from Sequelize as the username already exists.  In this scenario, the error handling function will simply return a 409 error code and not log the error as I built into the error handler to know if the error occurs in the sign up function simply return a 409 status.    If for some unexpected reason a unique constraint error comes back on a user's username from some other request that is not for signing up, I probably did not expect that to occur.   In this scenario, the error handler is programmed to write unexpected errors to the log file and indicate in which file and function it occurred so I can try to figure out what went wrong.  

Given my experience as a software developer at PNC, I have learned to see the value in reporting and how you can build your data so that it can be usable for reporting purposes.  For this reason, I have built my error logs to be in JSON format so that I can easily parse out the data.  I have also defined error codes for each of the errors that occur for two reasons.  The first being so that I can create reporting around how often each error or each type of error is occurring.  I arranged the [error codes](https://github.com/mas682/React-Movie-App/blob/master/movie-app-api/ErrorCodes_v2.json) in a way that the numbers have some relevance, such as the range 10000-20000 being for Sequelize errors, 10000-10999 are for unique constraint errors, 11000-12999 are for foreign key constraint errors, and so on.   The second reason I have error codes is so that if a user is reporting a problem, they may have an error code to be able to give an indication of what their issue was.  I also want to mention that I am also logging more than just errors.  Any time a request comes in, I log the request as well as the response sent back by the server utilizing Winston along with the package Morgan.   Both requests and responses get logged with when they were written to the log, the endpoint the request was going after, a unique identifier for the request, who sent the request if the user sent a cookie that is valid, and what IP address the request came from.  Response logs have some additional data including the response code, how long the request took, and the response message if the request returned something other than a 200, 201, or 401 response code.   

This is my solution to building error handling and logging for the application but it is not a finished solution by any means.  I am hoping all the logging will help me get a better understanding of how my application is performing as well as give me an idea of what I need to put more focus on.  I am sure as I learn more I will have to make changes and enhancements to this process but I think it is a solid foundation to start with.



## Future plans
