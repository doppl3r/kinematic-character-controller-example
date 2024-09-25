# Kinematic Character Controller Example
This example shows how to create a Kinematic Character Controller (aka "KCC") using Rapier.js and Three.js.

## Quick links
 - [Player.js](src/js/entities/Player.js) - Extends the `Character.js` class and adds keyboard input.
 - [Character.js](src/js/entities/Character.js) - An abstract class for Kinematic Character Controllers that extends [Entity.js](src/js/entities/Entity.js). Can be used for players, conveyors, doors, etc.
 - [Game.js](src/js/Game.js) - Handles all game states, entities, and resources.

## Screenshot
![Screenshot](public/png/screenshot.png)

## Local Development

 - Install NodeJS package libraries: `npm i`
 - If you get a dependency error, include the `--force` option
 - Run development libraries `npm run dev`
 - Use the link it provides

## Vite

This example uses [Vite](https://vitejs.dev) for hosting a local environment and includes commands to package/compile for web (similar to Webpack).

## Vue.js

Vue.js is used for the game UI, and leverages the latest "Composition API" introduced in version 3. Vue.js is "An approachable, performant and versatile framework for building web user interfaces".

### Example Component

 - [Button.vue](src/vue/Button.vue) - A simple Vue.js component you can modify.

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

## Social Media
- Threads: https://www.threads.net/@doppl3r
- Website: https://www.dopplercreative.com