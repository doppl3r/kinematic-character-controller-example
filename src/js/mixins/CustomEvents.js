/*
  Entity Events are custom functions that can be assign to all entities.
*/

export default {
  teleport(e) {
    // Teleport player
    e.pair.setPosition(e.position);
  }
}