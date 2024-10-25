/*
  Entity Events are custom functions that can be assign to all entities.
*/

export default {
  bouncePlayer(e) {
    // Change cube color to green
    e.target.model.material.color.set('#00ff00');

    // Bounce player
    e.pair.move(e.data);
    e.pair.velocity.y = 0.5;
  },
  resetBounce(e) {
    e.target.model.material.color.set('#0000ff');
  },
  teleport(e) {
    // Teleport player
    e.pair.setPosition(e.position);
  }
}