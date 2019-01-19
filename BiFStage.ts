const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const lines : number = 4
const scGap : number = 0.05
const scDiv : number = 0.51
const sizeFactor : number = 3
const strokeFactor : number = 90
const backColor : string = "#BDBDBD"
class BiFStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : BiFStage = new BiFStage()
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
    return mirrorValue(scale, a, b) * dir
}

const drawBFNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = w / (nodes + 1)
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const size : number = gap / sizeFactor
    context.save()
    context.translate(i * gap, h/2)
    context.rotate(Math.PI/2 * sc2)
    context.beginPath()
    context.moveTo(0, -size)
    context.lineTo(0, size)
    context.stroke()
    for (var j = 0; j < lines; i++) {
        const xi : number = j % 2
        const yi : number = Math.floor(j / 2)
        const si : number = 1 - 2 * yi
        const sc : number = divideScale(sc1, j, lines)
        context.save()
        context.scale(si, 1)
        context.translate(0, -size)
        context.beginPath()
        context.moveTo(0, size/2 * xi)
        context.lineTo(0, size/2 * (2 - xi) * sc)
        context.stroke()
        context.restore()
    }
    context.restore()
}
