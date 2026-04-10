// Game Over Scene

class GameOverScene {
  constructor(score) {
    this.score = score;
    this.deathTime = 0;
    this.rebirth = 0;
    this.lastBossDefeated = 0;
  }

  // Update
  update(deltaTime) {
    // Count deaths
    player.deaths++;
    player.lastDeathTime = game.time;
    player.rebirthCount++;
    player.rebirthTime = game.time;

    // Count boss kills
    if (player.lastBossDefeatedTime) {
      const timeSinceBoss = game.time - player.lastBossDefeatedTime;
      if (timeSinceBoss > 5000) {
        player.lastBossDefeated = true;
        console.log('Boss kill confirmed');
      }
    }

    return true;
  }

  // Draw
  draw(ctx) {
    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

    // Draw death particles
    particles.spawnExplosion(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 30, '#ff4444');

    // Draw game over text
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 72px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('DEFEAT', GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 - 50);

    // Draw stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${this.score}`, GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 + 10);

    ctx.fillText(`Time: ${Math.floor(player.lastDeathTime / 1000)}s`, GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 + 40);

    // Draw achievements
    const achievements = [];
    if (player.rebirthCount > 0) {
      achievements.push('Rebirth x' + player.rebirthCount);
    }
    if (player.lastBossDefeated) {
      achievements.push('Boss Hunter');
    }

    if (achievements.length > 0) {
      ctx.fillStyle = '#ffff44';
      for (const [i, achievement] of achievements.entries()) {
        ctx.fillText(achievement, GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2 + 80 + i * 25);
      }
    }

    // Draw restart button
    ctx.fillStyle = `rgba(157, 0, 255, 0.8)`;
    ctx.fillRect(GAME_CONFIG.WIDTH / 2 - 120, GAME_CONFIG.HEIGHT - 80, 240, 40);
    ctx.strokeStyle = '#9d00ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(GAME_CONFIG.WIDTH / 2 - 120, GAME_CONFIG.HEIGHT - 80, 240, 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to Restart', GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 55);
  }

  // Handle input
  handleInput(key) {
    // Restart
    if (key === ' ') {
      return 'restart';
    }
  }
}
