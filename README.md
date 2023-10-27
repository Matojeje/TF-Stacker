[]OVERVIEW[]
Welcome to TF Stacker, a fully customizable transformation "game" where you click buttons to transform a character and watch what happens!

In this game, you can stack multiple different transformations on top of one another, and the order in which you do so will have an effect on the result!

The game itself doesn't include any of the images. Instead, these are stored in a separate database, along with the name of the character and the different transformations available for them. You specify which database you want to use when starting the game, so you can have any number of them! Thanks to this, it's incredibly easy to modify the game with your own characters and transformations! The number of possible combinations increases exponentially as the number of TFs increases, so it's a good thing that the game can tell when an image is missing and use a placeholder for it instead!

The game is currently in a very early prototype state and features only the bare minimum features. There are some other things that I want to do with this project when I have the time, and while I can make no promises that they'll actually be done, I figured I'd share them anyway:
    - Indicators for which transformation buttons would lead to an image rather than a placeholder.
    - A visual representation of the order of transformations currently applied.
    - An overall improved visual presentation, with sound effects and nice-looking UI.
    - A way for artists to be credited for their images in the case of collaborative databases (currently the only way to do this is to have the artists sign their 
    names on the images themselves, I'm still not sure how I'd go about this).
    - A small *poof* animation that plays when you transform the character.
    - A selection of backdrops to swap between (customizable in databases).
    - A background music track (customizable in databases).
    - Random funny dialogue lines that the character says when you first start the game (customizable in databases).
    - A tree that shows all possible transformation combinations and which ones have images (very unlikely to actually happen, but it's fun to think about).

This project has been designed to run on Windows 64-bit machines. I might try making it work for Mac and Linux at some point, but that depends on how differently the file systems are for those platforms.



[]PLAYING THE GAME[]
If you want to play the game, you'll first need to download the zip file of the latest version from the Builds folder. From there, unzip it where you want and 
open the "TF Stacker" Unity application to run it! You'll need a database to actually play the game, though. You can find a demo database featuring Draden the 
dragon and two different transformations in the Databases folder. Just download the zip for that, unzip it, copy its directory path (located near the top of the file explorer), and paste that into the dialogue box on the startup screen. The game will warn you of any issues with the database when you press start, though if you downloaded the demo database and didn't modify it at all then it should be fine so long as the path is correct. From there, you can press the buttons along the top of the screen to transform the character, and use the undo button at the top-right to undo the most recent transformation!

If you're having trouble finding where to download the files from the GitHub repo, here's some quick steps to do download the latest build:
1. Click on the "Builds" folder shown on the main GitHub page.
2. Click on the .zip file for the latest release of TF Stacker. (Would be names something like "v#-#-#.zip".)
3. Click on the little download button shown on the top left of the area with the blue "View raw" text.
You follow pretty much the same steps to download the .zip of the demo database.

An example of a correct directory path when starting the game would be something like: "C:\Users\<User>\Documents\<DatabaseFolder>"



[]CREATING A DATABASE[]
Creating a database for TF Stacker is incredibly easy! Just follow these steps and you'll have your own version of TF Stacker running in no time! You can refer to the demo database in the Databases folder for an example of a correctly prepared database.

1. Create the database folder.
    This folder can be named whatever you want and placed wherever you want. Just make sure that you can find it!
2. Create the Names.txt file.
    You'll need to create a text file called Names.txt. On the first line of this file, write the name of your character (this will need to be reused exactly later), and on the second line write your own name. The game doesn't currently do anything with your name, but in the future I plan to have a little bit of text displaying who made the database. Try not to use any spaces or funky characters in these names, or any other file or folder names in the database. An example Names.txt file would be:

        Draden
        DonHp

3. Create the Transformations.txt file.
    Next you'll need a text file called Transformations.txt to store the transformations for your database. The first line should be a number from 1 to 10, which represents how many transformations are in this database (you're limited to 10, but even just 5 creates a ridiculous number of possible combinations). Each subsequent line should be the name of a transformation. An example Transformations.txt file would be:

        2
        Inflatable
        Standee

4. Create the sub folders.
    You'll need to create two sub folders within the main database folder. First, a folder called "Transformation_Icons" for the transformation button icons, and then a folder called "Character_Images" for all of the character images in the database. Then, within the "Character_Images" folder, create a sub folder for each of the different transformations listed in the Transformations.txt file. MAKE SURE THAT THESE ARE NAMED EXACTLY LIKE THE TRANSFORMATIONS ARE LISTED IN THE TEXT FILE, CASE SENSITIVE AND ALL!

5. Add the transformation button icons.
    Since you can specify your own transformations, you can also create your own icons for the transformation buttons! These icons must be 256x256 pixels, and should be named EXACTLY the same as the transformations listed in the Transformations.txt file. For example, the icon for a transformation listed as "Inflatable" should be named "Inflatable.png". The game won't break if these icons are missing, and instead will display an "Image Missing" placeholder image for the button.

6. Add the default character image.
    Every database needs a default character image for you to start out with. This should be your character in their natural state, without any transformations applied to them. The image file should be named "<Character>.png" with <Character> being replaced with the character's name EXACTLY as it is specified in the Names.txt file (you're probably starting to see a pattern here...). Place this image into the "Character_Images" folder, NOT any of the individual transformation subfolders. Just like with the icons, if this is missing it will be displayed with the placeholder image instead.

7. Add the rest of the transformation images.
    Now it's time for the fun part! Each transformation image should follow the naming format <Character>%<Transformation>%<Transformation>.png with <Character> replaced by the character's name EXACTLY as it is specified in the Names.txt file and each <Transformation> being replaced with the corresponding transformation EXACTLY as it is specified in the Transformations.txt file. You can have up to ten transformations, separated by '%' symbols, and these are in the order of earliest transformation to latest (i.e. if a Draden was first transformed into an Inflatable and then a Standee, then the resulting image would be named "Draden%Inflatable%Standee.png").

    As for where these images go, the images for a single transformation go into their respective sub-folders in the "Character_Images" folder, alongside every image branching off of them. For example, the images "Draden%Inflatable.png" and "Draden%Inflatable%Standee.png" both go into the "Character_Images/Inflatable" folder, while the "Draden%Standee.png" and "Draden%Standee%Inflatable.png" images both go into the "Character_Images/Standee" folder.

    Once again, if a transformation image is missing, the game will display it with the placeholder. As the number of these images quickly skyrockets the more TFs are added, it's only natural that many combinations won't have images right away, if at all!

And that should just about do it! Now with your completed database, all you need to do is copy and paste the path to it into the text field on the startup screen and you'll be able to play TF Stacker with your own character and transformations! You can create as many databases as you want too, so go wild!