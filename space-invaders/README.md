# space-invaders
Space Invaders Project
We will be recreating the classic single player Space Invaders game in tinygraphics with some slight modifications. 
The user will be in control of a spaceship armed with lasers which they must use to shoot and destroy asteroids (colored gray) and enemies (colored purple) that are in their path while also replenishing their stock of ammo. 
If the ship sustains too much damage from being hit by asteroids (the user has a limited number of lives) then the game ends. 
If the ship runs out of ammo then the user must dodge asteroids and try to collect ammo packets (also called nebulas, colored green). 
Every time the ship successfully destroys an asteroid or enemy the user gets a point. 
The game becomes more difficult (the speed and frequency of asteroids, enemies, and ammo drops increases) after 20 points (easy), 40 points (medium), and 60 points (hard). 

Implementing a 3D version of this classic game will necessitate the use of matrix transformations, lighting, and texture. 
Most obviously, the movement of the spaceship, lasers, and oncoming asteroids and enemies will be implemented with matrix transformations, that primarily incorporate translation matrices. 
As the user advances further into the game and accumulates a higher score, the difficulty will increase as more asteroids, enemies, and ammo drops spawn at a time. 
We will also use the spaceship as a light source whose effect on the asteroids will adjust as the user moves it left and right. 
Finally, we will use texture to make the spaceship look more realistic and give the ship, lasers, asteroids, and enemies (which we will model as spheres) a rougher and more worn look.

The advanced feature implemented in our project will be collision detection, which we will use to identify when an asteroid, enemy, or ammo drop has been hit by a laser so that we can award the user points or ammo. 
Additionally, we will use collision detection to identify if an asteroid or enemy has hit the spaceship, in which case we should decrease the number of lives or end the game if the user is out of lives. 
Finally, we will use collision detection to identify if an ammo drop has hit the spaceship, in which case we will increment the ship’s remaining laser count.

The user will be able to use the ‘a’ and ‘d’ keys on the keyboard to move the spaceship left and right on the screen. 
They will also be able to use the enter key to fire a laser straight ahead. 
This combination of moves will allow them to fire at and destroy any combination of asteroids that will spawn at the top of the screen and slowly move their way towards the bottom. 
Alternatively, if the user cannot destroy all of the asteroids and enemies (either because they were too slow or because there are too many or because they ran out of ammo), then they can move the spaceship to avoid being hit and collect ammo. 
The user starts with a predetermined number of lives and can regain lives by shooting a special power up that will spawn every once in a while. 
As with most games, the user will be able to pause and restart the game.
