const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const lines : number = 4
const scGap : number = 0.05
const scDiv : number = 0.51
const sizeFactor : number = 3
const strokeFactor : number = 90
const backColor : string = "#BDBDBD"
const foreColor : string = "#4CAF50"
class BiFStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : BiFStage = new BiFStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

const maxScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.max(0, scale - i / n)
}

const divideScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.min(1/n, maxScale(scale, i, n)) * n
}

const scaleFactor : Function = (scale : number) : number => Math.floor(scale / scDiv)

const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    const k : number = scaleFactor(scale)
    return (1 - k) / a + k / b
}

const updateValue : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawBFNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = w / (nodes + 1)
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const size : number = gap / sizeFactor
    context.strokeStyle = foreColor
    context.lineCap = 'round'
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.save()
    context.translate(i * gap + gap, h/2)
    context.rotate(Math.PI/2 * sc2)
    context.beginPath()
    context.moveTo(0, -size)
    context.lineTo(0, size)
    context.stroke()
    for (var j = 0; j < lines; j++) {
        const xi : number = j % 2
        const yi : number = Math.floor(j / 2)
        const si : number = 1 - 2 * yi
        const sc : number = divideScale(sc1, j, lines)
        context.save()
        context.scale(si, 1)
        context.translate(0, -size)
        context.beginPath()
        context.moveTo(0, size/2 * xi)
        context.lineTo(size/2 * (2 - xi) * sc, size/2 * xi)
        context.stroke()
        context.restore()
    }
    context.restore()
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += updateValue(this.scale, this.dir, lines, 1)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class BiFNode {
    prev : BiFNode
    next : BiFNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new BiFNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawBFNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BiFNode {
        var curr : BiFNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class BiF {
    root : BiFNode = new BiFNode(0)
    curr : BiFNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {
    bif : BiF = new BiF()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.bif.draw(context)
    }

    handleTap(cb : Function) {
        this.bif.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.bif.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
