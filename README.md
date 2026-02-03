****DECApp READ ME****

Overview: The app is a study tool for deca members at NCHS. After entering the password they have access to all of the carreer clusters to study the performance indicators they need to know for deca. All of the performance indicators and their meanings can be edited with an edit mode for all who have "teacher_override" in the prvileges colum of the user table. People with teacher override also have the power to change the password to the app. Logging in allows those with teacher override to edit, for students it saes the last flashcard they were on and in the future will save the edit stats.

Platform Requirements: Windows, VSCode, React, Node Js

Installation Requirements:
1. Enter cd my-react-app into the terminal
2. Enter npm install
3. Create in .env file in the server folder, Dr Miller can give you the information, it should be structured as follows:
Host=******
User=******
Password=******
Note: The passwords are not in any quotes and their is no end line character, simply go to a new line for each line.

Note: It is highly reccomended that you use nodemon over node as nodemon will auto update when you make changes to the server code while node will not, the install package may not automatically install nodemon, if you are having issues try using npm install '--save-dev nodemon' in the console, if that doesn't work you can use 'npm install -g nodemon' but that will install it globally on your computer

Instructions to run the app:
1. Open up two seperate terminals
2. In terminal one enter: cd my-react-app
3. In terminal one enter: cd src
4. In terminal one enter: cd Server
5. In terminal one enter: nodemon server.js or node sever.js
6. In terminal two enter: cd my-react-app
7. In terminal two enter: npm run 
(note for 7): use "npm run start" (no quotes) instead. if it gives a react-scripts error, do "npm install"
Note: If every step works correctly it should open up a tab in google automatically called localhost:3000
Note: To stop running either the server click on the corresponding terminal and hit ctrl+c

APP Structure:
components: All of the components which will be used on more than one page are in the components folder. Protected route makes it so that people cannot brute force open a certain page by typing the url into the search bar if they either havn't put the password in or don't have edit access.
images: All of the icons and logos used throughout the app
pages:Every individual page of the website, each page has a folder with the pages css and the jsx of the page, any features specific to one page should have their own css in the corresponding folder.
Routes: This page runs runs a page depending on the url in the header, when making a new page you must have the corresponding URL in the routes or the jsx for the page will not run.
Server: This handles the connection to the server. Every time data is needed from the database or is needed to be added to the database the server handles the actual mysql calls and sends it to the JSX of the page you are making which must have code to recieve the post.
App.css: App.css sets the default styles for the whole app, this is where all of the color variables are defined, any standardizes css should be done in app.jsx and is usable in any of the pages.

Database:
MySql Database, you need the env file to connect to it. With the info for the env file you can set up a connection with mysql workbench which is needed to see the structure and the table data. The tables are as follows:
I_Know_This_Terms: Stores the know terms when someone clicks the i know this button, it has the persons google ID and the performance indicator they are skipping it also store the cluster
Password: Has one table which should only have one row and one column for storing the password to the app. If you don't know the password you can find it by inspecting this table
PI's: Has all of the performance indicators with their meaning and cluster along with an auto incremented id
Stats: Not yet implemented, database is set up with google id, time, NumCards, AvgTime, stat_date, data is added, it is just not yet displayed anywhere in the app
Users: Stores all of the user data in the database, the data is set when the user logs in.

****NOTE: To give someone edit access you need to put teacher_override in the privileges column of the user table

Know Issues: The server crashes on the official server after an unknown ammount of time.
