// Boss Attack Pattern Generation

class BossPatternGenerator {
  static generate(pattern, boss, player) {
    const projectiles = [];
    const center = boss.getCenter();
    const playerCenter = player.getCenter ? player.getCenter() : { x: player.x, y: player.y };
    const count = boss.projectileCount;
    const speed = boss.projectileSpeed;
    const angle = boss.angle;
    const phase = boss.phase;

    switch (pattern) {
      case 'swarm':
        for (let i = 0; i < count; i++) {
          const a = (Math.PI * 2 / count) * i + angle;
          projectiles.push({ x: center.x, y: center.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, damage: boss.damage * 0.5, color: '#ff4444', size: 8 });
        }
        break;

      case 'beam':
        const beamAngle = Math.atan2(playerCenter.y - center.y, playerCenter.x - center.x);
        for (let i = 0; i < count; i++) {
          const offset = (i - count / 2) * 0.1;
          projectiles.push({ x: center.x, y: center.y, vx: Math.cos(beamAngle + offset) * speed * 1.5, vy: Math.sin(beamAngle + offset) * speed * 1.5, damage: boss.damage, color: '#ff00ff', size: 12, piercing: true });
        }
        break;

      case 'orbit':
        for (let i = 0; i < count; i++) {
          const orbitAngle = angle + (Math.PI * 2 / count) * i;
          projectiles.push({ x: center.x + Math.cos(orbitAngle) * 60, y: center.y + Math.sin(orbitAngle) * 60, vx: Math.cos(orbitAngle) * speed * 0.8, vy: Math.sin(orbitAngle) * speed * 0.8, damage: boss.damage * 0.7, color: '#9d00ff', size: 10, orbit: true });
        }
        break;

      case 'nova':
        const novaCount = count * (phase === 2 ? 2 : 1);
        for (let i = 0; i < novaCount; i++) {
          const a = (Math.PI * 2 / novaCount) * i;
          projectiles.push({ x: center.x, y: center.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, damage: boss.damage * 0.4, color: '#ffff00', size: 6 });
        }
        break;

      case 'crush':
        projectiles.push({ x: center.x, y: center.y, vx: 0, vy: 0, damage: boss.damage * 2, color: '#aa0000', size: 100, aoe: true, expand: true, maxSize: 150, duration: 1 });
        break;
    }

    return projectiles;
  }
}

export { BossPatternGenerator };
