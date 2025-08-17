# Overview

This is a recreation of a Java applet created by me (Chris Dolan) in
the 1990s for a University of Wisconsin Astronomy lab course.

The original source code was
http://user.astro.wisc.edu/~dolan/java/nbody/Rocket.java but I was
unable to run it, so this recreation comes from that source code plus
a few screenshots.

# Setup, compilation

Install node.js from https://nodejs.org/en/download

Update to the newest npm: `sudo npm install -g npm`

`npm install typescript`

To recompile the Rocket.ts file, and overwrite the included Rocket.js file:

`tsc`

# Rocket vs. Asteroid mode

The application looks at it's own URL to decide if it's in Rocket mode
or Asteroid mode. If the URL contains "Asteroid.html" then Asteroid
mode, and everything else is Rocket mode. You'd think that we could do
that via options, but the code is sadly written assuming one mode or
the other right from the start.
