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
