# React Movie App (MovieFanatics)

## Overview
This project started around June 2020 with the intent of building a web application in which users can rate movies and share it with their friends.  There were a few reasons for building the project.  The first reason is I wanted to just have fun building something that I wanted to build.  In the past, just about all of my project have been something for work or school in which there were some sort of guidelines for what I was building.  The second reason is that I wanted to learn new technologies and tools that I have never used before.  Prior to this project, I had no previous experience with React or Express.js, and I also had limited prior exposure to technologies such as Docker and PostgreSQL.  Lastly, I wanted to put together everything I have learned over the years into one project to see what I could build.  Overall, I can say I have thoroughly enjoyed building this project.  I have been able to learn things I have never knew while also being tasked with challenges that I could have never anticipated.  I think the project has and will continue to make me a better software developer as well as continue to push me to places I have never gone before. 

## What technologies were used and why
Prior to even starting the project, I wanted to make sure I learned some new frameworks and technologies that I have never used before.  I also wanted to make sure I did not try to take a easy way out or shy away from a challenge.  Given this, I decided to use a few things I have never used before such as React, Express.Js, and Redis, along with a few things I needed to become more familiar with such as Docker, JavaScript, Linux, and PostgreSQL.  I was also able to utilize some things that I was familiar with such as Python, CSS, and HTML but I was able to enhance my skills with these due to this project.

## What did I learn
I could go on for a long time about what I learned from this project.  As I alluded to above, I intentionally wanted to bring a lot of these challenges upon myself as a oppurtunity to learn new things.  Prior to building the application, I had no experience with React, Express.Js, Redis, or Cron from Linux.  I also had very limited experience with Docker, PostgreSQL, and SQL.  Given that probably around 90% of the project was based upon using these tools, I had a lot to learn.  I have always learned better by being more hands on than by following a tutorial or book so I tried to limit myself to the very basics from the start so I could learn as I built the application.  Learning to use all these tools was challenging but I think the two most challenging things for me were learning to build a application that is scalable as well as determing the best design decisions for the application.  I honestly probably spent more time thinking through the design of the application than I did actually writing the code.  I had all sorts of problems that I had to come up with solutions for related to the design of the application and a few times I had to rethink my previous solution.  Here are some examples of the problems that I encountered:
- How should the sign up process work?
- How should the login process work?
- How should the job scheduler work?
- How can the application be built so that it can easily be moved from one server or host to another?
- How can I know when something goes wrong on the backend?

These problems are just a few that I encountered but these are the few I thought I should highlight.  I am going to walk through my solutions and thought process to each of these below but feel free to skip to whichever one(s) you are most interested in.

### How should the sign up process work?
***How should the sign up process work?
The sign up process for my application involves users entering their first name, last name, a username, email, and their password.  From a high level view this seems relatively easy to implement but I did find quiet a few challenges with this.  One of the first challenges I came across was how can I verify user accounts so that I do not get a lot of spam accounts in the system?  I decided I would use the users email as a way to verify users which would mean that I would have to generate some sort of secret that I could use to verify a user was who they claimed to be.  I made the process so that whenever a user signed up, a 6 digit code would be generated and sent to their email.  While waiting for the user to send back the response, the account was stored in a temporary table full of unverified users.  There was a restriction such that a user could request that up to 3 verification codes before the account was considered invalid. There is also another restriction so that a user could only try to validate a passcode 3 times at most so that someone could not try to brute-force the passcode. Once the user verified the email by sending back the right code, the account would then be moved to the actual users table and the user could now login.

For a while I thought this process was solid but I eventually noticed some rather glaring security holes.  One issue I had was I was storing user passwords in plaintext in the database.  Another somewhat related issue was that I was storing the generated passcode in the database in plain text as well.  These two were relatively simple to solve by simply creating a process that would add a salt value to the secret (the password or the passcode) and then hash it so that the value was encrypted.  I did this so that if the database ever became exposed, an attacker would not be able to know everyones passwords and they also would not be able to impersonate someone who has yet to verify their account.

Another problem that I encountered was someone could try to do a denial of service attack on users trying to sign up.  This would be somewhat challenging as the attacker would have to know when a user was signing up, but if they did they could request 3 verification codes be sent out immediately and then put in 3 invalid codes immediately so that a users temporary account would be considered invalid and they would have to sign up again.  I did not come up with a full proof way to prevent this yet but I did try to mitigate it some.  I added in a feature so that a user can only request a passcode be resent once every 1 minute.  I also removed the restriction of only being able to send 3 passcodes but the account would only be considered valid for 10 minutes before someone else could try to sign up with the username or email.  I did this for two reasons, the first being so that it would slow down an attacker trying to do a denial of service attack on a user signing up.  Every time they request to send a verification code, they will have to wait another minute for a new one to be sent.  The second reason I did this was to try to slow down someone flooding my backend server with requests for passcodes.  My idea behind this is if you wanted to flood the system with requests, you would have to keep creating many different accounts so that you could continuosly send requests.  This does not solve the issue of someone entering a invalid passcode 3 times immediately but it does help make the attack a little more challenging.  

The last problem I am going to mention for the sign up process was me putting the users into their own temporary table.  I did this originally as I did not want someone to flood my users table with fake accounts and cause a delay on the backend for the users who were actually verified.  The main issue with this is I had to ensure that a real user and a temporary user did not have the same email or username.  I built in some checks to see if a user already existed in the main user table when adding a temporary user account but there could still be a scenario where a actual user updates their email around the same time that another user was signing up with that same email.  In this case, two users would have the same email which would lead to issues with my forgot password functionality which revolved around users requesting a passcode to reset their password.  I ended up fixing this by putting all users(verified and unverified) into a single table with a boolean field indicating if the user was verified or not.  This was honestly just a bad design decisions by me but it was a learning experience as if I would of thought these things through more I could of avoided most of these issues.

## Future plans
