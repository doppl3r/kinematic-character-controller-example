# Kinematic Character Controller Example
This example shows how to create a Kinematic Character Controller (aka "KCC") using Rapier.js and Three.js.

## Quick links
 - [Player.js](src/js/entities/Player.js) - Creates a controller with player movement.
 - [Character.js](src/js/entities/Character.js) - An abstract class for Kinematic Character Controllers (can be used players, conveyors, doors, etc.)
 - [Entity.js](src/js/entities/Entity.js) - The superclass for all entities.
 - [TriMesh.js](src/js/entities/TriMesh.js) - Creates a TriMesh shape using a 3D mesh.
 - [Debugger.js](src/js/Debugger.js) - Renders the Rapier.js `world` as a 3D object that can be added to a scene.
 - [Game.js](src/js/Game.js) - Handles all game states, entities, and resources.

## Screenshot
![Screenshot](public/png/screenshot.png)

## Local Development

 - Install NodeJS package libraries: `npm i`
 - If you get a dependency error, include the `--force` option
 - Run development libraries `npm run dev`
 - Use the link it provides

## Build for release

- Run build with `npm run build` to create a fresh `/dist` folder
- Compress `/dist` folder into a `.zip` file format

## Update NPM libraries

- Run `npm outdated`
- Run `npm i package-name@latest` (replace "package-name" for each package listed)

## Assets
- All 3D models and textures were designed by doppl3r (Jacob DeBenedetto), and can be used on any project with proper credit.

## Additional Resources
- Rapier.rs [Character Controller](https://rapier.rs/docs/user_guides/javascript/character_controller) Documentation.