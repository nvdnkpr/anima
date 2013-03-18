/**
 * Creates a set of parallel animations
 * @param {Item} item
 * @param {Array} animations
 * @param {number} duration
 * @param {string} ease
 * @param {number} delay
 * @constructor
 */
function Sequence(item, animations, duration, ease, delay) {
    EventEmitter.call(this)

    this.item = item

    this.animations = animations.map(function (a) {
	return new Animation(item,
	    {
		translate: a.translate,
		rotate: a.rotate,
		scale: a.scale,
		opacity: a.opacity
	    },
	    a.duration || duration,
	    a.ease || ease,
	    a.delay || delay
	)
    })

    this.start = null
    this.delay = 0
    this.easeName = ease || 'linear'
    this.duration = Math.max.apply(null, this.animations.map(function (a) {
	return a.duration + a.delay
    }))

    this.inifinine = false
}

Sequence.prototype = new EventEmitter

/**
 * Initializes all animations in a set
 * @param {number} tick
 * @param {boolean=} force Force initialization
 * @fires Sequence#start
 */
Sequence.prototype.init = function (tick, force) {
    if (this.start !== null && !force) return
    this.start = tick
    this.animations[0].init(tick, force)
    this.emit('start')
}

Sequence.prototype.animate = function () {
    return this.item.animate.apply(this.item, arguments)
}

Sequence.prototype.css = function () {
    return this.item.css()
}

Sequence.prototype.infinite = function () {
    this.item.infinite = true
    return this
}

/**
 * Runs one tick of animations
 * @param {number} tick
 */
Sequence.prototype.run = function (tick) {
  while (this.animations.length !== 0) {
    var first = this.animations[0]
    first.init(tick)
    if (first.start + first.duration <= tick) {
      this.animations.shift()
      first.end()
      continue
    }
    first.run(tick)
    break
  }
}

/**
 * Pauses animations
 */
Sequence.prototype.pause = function () {
    this.animations.length && this.animations[0].pause()
}

/**
 * Resumes animations
 */
Sequence.prototype.resume = function () {
    this.animations.length && this.animations[0].resume()
}

/**
 * Ends all animations in a set
 * @param {boolean} abort
 * @fires Sequence#end
 */
Sequence.prototype.end = function (abort) {
    for (var i = 0; i < this.animations.length; ++i) {
	this.animations[i].end(abort)
    }
    this.emit('end')
}
