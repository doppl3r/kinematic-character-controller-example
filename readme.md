# Kinematic Character Controller Example
This example shows how to create a **Kinematic Character Controller** (aka "KCC") using Rapier.js and Three.js.

## Quick links
 - [Player.js](src/js/entities/Player.js) - Extends the `Character.js` class and adds keyboard input.
 - [Character.js](src/js/core/entities/Character.js) - An abstract class for Kinematic Character Controllers that extends [Entity.js](src/js/core/entities/Entity.js). Can be used for players, conveyors, doors, etc.
 - [Game.js](src/js/core/Game.js) - Handles all game states, entities, and resources.

## Screenshot
![Screenshot](public/png/screenshot.png)

## Other Features

### Interpolation

To improve visual performance, this example separates the physics engine and the rendering engine into 2 separate "loops". The physics engine loop runs at 30hz, while the rendering loop runs at the refresh rate of your monitor (ex: 240hz).

The alpha value is calculated by adding the sum of time that has changed between these two loops (value will always be between 0.0 and 1.0). The alpha value is then applied to the 3D objects position/rotation each time the rendering loop is called.

Here is a **slow motion** example that demonstrates the interpolation between the physics engine and the graphical rendering. Without interpolation, the game would appear as choppy as the wireframes.

![Screenshot](public/gif/interpolation.gif)

### Custom Events

The physics entity system is designed to dispatch events to observers by event type (ex: `collision`, `added`, `removed` etc). The following example shows how you can prescribe a `collider` event to a specific entity using JSON data:
```
const entity = EntityFactory.create({
  "type": "cube",
  "events": [
    {
      "name": "bounce",
      "velocity": { "x": 8, "y": 0, "z": 0 }
    }
  ]
});
```

**Note**: *All events are only applied to the first collider assigned to the entity.*

Whenever this entity collides with another entity (or its pair), it will attempt to perform the `bounce` function assigned to this entity. If this function does not exist, you can assign the function to the entity after it is created:
```
entity.bounce = function(e) {
  // Apply velocity to the entity pair
  e.pair.setLinvel(e.velocity);
}
```

## Local Development

 - Install NodeJS package libraries: `npm i`
 - If you get a dependency error, include the `--force` option
 - Run development libraries `npm run dev`
 - Use the link it provides

## Vite

This example uses [Vite](https://vitejs.dev) for **hosting** a local environment and includes commands to **package** for web (similar to Webpack).

## Vue.js

[Vue.js](https://vuejs.org/) is used for the game UI, and leverages the latest **Composition API** introduced in version 3. This JavaScript framework is *"An approachable, performant and versatile framework for building web user interfaces"*.

**Example Component**

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