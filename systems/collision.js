// Collision Detection System

const CollisionSystem = {
  // AABB collision (axis-aligned bounding box)
  checkAABB: (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  },

  // Circle collision (for projectiles)
  checkCircle: (center1, radius1, center2, radius2) => {
    const dx = center1.x - center2.x;
    const dy = center1.y - center2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  },

  // Circle to AABB collision
  checkCircleAABB: (circle, rect) => {
    const dx = Math.max(rect.x, circle.x - Math.abs(rect.width / 2));
    const dy = Math.max(rect.y, circle.y - Math.abs(rect.height / 2));
    const distX = circle.x - dx;
    const distY = circle.y - dy;
    return (distX * distX + distY * distY) < Math.abs(circle.r * circle.r);
  },

  // Point in rect
  checkPointInRect: (point, rect) => {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  },

  // Get overlap between two rects
  getOverlap: (rect1, rect2) => {
    const xOverlap = Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x));
    const yOverlap = Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y));
    return { xOverlap, yOverlap };
  },

  // Check if entity is outside screen
  checkOutOfBounds: (entity, width, height) => {
    return (
      entity.x < 0 ||
      entity.x + entity.width > width ||
      entity.y < 0 ||
      entity.y + entity.height > height
    );
  },

  // Check if within screen bounds
  checkInBounds: (entity, width, height) => {
    return !(
      entity.x < 0 ||
      entity.x + entity.width > width ||
      entity.y < 0 ||
      entity.y + entity.height > height
    );
  },

  // Check if two circles collide
  checkCircleCircle: (c1, r1, c2, r2) => {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  },

  // Generic collision between two entities
  checkEntities: (entity1, entity2) => {
    const center1 = entity1.getCenter ? entity1.getCenter() : { x: entity1.x, y: entity1.y };
    const center2 = entity2.getCenter ? entity2.getCenter() : { x: entity2.x, y: entity2.y };
    const r1 = Math.max(entity1.width, entity1.height) / 2;
    const r2 = Math.max(entity2.width, entity2.height) / 2;

    const dx = center1.x - center2.x;
    const dy = center1.y - center2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < r1 + r2;
  }
};

export { CollisionSystem as Collision };
