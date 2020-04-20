# quotesnstories_task
Assignment for quotesNstories Internship - Problem 1

# Live Urls
to add an event: https://quotesnstories.hyderdevelops.ml/add-event
to show events: https://quotesnstories.hyderdevelops.ml/show-events

# Description
Based on oAuth 2.0, this service allows a user to show events and create google calendar events.
It makes use of standard googleapis SDK for invoking tokens and access codes.

# Getting Started
We need to login into console.developer.google and initiate a project.
Specify the APIs and Services that project will be using.
Once this is set, obtain oAuth credentials. These credentials will be used to obtain access codes.
It is important to note that we need to specify redirect urls in the console itself.

# Setting Credentials
use the obtained credentials and place them in config file in server.js
Make routes keeping in consideration the redirect urls that have been authorized in google console otherwise it will fail.

# Setting it up
sudo npm init // installs dependencies
sudo node server.js // starts the server default runs on 5000 port

