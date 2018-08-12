const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class ProgressLineToCircleStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    constructor() {
        this.initCanvas()
        this.render()
        this.handleTap()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#BDBDBD'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : ProgressLineToCircleStage = new ProgressLineToCircleStage()
    }

}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.1 * this.dir
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
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class PLCNode {
    state : State = new State()
    next : PLCNode
    prev : PLCNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new PLCNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / nodes
        const sc1 : number = Math.min(0.5, this.state.scale) * 2
        const sc2 : number = Math.min(0.5, Math.max(this.state.scale - 0.5, 0)) * 2
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        context.strokeStyle = 'white'
        context.save()
        context.translate(this.i * gap + gap/2, h/2 + h/5 * sc2)
        context.beginPath()
        for(var j = 0; j <= 360; j++) {
            const x : number = (gap/2) * Math.cos(j * Math.PI/180)
            const y : number = (gap/2) * Math.sin(j * Math.PI/180)
            if (j == 0) {
                context.moveTo(x, y)
            } else {
                context.lineTo(x, y)
            }
        }
        context.stroke()
        context.restore()
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) {
        var curr : PLCNode = this.prev
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

class LinkedPLC {

    curr : PLCNode = new PLCNode(0)
    dir : number = 1

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir,() => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }
}
