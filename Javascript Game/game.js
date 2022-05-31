const CANVAS_WIDTH = 600,
  CANVAS_HEIGHT = 600,
  MARGIN = 30,
  SCORE_PER_KILL = 10,
  SCORE_TO_WIN = 50

class Bullet {
  constructor(ctx, x, y) {
    this.ctx = ctx
    this.width = 2
    this.height = 20
    this.x = x
    this.y = y
  }

  update() {
    const ctx = this.ctx

    ctx.fillStyle = 'red'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

class Player {
  constructor(ctx, width, height, x, y, img) {
    this.ctx = ctx
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.bullets = []
    this.cooldown = false

    const image = new Image()

    image.src = img

    this.img = image
  }

  update() {
    const ctx = this.ctx

    ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
  }

  shoot() {
    new Audio('laser.m4a').play()

    this.bullets.push(new Bullet(this.ctx, this.x + this.width / 2, this.y - 20))

    this.cooldown = true

    setTimeout(() => {
      this.cooldown = false
    }, 500)
  }
}

class Enemy {
  constructor(ctx, width, height, x, y, img) {
    this.ctx = ctx
    this.width = width
    this.height = height
    this.x = x
    this.y = y

    const image = new Image()

    image.src = img

    this.img = image
  }

  update() {
    const ctx = this.ctx

    ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
  }
}

const game = {
  canvas: document.getElementById('game'),
  frameNo: 0,
  keys: [],
  ctx: null,
  lives: 3,
  score: 0,
  player: null,
  enemies: [],

  init() {
    this.canvas.width = CANVAS_WIDTH
    this.canvas.height = CANVAS_HEIGHT

    this.ctx = this.canvas.getContext('2d')

    this.showMainMenu()
  },

  start() {
    this.player = new Player(
      this.ctx,
      50,
      50,
      CANVAS_WIDTH / 2 - 25,
      CANVAS_HEIGHT - 75,
      'ship.png'
    )

    addEventListener('keydown', (e) => {
      this.keys[e.key] = true
    })

    addEventListener('keyup', (e) => {
      this.keys[e.key] = false
    })

    requestAnimationFrame(update)
  },

  showStats() {
    const ctx = this.ctx

    ctx.font = '20px Arial'
    ctx.textAlign = 'start'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('Lives : ' + this.lives, 10, MARGIN)
    ctx.fillText('Score : ' + this.score, 10, MARGIN * 2)
  },

  clear() {
    const ctx = this.ctx

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  },

  showMainMenu() {
    this.clear()

    const ctx = this.ctx

    ctx.font = 'bold 30px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText('Fly Fighter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
    ctx.font = '15px Arial'
    ctx.fillText('Klik untuk bermain', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)
    ctx.fillText('Gunakan anak panah untuk menggerakkan', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50)
    ctx.fillText('Gunakan spacebar untuk menembak', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70)

    this.showStats()

    this.canvas.addEventListener('click', () => {
      this.start()
    }, {once: true})
  },

  spawnEnemies() {
    const amount = random(3, 5)

    for (let i = 0; i < amount; i++) {
      const x = random(MARGIN, CANVAS_WIDTH - MARGIN - 50)
      const y = random(-50, -250)

      game.enemies.push(new Enemy(this.ctx, 50, 40, x, y, 'musuh.png'))
    }
  },

  reset(frame = false) {
    this.player = new Player(
      this.ctx,
      50,
      50,
      CANVAS_WIDTH / 2 - 25,
      CANVAS_HEIGHT - 75,
      'ship.png'
    )

    this.enemies = []

    if (!frame) {
      document.getElementById('wrapper').classList.remove('win')
      document.getElementById('wrapper').classList.remove('lose')
      this.frameNo = 0
    }
  },

  showRestart(message) {
    let ctx = this.ctx

    ctx.font = 'bold 20px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

    ctx = this.ctx

    ctx.fillStyle = 'white'
    ctx.fillRect(CANVAS_WIDTH / 2 - 60, CANVAS_HEIGHT / 2 + 10, 120, 40)

    ctx = this.ctx
    ctx.fillStyle = '#111111'
    ctx.textAlign = 'center'
    ctx.font = 'bold 17px Arial'
    ctx.fillText('Main Lagi ?', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36)

    this.canvas.addEventListener('click', () => {
      this.lives = 3
      this.score = 0

      this.reset()

      requestAnimationFrame(update)
    }, {once: true})
  }
}

function collide(object, otherObject) {
  let crashed = true

  if (object.x > otherObject.x + otherObject.width ||
    object.x + object.width < otherObject.x ||
    object.y > otherObject.y + otherObject.height ||
    object.y + object.height < otherObject.y
  ) {
    crashed = false
  }

  return crashed
}

function random(min, max) {
  return Math.floor((Math.random() * max) + min)
}

function update() {
  game.clear()

  game.enemies.forEach((enemy, enemyIndex) => {
    game.player.bullets.forEach((bullet, bulletIndex) => {
      if (collide(bullet, enemy)) {
        game.enemies.splice(enemyIndex, 1)
        game.player.bullets.splice(bulletIndex, 1)
        game.score += SCORE_PER_KILL
      }
    })

    if (collide(game.player, enemy)) {
      game.lives--
      if (game.lives > 0)
        game.reset(true)
    }
  })

  game.frameNo++

  if (game.frameNo === 1) {
    game.enemies.push(new Enemy(game.ctx, 50, 40, MARGIN, MARGIN, 'musuh.png'))
    game.enemies.push(new Enemy(game.ctx, 50, 40, CANVAS_WIDTH / 3 - 50, MARGIN, 'musuh.png'))
    game.enemies.push(new Enemy(game.ctx, 50, 40, CANVAS_WIDTH / 2 - 25, MARGIN, 'musuh.png'))
    game.enemies.push(new Enemy(game.ctx, 50, 40, CANVAS_WIDTH - 200, MARGIN, 'musuh.png'))
    game.enemies.push(new Enemy(game.ctx, 50, 40, CANVAS_WIDTH - MARGIN - 50, MARGIN, 'musuh.png'))
  } else if (game.enemies.length === 0) {
    game.spawnEnemies()
  }

  if (game.keys['ArrowLeft']) game.player.x -= 5
  if (game.keys['ArrowUp']) game.player.y -= 5
  if (game.keys['ArrowRight']) game.player.x += 5
  if (game.keys['ArrowDown']) game.player.y += 5

  if (game.keys[' '] && game.player.bullets.length < 3 && !game.player.cooldown) game.player.shoot()

  if (game.player.x + game.player.width >= CANVAS_WIDTH - MARGIN) game.player.x = CANVAS_WIDTH - MARGIN - game.player.width
  if (game.player.x <= MARGIN) game.player.x = MARGIN
  if (game.player.y + game.player.height >= CANVAS_HEIGHT - MARGIN) game.player.y = CANVAS_HEIGHT - MARGIN - game.player.height
  if (game.player.y <= MARGIN) game.player.y = MARGIN

  game.player.update()

  game.player.bullets.forEach((bullet, index) => {
    if (bullet.y + bullet.height <= 0) {
      game.player.bullets.splice(index, 1)
    } else {
      bullet.y -= 3
      bullet.update()
    }
  })

  game.enemies.forEach((enemy, index) => {
    if (enemy.y >= CANVAS_HEIGHT) {
      game.enemies.splice(index, 1)
    } else {
      enemy.y += 4
      enemy.update()
    }
  })

  game.showStats()

  if (game.lives === 0) {
    document.getElementById('wrapper').classList.add('lose')
    return game.showRestart('Game Over!')
  }

  if (game.score >= SCORE_TO_WIN) {
    document.getElementById('wrapper').classList.add('win')
    return game.showRestart('Anda menang!')
  }

  requestAnimationFrame(update)
}

game.init()