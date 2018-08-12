var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var ProgressLineToCircleStage = (function () {
    function ProgressLineToCircleStage() {
        this.canvas = document.createElement('canvas');
        this.lplc = new LinkedPLC();
        this.animator = new Animator();
        this.initCanvas();
        this.render();
        this.handleTap();
    }
    ProgressLineToCircleStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    ProgressLineToCircleStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.lplc.draw(this.context);
    };
    ProgressLineToCircleStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.lplc.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.lplc.update(function () {
                        _this.animator.stop();
                    });
                });
            });
        };
    };
    ProgressLineToCircleStage.init = function () {
        var stage = new ProgressLineToCircleStage();
    };
    return ProgressLineToCircleStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.dir = 0;
        this.prevScale = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += 0.05 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            }, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var PLCNode = (function () {
    function PLCNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    PLCNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new PLCNode(this.i + 1);
            this.next.prev = this;
        }
    };
    PLCNode.prototype.draw = function (context) {
        var gap = h / nodes;
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(this.state.scale - 0.5, 0)) * 2;
        context.lineWidth = Math.min(w, h) / 60;
        context.lineCap = 'round';
        context.strokeStyle = 'white';
        var factor = 1 - 2 * (this.i % 2);
        context.save();
        context.translate(w / 2 + w / 5 * sc2 * factor, this.i * gap + gap / 2);
        context.beginPath();
        for (var j = 0; j <= 360; j++) {
            var x = (gap / 2) * sc1 * Math.cos(j * Math.PI / 180);
            var y = (gap / 2) * Math.sin(j * Math.PI / 180);
            if (j == 0) {
                context.moveTo(x, y);
            }
            else {
                context.lineTo(x, y);
            }
        }
        context.stroke();
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    PLCNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    PLCNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    PLCNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return PLCNode;
})();
var LinkedPLC = (function () {
    function LinkedPLC() {
        this.root = new PLCNode(0);
        this.curr = this.root;
        this.dir = 1;
    }
    LinkedPLC.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedPLC.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    LinkedPLC.prototype.draw = function (context) {
        this.root.draw(context);
    };
    return LinkedPLC;
})();
