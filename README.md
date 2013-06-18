CreateJS-TicTacToe
=================

#### Simple tic-tac-toe game using CreateJS

This is a little experiment in making a simple game using canvas and Phonegap. It uses the CreateJS toolset; specifically EaselJS, PreloadJS, and TweenJS.

I wouldn't say there's anything particularly clever in this build and the graphics are not what I would call a completed state. If it progresses far enough I suppose I'll invest some time in making it visually appealing. It's just a simple project to play with canvas and Phonegap. I've only tested this on my personal phone which is a Samsung Victory running Android 4.1.2 so I have no idea on performance on other devices yet. This project makes heavy use of tweens so performance may degrade on older hardware.

There is an option between one and two players. The single player AI is rather basic and uses a brute force method to look for blocks; it doesn't really play to win. When playing two player you have the option to switch sides at the end of a game. The switching feature was designed with a mobile device of some sort with two players on either side of the device in mind, as well as Player 2 text. When this happens Player 2 becomes Player 1 and also gains control of the menus. If you do the switch on desktop then the menus will be upside down.

Here's the PhoneGap Build share page: https://build.phonegap.com/apps/441990/share

#### Things I might do:

Update graphics, especially that splash screen! Geez, it's ugly.

Use file system to save stats on games played.

Update to latest version of CreateJS.

More end game options such as ability to switch between one and two player without having to restart app.

Make AI look for wins and not just blocks.