# Kinematic Character Controller Example
This example shows how to create a Kinematic Character Controller (aka "KCC") using Rapier.js and Three.js

## Quick links
 - [Character.js](src/js/entities/Character.js) - Creates a controller for the player movement.
 - [TriMesh.js](src/js/entities/TriMesh.js) - Creates a TriMesh shape using a 3D mesh.
 - [Debugger.js](src/js/Debugger.js) - Renders the Rapier.js `world` as a 3D object that can be added to a scene.

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

## Test Chrome Extension

- Rebuild extension and open Google Chrome
- Click Extensions > Manage Extensions
- Enable Developer mode (top right)
- Click `Load unpacked` and navigate to the `/dist` folder
- Open extension within Chrome

## Update NPM libraries

- Run `npm outdated`
- Run `npm i package-name@latest` (replace "package-name" for each package listed)