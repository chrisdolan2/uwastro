"use strict";
// DO NOT edit the Rocket.js file
// Only edit the Rocket.ts file, then regenerate Rocket.js via `tsc`
// This version is a straight port of http://user.astro.wisc.edu/~dolan/java/nbody/Rocket.java changing as little as possible, warts and all.
// Earlier I tried to port + clean up in one go, but it was too hard to understand all the ancient Java code.
// Wrapper around an HTML span to show data
class JLabel {
    constructor(id) {
        let span = document.getElementById(id);
        if (!(span instanceof HTMLSpanElement)) {
            throw new Error("Missing span: " + id);
        }
        this.html_label = span;
    }
    setText(s) {
        this.html_label.innerHTML = s;
    }
}
class JEvent {
    constructor(target, id, arg) {
        this.target = target;
        this.id = id;
        this.arg = arg;
    }
}
JEvent.ACTION_EVENT = 1;
// Wrapper around an HTML button
class JButton {
    constructor(id, parent) {
        let b = document.getElementById(id);
        if (!(b instanceof HTMLButtonElement)) {
            throw new Error("Missing button: " + id);
        }
        this.html_button = b;
        this.html_button.addEventListener("click", () => parent.deliverEvent(new JEvent(this, JEvent.ACTION_EVENT, null)));
    }
    setLabel(s) {
        this.html_button.innerHTML = s;
    }
}
// Wrapper around an HTML text input field
class JTextField {
    constructor(id, parent) {
        let e = document.getElementById(id);
        if (!(e instanceof HTMLInputElement)) {
            throw new Error("Missing input text field: " + id);
        }
        this.html_element = e;
        this.html_element.addEventListener("change", () => parent.deliverEvent(new JEvent(this, JEvent.ACTION_EVENT, null)));
    }
    setText(s) {
        this.html_element.value = s;
    }
    getText() {
        return this.html_element.value;
    }
    getNumber() {
        return parseFloat(this.html_element.value);
    }
}
// Wrapper around an HTML checkbox
class JCheckbox {
    constructor(id, parent) {
        let e = document.getElementById(id);
        if (!(e instanceof HTMLInputElement)) {
            throw new Error("Missing input checkbox: " + id);
        }
        this.html_element = e;
        this.html_element.addEventListener("change", () => parent.deliverEvent(new JEvent(this, JEvent.ACTION_EVENT, null)));
    }
    setChecked(c) {
        this.html_element.checked = c;
    }
    isChecked() {
        return this.html_element.checked;
    }
    setState(c) {
        this.setChecked(c);
    }
    getState() {
        return this.isChecked();
    }
}
class JMenu {
    constructor(id, parent) {
        let m = document.getElementById(id);
        if (!(m instanceof HTMLSelectElement)) {
            throw new Error("Missing menu: " + id);
        }
        this.html_menu = m;
        this.html_menu.addEventListener("change", () => parent.deliverEvent(new JEvent(this, JEvent.ACTION_EVENT, null)));
    }
    appendChild(name, value) {
        let option = document.createElement("option");
        option.appendChild(document.createTextNode(name));
        option.setAttribute("value", value);
        this.html_menu.appendChild(option);
    }
    select(i) {
        this.html_menu.selectedIndex = i;
    }
    getSelectedIndex() {
        return this.html_menu.selectedIndex;
    }
}
class Rocket {
    populateMenus() {
        for (let i = 0; i < this.intThread.nobj; i++) {
            if (this.intThread.use[i]) {
                this.centermenu.appendChild(this.intThread.names[i], "" + i);
            }
            this.centermenu.select(0);
        }
        for (let i = 0; i < this.intThread.nobj; i++) {
            if (this.intThread.use[i]) {
                this.destmenu.appendChild(this.intThread.names[i], "" + i);
            }
            this.destmenu.select(this.intThread.realdestplanet);
        }
    }
    constructor() {
        this.astDistText = new JTextField("astDistText", this);
        this.astTanVelText = new JTextField("astTanVelText", this);
        this.astRadVelText = new JTextField("astRadVelText", this);
        this.astVelText = new JTextField("astVelText", this);
        this.astDayText = new JTextField("astDayText", this);
        this.astAngText = new JTextField("astAngText", this);
        this.astAngRText = new JTextField("astAngRText", this);
        this.astVelText2 = new JTextField("astVelText2", this);
        this.astDayText2 = new JTextField("astDayText2", this);
        this.astAngText2 = new JTextField("astAngText2", this);
        this.trailsCheckbox = new JCheckbox("drawtrails", this);
        this.twoDCheckbox = new JCheckbox("twoDCheckbox", this);
        this.captureCheckbox = new JCheckbox("captureCheckbox", this);
        //, BSCheckbox;
        this.useCheckbox = new Array(11);
        this.runbutton = new JButton("run", this);
        this.resetbutton = new JButton("restart", this);
        this.timeUp = new JButton("timestep-plus", this);
        this.timeDown = new JButton("timestep-minus", this);
        this.zoomIn = new JButton("zoom-plus", this);
        this.zoomOut = new JButton("zoom-minus", this);
        this.time = new JLabel("time");
        this.timestep = new JLabel("timestep");
        this.zoom = new JLabel("zoom");
        this.centermenu = new JMenu("center-on", this);
        this.destmenu = new JMenu("destmenu", this);
        // General variables
        this.startHandler = false;
        this.usecapture = true;
        this.use2D = true;
        this.useBSstep = false;
        this.drawtrails = true;
        this.astinput = false;
        this.running = false;
        this.threadstarted = false;
        this.ready = false;
        this.RocketMode = true;
        this.AsteroidMode = false;
        let i;
        this.getParams();
        if (this.RocketMode) {
            this.usecapture = true;
            this.use2D = true;
        }
        else {
            this.usecapture = false;
            this.use2D = false;
        }
        this.useBSstep = false;
        this.drawtrails = true;
        this.astinput = false;
        this.running = false;
        this.threadstarted = false;
        this.ready = true;
        this.intThread = new RocketThread(this);
        this.canvas = new RocketCanvas(this, this.intThread);
        this.populateMenus();
        this.astDistText.setText("" + this.intThread.astDist);
        this.astTanVelText.setText("" + this.intThread.astTanVel);
        this.astRadVelText.setText("" + this.intThread.astRadVel);
        this.astVelText.setText("" + this.intThread.astVel);
        this.astDayText.setText("" + this.intThread.astDay);
        this.astAngText.setText("" + this.intThread.astAng);
        this.astAngRText.setText("" + this.intThread.astAng);
        this.astVelText2.setText("" + this.intThread.astVel2);
        this.astDayText2.setText("" + this.intThread.astDay2);
        this.astAngText2.setText("" + this.intThread.astAng2);
        for (i = 0; i <= 10; i++) {
            this.useCheckbox[i] = new JCheckbox("use" + i, this);
            this.useCheckbox[i].setChecked(this.intThread.use[i]);
            new JLabel("use" + i + "Text").setText(this.intThread.names[i]);
        }
        this.twoDCheckbox.setChecked(this.use2D);
        this.captureCheckbox.setChecked(this.usecapture);
        this.trailsCheckbox.setChecked(this.drawtrails);
        this.setTime();
        this.setTimeStep();
        this.setZoom();
        this.startHandler = true;
        this.canvas.update(this.canvas.getGraphics());
    }
    getParams() {
        this.RocketMode = false;
        this.AsteroidMode = false;
        let url = window.location.href;
        if (!url) {
            this.RocketMode = true;
        }
        else {
            if (url.includes("Rocket.html")) {
                this.RocketMode = true;
            }
            else if (url.includes("Asteroid.html")) {
                this.AsteroidMode = true;
            }
            else {
                this.RocketMode = true;
            }
        }
        // Set one of the CSS classes to invisible.
        if (this.RocketMode) {
            document.styleSheets[0].insertRule(".asteroidmode { display: none; }");
        }
        else {
            document.styleSheets[0].insertRule(".rocketmode { display: none; }");
        }
    }
    setTime() {
        this.time.setText("" + (this.intThread.pos[0] / (this.intThread.tscale * 86400.0)) + "      ");
    }
    setTimeStep() {
        if (this.intThread.timeTweak == 0.0)
            this.timestep.setText("" + (this.intThread.tstep / (this.intThread.tscale * 86400.0)) + "     ");
        else
            this.timestep.setText("" + (this.intThread.tstep * this.intThread.timeTweak / (this.intThread.tscale * 86400.0)) + "      ");
    }
    setZoom() {
        this.zoom.setText("" + (Math.floor(100000.0 * this.canvas.zoom) / 100000.0) + "     ");
    }
    itemStateChanged(event) {
        let target = event.target;
        if (target == this.centermenu) {
            let i;
            let j;
            let n = this.centermenu.getSelectedIndex();
            for (i = 0, j = 0; i < n; i++, j++)
                while (!this.intThread.use[j])
                    j++;
            this.canvas.setCenter(j);
            /*
                } else if (target == BSCheckbox) {
                  useBSstep = BSCheckbox.getState();
                  intThread.queueReset();
            */
        }
        else if (target == this.twoDCheckbox) {
            this.use2D = this.twoDCheckbox.getState();
            this.intThread.queueReset();
        }
        else if (target == this.captureCheckbox) {
            this.usecapture = this.captureCheckbox.getState();
            this.intThread.queueReset();
        }
        else if (target == this.trailsCheckbox) {
            this.drawtrails = this.trailsCheckbox.getState();
            this.canvas.clearTrails();
        }
        else if (target == this.useCheckbox[0]) {
            this.intThread.use[0] = this.useCheckbox[0].getState();
        }
        else if (target == this.useCheckbox[1]) {
            this.intThread.use[1] = this.useCheckbox[1].getState();
        }
        else if (target == this.useCheckbox[2]) {
            this.intThread.use[2] = this.useCheckbox[2].getState();
        }
        else if (target == this.useCheckbox[3]) {
            this.intThread.use[3] = this.useCheckbox[3].getState();
        }
        else if (target == this.useCheckbox[4]) {
            this.intThread.use[4] = this.useCheckbox[4].getState();
        }
        else if (target == this.useCheckbox[5]) {
            this.intThread.use[5] = this.useCheckbox[5].getState();
        }
        else if (target == this.useCheckbox[6]) {
            this.intThread.use[6] = this.useCheckbox[6].getState();
        }
        else if (target == this.useCheckbox[7]) {
            this.intThread.use[7] = this.useCheckbox[7].getState();
        }
        else if (target == this.useCheckbox[8]) {
            this.intThread.use[8] = this.useCheckbox[8].getState();
        }
        else if (target == this.useCheckbox[9]) {
            this.intThread.use[9] = this.useCheckbox[9].getState();
        }
        else if (target == this.useCheckbox[10]) {
            this.intThread.use[10] = this.useCheckbox[10].getState();
        }
        else {
            if (this.RocketMode) {
                if (target == this.destmenu) {
                    let n = this.destmenu.getSelectedIndex();
                    let i;
                    let j;
                    for (i = 0, j = 0; i < n; i++, j++)
                        while (!this.intThread.use[j])
                            j++;
                    this.intThread.realdestplanet = j;
                }
            }
        }
        return false;
    }
    actionPerformed(event) {
        let target = event.target;
        if (target == this.intThread) {
            if (event.arg == this.canvas) {
                this.canvas.capture(this.intThread.capture);
            }
            else {
                this.setUnready();
                this.setTime();
                this.canvas.update(this.canvas.getGraphics());
            }
        }
        else if (target == this.resetbutton) {
            if (this.threadstarted) {
                if (this.running) {
                    this.intThread.queueReset();
                }
                else {
                    this.intThread.queueReset();
                    this.intThread.doResume();
                }
            }
        }
        else if (target == this.runbutton) {
            if (!this.running) {
                if (!this.threadstarted) {
                    this.threadstarted = true;
                    this.intThread.doStart();
                }
                else {
                }
                this.runbutton.setLabel("Stop");
                this.running = true;
                this.intThread.running = true;
                this.intThread.doResume();
            }
            else {
                this.runbutton.setLabel("Run");
                this.running = false;
                this.intThread.running = false;
                this.intThread.doStop();
            }
        }
        else if (target == this.timeUp) {
            this.intThread.adjustTimeStepUp(true);
            this.setTimeStep();
        }
        else if (target == this.timeDown) {
            this.intThread.adjustTimeStepUp(false);
            this.setTimeStep();
        }
        else if (target == this.zoomIn) {
            this.canvas.ZoomIn(true);
            this.setZoom();
        }
        else if (target == this.zoomOut) {
            this.canvas.ZoomIn(false);
            this.setZoom();
        }
        else if ([this.astAngRText, this.astVelText, this.astDayText,
            this.astAngText2, this.astVelText2, this.astDayText2,
            this.astDistText, this.astAngText, this.astTanVelText, this.astRadVelText]
            .find((e) => e == target)) {
            if (this.RocketMode) {
                this.intThread.doRocket(1, this.astAngRText.getNumber(), this.astVelText.getNumber(), this.astDayText.getNumber());
                this.intThread.doRocket(2, this.astAngText2.getNumber(), this.astVelText2.getNumber(), this.astDayText2.getNumber());
            }
            else {
                this.intThread.doAsteroid(this.astDistText.getNumber(), this.astAngText.getNumber(), this.astTanVelText.getNumber(), this.astRadVelText.getNumber());
            }
        }
        return false;
    }
    handleEvent(event) {
        if (!this.startHandler) {
            return false; // super.handleEvent(event);
        }
        if (event.id == JEvent.ACTION_EVENT) {
            if (this.itemStateChanged(event) || this.actionPerformed(event)) {
                this.canvas.update(this.canvas.getGraphics());
                return true;
            }
            else {
                this.canvas.update(this.canvas.getGraphics());
                return false; // super.handleEvent(event);
            }
        }
        else {
            return false; // super.handleEvent(event);
        }
    }
    deliverEvent(event) {
        return this.handleEvent(event);
    }
    isReady() {
        return this.ready;
    }
    setReady() {
        this.ready = true;
    }
    setUnready() {
        this.ready = false;
    }
}
class Dimension {
    constructor() {
        this.width = 0.0;
        this.height = 0.0;
    }
}
class RocketCanvas {
    size() {
        let dd = new Dimension();
        dd.width = this.html_canvas.width;
        dd.height = this.html_canvas.height;
        return dd;
    }
    constructor(parent, intThread) {
        this.d = new Dimension();
        let i;
        this.html_canvas = document.getElementById("canvas");
        this.ctx = this.html_canvas.getContext("2d");
        this.d = this.size();
        this.xmid = this.d.width / 2;
        this.ymid = this.d.height / 2;
        this.rocket_top = parent;
        this.thread = intThread;
        this.launched = false;
        this.message = "";
        this.msgsettime = Date.now();
        this.msgkeeptime = 10 * 1000; // milliseconds
        this.scale = 1.0 / (4.0 * 1.496e13 * this.thread.dscale);
        this.zoom = 1.0;
        this.centerOn = 0; // Track the Sun
        //setFont(new Font("Helvetica", Font.PLAIN, 10));
        //setBackground(Color.black);
        //setForeground(Color.white);
        this.trailstart = this.trailstop = 0;
        this.trailmax = 1000;
        this.trails = [];
        for (i = 0; i < this.thread.nobj; i++) {
            this.trails[i] = [];
            for (let j = 0; j < this.trailmax; j++) {
                this.trails[i][j] = new Array(2);
            }
        }
        this.trailColor = new Array(this.thread.nobj);
        for (i = 0; i < this.thread.nobj; i++)
            this.trailColor[i] = "red";
        this.trailColor[10] = "cyan";
        this.clearTrails();
    }
    getGraphics() {
        return this.ctx;
    }
    ZoomIn(is_in) {
        let amt = 1.5;
        this.scale /= this.zoom;
        if (is_in)
            this.zoom *= 1.5;
        else
            this.zoom /= amt;
        this.scale *= this.zoom;
        this.update(this.getGraphics());
        this.clearTrails();
    }
    setCenter(c) {
        this.centerOn = c;
        this.update(this.getGraphics());
        this.clearTrails();
    }
    clearTrails() {
        this.trailstart = this.trailstop = 0;
    }
    drawCenteredString(g, s, x, y) {
        let t = g.measureText(s);
        g.fillText(s, x - t.width / 2, y + t.fontBoundingBoxAscent / 2);
    }
    drawLine(g, x1, y1, x2, y2) {
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.closePath();
        g.stroke();
    }
    fillOval(g, x, y, w, h) {
        g.beginPath();
        g.arc(x, y, (w + h) / 4.0, 0, Math.PI * 2, true);
        g.closePath();
        g.fill();
    }
    paintScale(g) {
        let l;
        let ll; // int;
        l = 1.0 / (this.scale * this.thread.dscale * 5 * 1.496e13);
        l = Math.pow(10.0, Math.round(Math.log(l) / Math.log(10.0)));
        ll = Math.floor(0.5 * l * this.thread.dscale * this.scale * 1.496e13 * this.d.width);
        g.fillStyle = "white";
        g.strokeStyle = "white";
        this.drawLine(g, this.xmid - ll, this.d.height - 8, this.xmid + ll, this.d.height - 8);
        this.drawCenteredString(g, "" + l + " AU", this.xmid, this.d.height - 17);
    }
    paintSky(g) {
        let i;
        let j;
        let size = 3;
        let x;
        let y;
        let z;
        this.d = this.size();
        this.xmid = this.d.width / 2;
        this.ymid = this.d.height / 2;
        g.fillStyle = "black";
        g.fillRect(0, 0, this.d.width, this.d.height);
        if (this.rocket_top.drawtrails) {
            for (i = 0; i < this.thread.nobj; i++) {
                g.fillStyle = this.trailColor[i];
                if (this.thread.use[i]) {
                    if (this.trailstart <= this.trailstop) {
                        for (j = this.trailstart; j < this.trailstop; j++)
                            this.fillOval(g, this.trails[i][j][0], this.trails[i][j][1], 2, 2);
                    }
                    else {
                        for (j = this.trailstart; j < this.trailmax; j++)
                            this.fillOval(g, this.trails[i][j][0], this.trails[i][j][1], 2, 2);
                        for (j = 0; j < this.trailstop; j++)
                            this.fillOval(g, this.trails[i][j][0], this.trails[i][j][1], 2, 2);
                    }
                }
            }
        }
        g.fillStyle = "white";
        for (i = 0; i < this.thread.nobj; i++) {
            if (this.thread.use[i]) {
                if (this.launched || i != this.thread.nobj - 1 || !this.rocket_top.RocketMode) {
                    x = this.xmid + Math.floor(this.d.width * this.scale * (this.thread.pos[i * 6 + 1] - this.thread.pos[this.centerOn * 6 + 1]));
                    y = this.ymid - Math.floor(this.d.height * this.scale * (this.thread.pos[i * 6 + 2] - this.thread.pos[this.centerOn * 6 + 2]));
                    // z = Math.floor(this.d.height*this.scale*(this.thread.pos[i*6+3]-this.thread.pos[this.centerOn*6+3])*0.2);
                    z = Math.floor(this.d.height * this.scale * this.thread.pos[i * 6 + 3] * 0.2);
                    g.fillStyle = "white";
                    this.fillOval(g, x - size, y - size, size * 2, size * 2);
                    this.drawCenteredString(g, this.thread.names[i], x, y + 7);
                }
                else {
                    x = this.xmid + Math.floor(this.d.width * this.scale * (this.thread.pos[this.thread.homeplanet * 6 + 1] - this.thread.pos[this.centerOn * 6 + 1]));
                    y = this.ymid - Math.floor(this.d.height * this.scale * (this.thread.pos[this.thread.homeplanet * 6 + 2] - this.thread.pos[this.centerOn * 6 + 2]));
                }
                if (this.rocket_top.drawtrails) {
                    this.trails[i][this.trailstop][0] = x - 1;
                    this.trails[i][this.trailstop][1] = y - 1;
                }
            }
        }
        this.trailstop++;
        if (this.trailstop == this.trailmax)
            this.trailstop = 0;
        if (this.trailstop == this.trailstart) {
            this.trailstart++;
            if (this.trailstart == this.trailmax)
                this.trailstart = 0;
        }
        if (this.rocket_top.drawtrails && !this.launched && this.thread.launched) {
            i = this.thread.nobj - 1;
            x = this.xmid + Math.floor(this.d.width * this.scale * (this.thread.pos[i * 6 + 1] - this.thread.pos[this.centerOn * 6 + 1]));
            y = this.ymid - Math.floor(this.d.height * this.scale * (this.thread.pos[i * 6 + 2] - this.thread.pos[this.centerOn * 6 + 2]));
            z = Math.floor(this.d.height * this.scale * this.thread.pos[i * 6 + 3] * 0.2);
            g.fillStyle = "green";
            g.strokeStyle = "green";
            this.drawLine(g, x, y, x, y - 6);
            this.drawCenteredString(g, "launched", x, y - 15);
            this.launched = true;
        }
        this.paintScale(g);
        if (this.message != "") {
            g.fillStyle = "yellow";
            this.drawCenteredString(g, this.message, this.xmid, 10);
            if (this.msgsettime + this.msgkeeptime < Date.now()) {
                this.message = "";
            }
        }
    }
    paint(g) {
        let bbox = this.html_canvas.getBoundingClientRect();
        this.html_canvas.width = bbox.width;
        this.html_canvas.height = bbox.height;
        this.paintSky(g);
        this.rocket_top.setReady();
    }
    update(g) {
        // override this because the default implementation always
        // calls clearRect first, causing unwanted flicker
        this.paint(g);
    }
    // note: this function appears to be unused
    paintCapture(g, n) {
        this.d = this.size();
        this.xmid = this.d.width / 2;
        this.ymid = this.d.height / 2;
        let s = "Rocket has arrived at " + this.thread.names[n];
        let t = g.measureText(s);
        let w = t.width;
        let h = t.fontBoundingBoxAscent;
        g.fillStyle = "black";
        g.fillRect(this.xmid - w / 2 - 15, this.ymid - h / 2 - 15, w + 30, h + 30);
        g.fillStyle = "yellow";
        g.fillText(s, this.xmid - w / 2, this.ymid + h / 2);
    }
    capture(n) {
        let i;
        let x;
        let y;
        let z;
        if (this.rocket_top.drawtrails) {
            i = this.thread.nobj - 1;
            x = this.xmid + Math.floor(this.d.width * this.scale * (this.thread.pos[i * 6 + 1] - this.thread.pos[this.centerOn * 6 + 1]));
            y = this.ymid - Math.floor(this.d.height * this.scale * (this.thread.pos[i * 6 + 2] - this.thread.pos[this.centerOn * 6 + 2]));
            z = Math.floor(this.d.height * this.scale * this.thread.pos[i * 6 + 3] * 0.2);
            this.ctx.fillStyle = "green";
            this.ctx.strokeStyle = "green";
            this.drawLine(this.ctx, x, y, x, y - 6);
            this.drawCenteredString(this.ctx, "arrived", x, y - 15);
            this.launched = false;
        }
    }
}
class RocketThread {
    //	     -0.1108571,  0.6454034,  0.2973650, -0.02005303,  -0.00340512,  -0.00026263,   // Venus, 24409920.5
    //            0.6827481,  0.2361149,  0.0630089, -0.00681826,   0.01715097,   0.00814731,   // Venus 2450320.5
    //	     13.01258,  -13.68721,   -6.17881,    0.002944503,  0.002214815,  0.000928295,  // Uranus, 2451040.5
    constructor(parent) {
        this.a2 = 0.2;
        this.a3 = 0.3;
        this.a4 = 0.6;
        this.a5 = 1.0;
        this.a6 = 0.875;
        this.b21 = 0.2;
        this.b31 = 3.0 / 40.0;
        this.b32 = 9.0 / 40.0;
        this.b41 = 0.3;
        this.b42 = -0.9;
        this.b43 = 1.2;
        this.b51 = -11.0 / 54.0;
        this.b52 = 2.5;
        this.b53 = -70.0 / 27.0;
        this.b54 = 35.0 / 27.0;
        this.b61 = 1631.0 / 55296.0;
        this.b62 = 175.0 / 512.0;
        this.b63 = 575.0 / 13824.0;
        this.b64 = 44275.0 / 110592.0;
        this.b65 = 253.0 / 4096.0;
        this.c1 = 37.0 / 378.0;
        this.c3 = 250.0 / 621.0;
        this.c4 = 125.0 / 594.0;
        this.c6 = 512.0 / 1771.0;
        this.dc5 = -277.0 / 14336.0;
        this.dc1 = this.c1 - 2825.0 / 27648.0;
        this.dc3 = this.c3 - 18575.0 / 48384.0;
        this.dc4 = this.c4 - 13525.0 / 55296.0;
        this.dc6 = this.c6 - 0.25;
        this.safe1 = 0.25;
        this.safe2 = 0.7;
        this.redmax = 1.0e-5;
        this.redmin = 0.7;
        this.tiny = 1.0e-30;
        this.scalmx = 0.1;
        this.first = true;
        this.kmax = 0; // int
        this.kopt = 0; // int
        this.epsold = -1.0;
        this.xnew = 0.0;
        this.nseq = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 0];
        this.names = ["Sun", "Mercury", "Venus", "Earth", "Mars",
            "Jupiter", "Saturn", "Uranus", "Neptune",
            "Pluto", "Rocket"];
        this.captureradius = 0.0;
        this.lastDist = 0.0;
        this.baseDist = 0.0;
        this.launched = false;
        this.launched2 = false;
        this.homeplanet = 3; // int
        this.destplanet = -1; // int
        this.realdestplanet = -1; // int
        this.launch2 = 0.0;
        this.start = [2450120.5, // JD
            //   X           Y            Z         dX/dt          dY/dt        dZ/dt
            //  (au)        (au)         (au)      (au/day)       (au/day)     (au/day)
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // Sun
            -0.3857365, -0.1639517, -0.0475646, 0.00549764, -0.02151416, -0.01206210, // Mercury
            0.3712951, 0.5729661, 0.2342605, -0.01740866, 0.00900940, 0.00515493, // Venus
            -0.7275681, 0.6107332, 0.2647897, -0.01189440, -0.01170492, -0.00507485, // Earth
            1.1654028, -0.6640779, -0.3361055, 0.00805691, 0.01189269, 0.00523687, // Mars
            0.056618, -4.830622, -2.072002, 0.007452809, 0.000464097, 0.000017346, // Jupiter
            9.538874, -0.433794, -0.589470, 0.000072742, 0.005138641, 0.002119286, // Saturn
            10.10557, -15.49204, -6.92805, 0.003357478, 0.001695406, 0.000694931, // Uranus
            12.95617, -25.09561, -10.59449, 0.002821829, 0.001292370, 0.000458749, // Neptune
            -14.07658, -26.07059, -3.89443, 0.002854335, -0.001553801, -0.001342638, // Pluto
            -0.7275681, 0.6107332, 0.2647897, -0.01189440, -0.01170492, -0.00507485]; // Rocket
        let tweak;
        this.rocket_top = parent;
        if (this.rocket_top.RocketMode) {
            // Tweak Venus: use coords for JD 2450320.5
            this.start[2 * 6 + 1] = 0.6827481;
            this.start[2 * 6 + 2] = 0.2361149;
            this.start[2 * 6 + 3] = 0.0630089;
            this.start[2 * 6 + 4] = -0.00681826;
            this.start[2 * 6 + 5] = 0.01715097;
            this.start[2 * 6 + 6] = 0.00814731;
        }
        if (this.rocket_top.AsteroidMode) {
            this.names[10] = "Asteroid";
        }
        this.vfuel = 2.5; // km/s -- exhaust velocity of fuel
        this.dscale = 1.0e-5;
        this.tscale = 1.0 / 86400.0;
        this.mscale = 1.0e-3;
        // this.tstep = 7.0*86400.0*this.tscale;  // 1 week
        // this.tstep = 84600.0*this.tscale;      // 1 day
        // this.tstep = 8.0*86400.0*this.tscale;  // 8 days (better than seven since it is a power of 2)
        // this.tstep = 4.0*86400.0*this.tscale;  // 4 days (changed 10/16/98 since we got a faster applet runner)
        this.tstep = 1.0 * 86400.0 * this.tscale; // 1 day (changed 8/17/25 for 60Hz refresh rate)
        this.launched = false;
        this.running = false;
        this.resetQueued = false;
        this.timeTweak = 1.0;
        this.defaultDist = 5.0e7 * 1.0e5 * this.dscale;
        if (this.rocket_top.RocketMode)
            this.captureradius = 3000000; // 3 million km
        if (this.rocket_top.AsteroidMode)
            this.captureradius = 400000; // 400,000 km
        this.nobj = 11;
        this.nall = 6 * this.nobj + 1;
        this.n = this.nall;
        this.pos = new Array(this.nall);
        this.opos = new Array(this.nall);
        this.use = new Array(this.nobj);
        this.gmass = new Array(this.nobj);
        for (i = 0; i < this.nobj; i++)
            this.use[i] = true;
        this.G = 6.67259e-8 * this.dscale * this.dscale * this.dscale / (this.mscale * this.tscale * this.tscale);
        this.gmass[0] = this.G * 1.990e33 * this.mscale; // Sun       (mass in grams*this.mscale)
        this.gmass[1] = this.G * 3.303e26 * this.mscale; // Mercury
        this.gmass[2] = this.G * 4.870e27 * this.mscale; // Venus
        this.gmass[3] = this.G * 5.976e27 * this.mscale; // Earth-Moon 
        this.gmass[4] = this.G * 6.418e26 * this.mscale; // Mars
        this.gmass[5] = this.G * 1.899e30 * this.mscale; // Jupiter
        this.gmass[6] = this.G * 5.686e29 * this.mscale; // Saturn
        this.gmass[7] = this.G * 8.660e28 * this.mscale; // Uranus
        this.gmass[8] = this.G * 1.030e29 * this.mscale; // Neptune
        this.gmass[9] = this.G * 1.000e25 * this.mscale; // Pluto
        this.gmass[10] = 0.0; // Test mass (Asteroid, Rocket, etc.)
        this.fixCoords();
        // Static, internal arrays for the RK integrator functions
        this.yscal = new Array(this.nall);
        this.y = new Array(this.nall);
        this.dydx = new Array(this.nall);
        this.yerr = new Array(this.nall);
        this.ytemp = new Array(this.nall);
        this.ysav = new Array(this.nall);
        this.yseq = new Array(this.nall);
        this.ym = new Array(this.nall);
        this.yn = new Array(this.nall);
        this.ak2 = new Array(this.nall);
        this.ak3 = new Array(this.nall);
        this.ak4 = new Array(this.nall);
        this.ak5 = new Array(this.nall);
        this.ak6 = new Array(this.nall);
        this.aytemp = new Array(this.nall);
        this.hv = new Array(3);
        this.kmaxx = 8;
        this.imaxx = this.kmaxx + 1;
        this.cv = new Array(this.nall);
        this.dv = [];
        for (var i = 0; i < this.nall; i++) {
            this.dv[i] = Array(this.kmaxx + 1);
        }
        this.xv = new Array(this.kmaxx + 1);
        this.err = new Array(this.kmaxx + 1);
        this.av = new Array(this.imaxx + 2);
        this.alf = [];
        for (var i = 0; i < this.kmaxx + 2; i++) {
            this.alf[i] = Array(this.kmaxx + 2);
        }
        this.astDist = 0.0;
        this.astTanVel = 0.0;
        this.astRadVel = 0.0;
        this.astAng = 0.0;
        this.astVel = 0.0;
        this.astDay = 0.0;
        this.astAng2 = 0.0;
        this.astVel2 = 0.0;
        this.astDay2 = 0.0;
        this.capture = 3;
        this.realdestplanet = 4;
        this.reset();
    }
    fixCoords() {
        let m;
        let x;
        let y;
        let r;
        let r2;
        let t;
        let theta;
        let i;
        let j;
        // Rotate the "start" vector so we are looking at the Earth-Sun
        // plane with no inclination
        m = [];
        for (i = 0; i < 3; i++) {
            m[i] = new Array(4);
        }
        // First, figure out where the Earth plane is pointing.
        x = this.start[3 * 6 + 1];
        y = this.start[3 * 6 + 2];
        r2 = Math.sqrt(x * x + y * y);
        r = Math.sqrt(r2 * r2 + this.start[3 * 6 + 3] * this.start[3 * 6 + 3]);
        // anti-z rotation
        m[0][0] = x / r2;
        m[0][1] = -y / r2;
        m[0][2] = 0.0;
        m[1][0] = y / r2;
        m[1][1] = x / r2;
        m[1][2] = 0.0;
        m[2][0] = 0.0;
        m[2][1] = 0.0;
        m[2][2] = 1.0;
        for (i = 0; i < this.nobj; i++)
            for (j = 0; j <= 1; j++) {
                m[0][3] = this.start[i * 6 + j * 3 + 1] * m[0][0] + this.start[i * 6 + j * 3 + 2] * m[1][0] + this.start[i * 6 + j * 3 + 3] * m[2][0];
                m[1][3] = this.start[i * 6 + j * 3 + 1] * m[0][1] + this.start[i * 6 + j * 3 + 2] * m[1][1] + this.start[i * 6 + j * 3 + 3] * m[2][1];
                m[2][3] = this.start[i * 6 + j * 3 + 1] * m[0][2] + this.start[i * 6 + j * 3 + 2] * m[1][2] + this.start[i * 6 + j * 3 + 3] * m[2][2];
                this.start[i * 6 + j * 3 + 1] = m[0][3];
                this.start[i * 6 + j * 3 + 2] = m[1][3];
                this.start[i * 6 + j * 3 + 3] = m[2][3];
            }
        // y rotation
        t = Math.sqrt(this.start[3 * 6 + 1] * this.start[3 * 6 + 1] + this.start[3 * 6 + 3] * this.start[3 * 6 + 3]);
        m[0][0] = this.start[3 * 6 + 1] / t;
        m[0][1] = 0.0;
        m[0][2] = -this.start[3 * 6 + 3] / t;
        m[1][0] = 0.0;
        m[1][1] = 1.0;
        m[1][2] = 0.0;
        m[2][0] = this.start[3 * 6 + 3] / t;
        m[2][1] = 0.0;
        m[2][2] = this.start[3 * 6 + 1] / t;
        for (i = 0; i < this.nobj; i++)
            for (j = 0; j <= 1; j++) {
                m[0][3] = this.start[i * 6 + j * 3 + 1] * m[0][0] + this.start[i * 6 + j * 3 + 2] * m[1][0] + this.start[i * 6 + j * 3 + 3] * m[2][0];
                m[1][3] = this.start[i * 6 + j * 3 + 1] * m[0][1] + this.start[i * 6 + j * 3 + 2] * m[1][1] + this.start[i * 6 + j * 3 + 3] * m[2][1];
                m[2][3] = this.start[i * 6 + j * 3 + 1] * m[0][2] + this.start[i * 6 + j * 3 + 2] * m[1][2] + this.start[i * 6 + j * 3 + 3] * m[2][2];
                this.start[i * 6 + j * 3 + 1] = m[0][3];
                this.start[i * 6 + j * 3 + 2] = m[1][3];
                this.start[i * 6 + j * 3 + 3] = m[2][3];
            }
        // anti-x rotation, based on the velocity vector
        t = Math.sqrt(this.start[3 * 6 + 5] * this.start[3 * 6 + 5] + this.start[3 * 6 + 6] * this.start[3 * 6 + 6]);
        m[0][0] = 1.0;
        m[0][1] = 0.0;
        m[0][2] = 0.0;
        m[1][0] = 0.0;
        m[1][1] = this.start[3 * 6 + 5] / t;
        m[1][2] = -this.start[3 * 6 + 6] / t;
        m[2][0] = 0.0;
        m[2][1] = this.start[3 * 6 + 6] / t;
        m[2][2] = this.start[3 * 6 + 5] / t;
        for (i = 0; i < this.nobj; i++)
            for (j = 0; j <= 1; j++) {
                m[0][3] = this.start[i * 6 + j * 3 + 1] * m[0][0] + this.start[i * 6 + j * 3 + 2] * m[1][0] + this.start[i * 6 + j * 3 + 3] * m[2][0];
                m[1][3] = this.start[i * 6 + j * 3 + 1] * m[0][1] + this.start[i * 6 + j * 3 + 2] * m[1][1] + this.start[i * 6 + j * 3 + 3] * m[2][1];
                m[2][3] = this.start[i * 6 + j * 3 + 1] * m[0][2] + this.start[i * 6 + j * 3 + 2] * m[1][2] + this.start[i * 6 + j * 3 + 3] * m[2][2];
                this.start[i * 6 + j * 3 + 1] = m[0][3];
                this.start[i * 6 + j * 3 + 2] = m[1][3];
                this.start[i * 6 + j * 3 + 3] = m[2][3];
            }
        // Undo the z-rotation I applied before
        /*  No, don't do this.  Leave the Earth at (R,0,0)
        m[0][0] = x/r2;
        m[0][1] = y/r2;
        m[0][2] = 0.0;
        m[1][0] = -y/r2;
        m[1][1] = x/r2;
        m[1][2] = 0.0;
        m[2][0] = 0.0;
        m[2][1] = 0.0;
        m[2][2] = 1.0;
    
        for (i=0; i<this.nobj; i++)
          for (j=0; j<=1; j++) {
        m[0][3] = this.start[i*6+j*3+1]*m[0][0] + this.start[i*6+j*3+2]*m[1][0] + this.start[i*6+j*3+3]*m[2][0];
        m[1][3] = this.start[i*6+j*3+1]*m[0][1] + this.start[i*6+j*3+2]*m[1][1] + this.start[i*6+j*3+3]*m[2][1];
        m[2][3] = this.start[i*6+j*3+1]*m[0][2] + this.start[i*6+j*3+2]*m[1][2] + this.start[i*6+j*3+3]*m[2][2];
        this.start[i*6+j*3+1] = m[0][3];
        this.start[i*6+j*3+2] = m[1][3];
        this.start[i*6+j*3+3] = m[2][3];
          }
        */
        /*
        if (this.rocket_top.RocketMode) {
          // Rotate Uranus' "start" vector so it is pretty well lined up for
          // an encounter after a Jupiter slingshot.
          // Find the right theta by trial-and-error
          
          theta = 90.0 * Math.PI/180.0;
          
          // Apply a Z-rotation
          m[0][0] = Math.cos(theta);
          m[0][1] = Math.sin(theta);
          m[0][2] = 0.0;
          m[1][0] = -Math.sin(theta);
          m[1][1] = Math.cos(theta);
          m[1][2] = 0.0;
          m[2][0] = 0.0;
          m[2][1] = 0.0;
          m[2][2] = 1.0;
          
          i=7;
          for (j=0; j<=1; j++) {
        m[0][3] = this.start[i*6+j*3+1]*m[0][0] + this.start[i*6+j*3+2]*m[1][0] + this.start[i*6+j*3+3]*m[2][0];
        m[1][3] = this.start[i*6+j*3+1]*m[0][1] + this.start[i*6+j*3+2]*m[1][1] + this.start[i*6+j*3+3]*m[2][1];
        m[2][3] = this.start[i*6+j*3+1]*m[0][2] + this.start[i*6+j*3+2]*m[1][2] + this.start[i*6+j*3+3]*m[2][2];
        this.start[i*6+j*3+1] = m[0][3];
        this.start[i*6+j*3+2] = m[1][3];
        this.start[i*6+j*3+3] = m[2][3];
          }
        }
        */
        if (this.rocket_top.RocketMode) {
            // Rotate Neptune's "this.start" vector so it is pretty well lined up for
            // an encounter after a Jupiter slingshot.
            // Find the right theta by trial-and-error
            theta = 90.0 * Math.PI / 180.0;
            // Apply a Z-rotation
            m[0][0] = Math.cos(theta);
            m[0][1] = Math.sin(theta);
            m[0][2] = 0.0;
            m[1][0] = -Math.sin(theta);
            m[1][1] = Math.cos(theta);
            m[1][2] = 0.0;
            m[2][0] = 0.0;
            m[2][1] = 0.0;
            m[2][2] = 1.0;
            i = 8;
            for (j = 0; j <= 1; j++) {
                m[0][3] = this.start[i * 6 + j * 3 + 1] * m[0][0] + this.start[i * 6 + j * 3 + 2] * m[1][0] + this.start[i * 6 + j * 3 + 3] * m[2][0];
                m[1][3] = this.start[i * 6 + j * 3 + 1] * m[0][1] + this.start[i * 6 + j * 3 + 2] * m[1][1] + this.start[i * 6 + j * 3 + 3] * m[2][1];
                m[2][3] = this.start[i * 6 + j * 3 + 1] * m[0][2] + this.start[i * 6 + j * 3 + 2] * m[1][2] + this.start[i * 6 + j * 3 + 3] * m[2][2];
                this.start[i * 6 + j * 3 + 1] = m[0][3];
                this.start[i * 6 + j * 3 + 2] = m[1][3];
                this.start[i * 6 + j * 3 + 3] = m[2][3];
            }
        }
        if (this.rocket_top.AsteroidMode) {
            let tweak;
            // Tweak the distance to put it out at the Asteroid Belt
            //    tweak = 1.15;
            tweak = 2.5;
            this.start[10 * 6 + 1] *= tweak;
            this.start[10 * 6 + 2] *= tweak;
            this.start[10 * 6 + 3] *= tweak;
            // Tweak the velocity to make it a (roughly) circular orbit at
            // its new distance
            this.start[10 * 6 + 4] *= 1.0 / Math.sqrt(tweak);
            this.start[10 * 6 + 5] *= 1.0 / Math.sqrt(tweak);
            this.start[10 * 6 + 6] *= 1.0 / Math.sqrt(tweak);
        }
    }
    adjustTimeStepUp(up) {
        let amt = 2.0;
        if (up)
            this.timeTweak *= amt;
        else
            this.timeTweak *= 1.0 / amt;
    }
    reset() {
        let i;
        // Convert JD to sec
        this.pos[0] = (this.start[0] - 2450000.0) * 86400.0 * this.tscale;
        // Renormalize the time scale
        this.pos[0] = 0.0 * 86400.0 * this.tscale;
        for (i = 0; i < this.nobj; i++) {
            // Convert AU and AU/day to cm and cm/s
            this.pos[i * 6 + 1] = this.start[i * 6 + 1] * 1.496e13 * this.dscale;
            this.pos[i * 6 + 2] = this.start[i * 6 + 2] * 1.496e13 * this.dscale;
            this.pos[i * 6 + 3] = this.start[i * 6 + 3] * 1.496e13 * this.dscale;
            if (this.use[i]) {
                this.pos[i * 6 + 4] = this.start[i * 6 + 4] * 1.496e13 * this.dscale / (86400.0 * this.tscale);
                this.pos[i * 6 + 5] = this.start[i * 6 + 5] * 1.496e13 * this.dscale / (86400.0 * this.tscale);
                this.pos[i * 6 + 6] = this.start[i * 6 + 6] * 1.496e13 * this.dscale / (86400.0 * this.tscale);
            }
            else {
                this.pos[i * 6 + 4] = this.pos[i * 6 + 5] = this.pos[i * 6 + 6] = 0.0;
            }
        }
        this.launched = false;
        if (this.rocket_top.threadstarted) {
            this.rocket_top.canvas.launched = false;
            this.rocket_top.canvas.message = "";
            this.rocket_top.canvas.msgsettime = Date.now();
        }
        this.homeplanet = 3;
        this.destplanet = this.realdestplanet;
        this.launch2 = 0.0;
        this.lastDist = this.baseDist = this.defaultDist;
        if (this.rocket_top.canvas)
            this.rocket_top.canvas.clearTrails();
    }
    doAsteroid(dist, ang, tanvel, radvel) {
        let i;
        let a;
        this.astDist = dist;
        this.astAng = ang;
        this.astTanVel = tanvel;
        this.astRadVel = radvel;
        // Start from Earth
        for (i = 1; i <= 6; i++)
            this.start[(this.nobj - 1) * 6 + i] = this.start[3 * 6 + i];
        // Distance in AU
        a = Math.atan2(this.start[(this.nobj - 1) * 6 + 2], this.start[(this.nobj - 1) * 6 + 1]);
        this.start[(this.nobj - 1) * 6 + 1] += this.astDist * Math.cos(a - (this.astAng + 180.0) * Math.PI / 180.0);
        this.start[(this.nobj - 1) * 6 + 2] += this.astDist * Math.sin(a - (this.astAng + 180.0) * Math.PI / 180.0);
        // Convert velocity from km/s to AU/day
        this.start[(this.nobj - 1) * 6 + 4] = this.astTanVel * (86400.0 / 1.496e8) * Math.cos(a - (this.astAng + 90.0) * Math.PI / 180.0);
        this.start[(this.nobj - 1) * 6 + 5] = this.astTanVel * (86400.0 / 1.496e8) * Math.sin(a - (this.astAng + 90.0) * Math.PI / 180.0);
        this.start[(this.nobj - 1) * 6 + 4] += this.astRadVel * (86400.0 / 1.496e8) * Math.cos(a - (this.astAng + 180.0) * Math.PI / 180.0);
        this.start[(this.nobj - 1) * 6 + 5] += this.astRadVel * (86400.0 / 1.496e8) * Math.sin(a - (this.astAng + 180.0) * Math.PI / 180.0);
        this.queueReset();
        this.rocket_top.astinput = true;
    }
    doRocket(n, ang, vel, day) {
        if (n == 1) {
            this.astAng = ang;
            this.astVel = vel;
            this.astDay = day;
        }
        else {
            this.astAng2 = ang;
            this.astVel2 = vel;
            this.astDay2 = day;
        }
        this.queueReset();
        this.rocket_top.astinput = true;
    }
    checkLaunch() {
        let a;
        let ang;
        let vel;
        let day;
        let fuel;
        let order;
        let sign;
        if (this.homeplanet == 3) {
            ang = this.astAng;
            vel = this.astVel;
            day = this.astDay;
        }
        else {
            ang = this.astAng2;
            vel = this.astVel2;
            day = this.astDay2 + this.launch2;
        }
        if (!this.launched && this.pos[0] >= day * 86400.0 * this.tscale) {
            if (this.launch2 > 0.0 && this.homeplanet == 3) {
                // Already returned to Earth; Don't launch again
            }
            else {
                // Don't launch if the velocity is zero!
                // This is a clue that the user has not yet entered any
                // parameters on the Options screen.
                if (vel != 0.0) {
                    console.log("launch!");
                    // Angle of Rocket from Sun
                    a = Math.atan2(this.pos[(this.nobj - 1) * 6 + 2], this.pos[(this.nobj - 1) * 6 + 1]);
                    // Convert velocity from km/s to "pos" units (cm/s * scale)
                    this.pos[(this.nobj - 1) * 6 + 4] += vel * 1.0e5 * this.dscale / this.tscale *
                        Math.cos(a - (ang + 180.0) * Math.PI / 180.0);
                    this.pos[(this.nobj - 1) * 6 + 5] += vel * 1.0e5 * this.dscale / this.tscale *
                        Math.sin(a - (ang + 180.0) * Math.PI / 180.0);
                    this.launched = true;
                    fuel = Math.exp(vel / this.vfuel) - 1.0;
                    if (fuel > 0.0) {
                        order = Math.pow(10.0, Math.floor(Math.log(fuel) / Math.log(10.0) - 2));
                        /*
                        sign = 1.0;
                        order = Math.floor(Math.log(fuel)/Math.log(10.0)-2);
                        if (order < 0.0) {
                          order = -order;
                          sign = -1.0;
                        }
                        order = Math.round(Math.pow(10.0, order));
                        if (sign < 0.0)
                          order = 1.0/order;
                        console.log("Order: "+order);
                        */
                        fuel = order * (Math.round(fuel / order));
                    }
                    this.rocket_top.canvas.message = "Fuel used: " + fuel;
                    if (this.rocket_top.canvas.message.endsWith("0001")) {
                        this.rocket_top.canvas.message = this.rocket_top.canvas.message.substring(0, this.rocket_top.canvas.message.length - 4);
                        while (this.rocket_top.canvas.message.endsWith("0"))
                            this.rocket_top.canvas.message = this.rocket_top.canvas.message.substring(0, this.rocket_top.canvas.message.length - 1);
                    }
                    this.rocket_top.canvas.message += " metric tons";
                    this.rocket_top.canvas.msgsettime = Date.now();
                    this.refresh();
                }
            }
        }
    }
    /*
       This function checks if the rocket/asteroid is near any planets.
       If it is close enough, it lands on or collides with the planet.
       The math is a little hairy since I want to make sure that the
       coarseness of the animation timestep doesn't affect weather a
       collision happens or not; thus I interpolate between timesteps to
       check for collisions.
    */
    checkRocket() {
        let i;
        let j;
        let k;
        let mini; // int
        let radius;
        let dx;
        let dy;
        let dz;
        let min;
        let min2;
        let mint;
        let r2;
        let t;
        let dx1;
        let dx2;
        let dy1;
        let dy2;
        let denom;
        let xa;
        let xb;
        let ya;
        let yb;
        min = min2 = mint = 1.0e20;
        mini = 0;
        j = (this.nobj - 1) * 6;
        for (i = 0; i < this.nobj - 1; i++)
            /* Only collide with planets that are turned on (use[i])!  Also,
           don't land on the homeplanet if we are using the rocket
           instead of the asteroid. */
            if ((!this.rocket_top.RocketMode || i != this.homeplanet) && this.use[i]) {
                k = i * 6;
                dx = this.pos[j + 1] - this.pos[k + 1];
                dy = this.pos[j + 2] - this.pos[k + 2];
                dz = this.pos[j + 3] - this.pos[k + 3];
                // Capture is only in 2D!!
                radius = Math.sqrt(dx * dx + dy * dy);
                // Interpolate between time points to find where the closest
                // approach was
                dx1 = this.pos[j + 1] - this.opos[j + 1];
                dx2 = this.pos[k + 1] - this.opos[k + 1];
                dy1 = this.pos[j + 2] - this.opos[j + 2];
                dy2 = this.pos[k + 2] - this.opos[k + 2];
                denom = (dx1 - dx2) * (dx1 - dx2) + (dy1 - dy2) * (dy1 - dy2);
                if (denom == 0.0)
                    t = 0.0;
                else
                    t = (this.opos[j + 1] * (dx2 - dx1) + this.opos[k + 1] * (dx1 - dx2) +
                        this.opos[j + 2] * (dy2 - dy1) + this.opos[k + 2] * (dy1 - dy2)) / denom;
                t = (t < 0.0 ? 0.0 : (t > 1.0 ? 1.0 : t));
                xa = this.opos[j + 1] + dx1 * t;
                xb = this.opos[k + 1] + dx2 * t;
                ya = this.opos[j + 2] + dy1 * t;
                yb = this.opos[k + 2] + dy2 * t;
                dx = xa - xb;
                dy = ya - yb;
                r2 = Math.sqrt(dx * dx + dy * dy);
                if (r2 < min) {
                    min = radius;
                    min2 = r2;
                    mint = t;
                    mini = i;
                }
                // Use a larger capture radius for the Sun
                if ((r2 < this.captureradius * 1.0e5 * this.dscale ||
                    (i == 0 && r2 < 5.0 * this.captureradius * 1.0e5 * this.dscale))
                    && this.rocket_top.usecapture)
                    break;
                if (this.rocket_top.RocketMode && i == this.destplanet) {
                    if (t == 1.0)
                        this.lastDist = radius;
                    else if (r2 < this.baseDist) {
                        // The rocket has just started moving away from the
                        // destination planet
                        let s;
                        let a1;
                        let a2;
                        let a;
                        this.baseDist = this.lastDist = r2;
                        // Calculate angle between planet and rocket in terms of
                        // motion of the planet
                        a1 = Math.atan2(dy, dx);
                        a2 = Math.atan2(yb, xb);
                        a = (((a1 - a2) * 180.0 / Math.PI) % 360.0 + 360.0) % 360.0;
                        //	    console.log("T: "+t);
                        //	    console.log(""+a1*180.0/Math.PI+" "+a2*180.0/Math.PI+" "+a+" ("+dx/(1.0e5*this.dscale)+","+dy/(1.0e5*this.dscale)+")");
                        if (r2 > 1.0e6)
                            s = "Missed by " + Math.round(r2 / (1.0e8 * this.dscale)) * 1.0e-3 + " million km. ";
                        else
                            s = "Missed by " + Math.round(r2 / (1.0e5 * this.dscale)) + " km. ";
                        if (a < 0.0 || a > 360.0)
                            s = "Error! " + a;
                        else if (a < 45.0 || a >= 315.0)
                            s += "The rocket went outside the orbit of " + this.names[i];
                        else if (a < 135.0)
                            s += "The rocket passed ahead of " + this.names[i];
                        else if (a < 215.0)
                            s += "The rocket went inside the orbit of " + this.names[i];
                        else
                            s += "The rocket passed behind " + this.names[i];
                        this.rocket_top.canvas.message = s;
                        this.rocket_top.canvas.msgsettime = Date.now();
                    }
                }
            }
        /*
        if (min < 1.0e20) {
          console.log(this.names[mini]+": "+min/(1.496e13*this.dscale)+" AU,  "+min/(1.0e5*this.dscale)+" km ("+(this.pos[j+1]-this.pos[mini*6+1])/(1.0e5*this.dscale)+","+(this.pos[j+2]-this.pos[mini*6+2])/(1.0e5*this.dscale)+","+(this.pos[j+3]-this.pos[mini*6+3])/(1.0e5*this.dscale)+")");
          console.log("    R2: "+min2/(1.0e5*this.dscale)+" km, T: "+mint);
        } */
        if (i < this.nobj - 1) { // i.e. we did a "break" before and we are captured
            if (this.rocket_top.RocketMode) {
                let traveltime;
                if (i == 3) {
                    traveltime = this.pos[0] / (86400.0 * this.tscale) - this.launch2 - this.astDay2;
                    if (traveltime < 500.0)
                        this.rocket_top.canvas.message = "Welcome back to Earth! Trip time: " +
                            traveltime + " days";
                    else
                        this.rocket_top.canvas.message = "Welcome back to Earth! Trip time: " +
                            traveltime / 365.25 + " years";
                }
                else {
                    traveltime = this.pos[0] / (86400.0 * this.tscale) - this.astDay;
                    if (traveltime < 500.0)
                        this.rocket_top.canvas.message = "Welcome to " + this.names[i] + "! Trip time: " +
                            traveltime + " days";
                    else {
                        traveltime = 0.01 * Math.round(100.0 * traveltime / 365.25);
                        this.rocket_top.canvas.message = "Welcome to " + this.names[i] + "! Trip time: " +
                            traveltime + " years";
                    }
                }
                this.rocket_top.canvas.msgsettime = Date.now();
                this.capture = i;
                this.launched = false;
                this.rocket_top.canvas.launched = false;
                for (k = 1; k <= 6; k++)
                    this.pos[j + k] = this.pos[i * 6 + k];
                this.launch2 = this.pos[0] / (86400.0 * this.tscale);
                this.refreshcanvas();
                this.homeplanet = i;
                this.destplanet = 3; // Heading back to Earth
                this.lastDist = this.baseDist = this.defaultDist;
            }
            else {
                this.rocket_top.canvas.message = "Asteroid collided with " + this.names[i] + "!";
                this.rocket_top.canvas.msgsettime = Date.now();
                this.use[10] = false; // Remove the asteroid from the simulation
            }
        }
    }
    force(t, r, dr) {
        let i;
        let j;
        let k;
        let l;
        let radius;
        let accel;
        let dx;
        let dy;
        let dz;
        for (k = 0; k < this.nobj; k++) {
            i = 6 * k;
            if (!this.use[k]) {
                dr[i + 1] = dr[i + 2] = dr[i + 3] = dr[i + 4] = dr[i + 5] = dr[i + 6] = 0.0;
            }
            else {
                dr[i + 4] = dr[i + 5] = dr[i + 6] = 0.0;
                dr[i + 1] = r[i + 4];
                dr[i + 2] = r[i + 5];
                if (this.rocket_top.use2D)
                    dr[i + 3] = 0.0;
                else
                    dr[i + 3] = r[i + 6];
                // only go to this.nobj-2 so we don't try to compute the
                // (nonexistent) gravity due to the Rocket
                for (l = 0; l < this.nobj - 1; l++) {
                    if (l != k && this.use[l]) {
                        // Skip gravity of the Earth (or whichever planet the
                        // Rocket just launched from) on the Rocket
                        if (l == this.homeplanet && k == this.nobj - 1)
                            continue;
                        j = 6 * l;
                        dx = r[j + 1] - r[i + 1];
                        dy = r[j + 2] - r[i + 2];
                        dz = r[j + 3] - r[i + 3];
                        if (this.rocket_top.use2D)
                            radius = Math.sqrt(dx * dx + dy * dy);
                        else
                            radius = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        accel = this.gmass[l] / (radius * radius * radius);
                        dr[i + 4] += accel * dx;
                        dr[i + 5] += accel * dy;
                        if (!this.rocket_top.use2D)
                            dr[i + 6] += accel * dz;
                    }
                }
            }
        }
    }
    rk(x, h) {
        let i;
        for (i = 1; i < this.n; i++)
            this.aytemp[i] = this.y[i] + this.b21 * h * this.dydx[i];
        this.force(x + this.a2 * h, this.aytemp, this.ak2);
        for (i = 1; i < this.n; i++)
            this.aytemp[i] = this.y[i] + h * (this.b31 * this.dydx[i] + this.b32 * this.ak2[i]);
        this.force(x + this.a3 * h, this.aytemp, this.ak3);
        for (i = 1; i < this.n; i++)
            this.aytemp[i] = this.y[i] + h * (this.b41 * this.dydx[i] + this.b42 * this.ak2[i] + this.b43 * this.ak3[i]);
        this.force(x + this.a4 * h, this.aytemp, this.ak4);
        for (i = 1; i < this.n; i++)
            this.aytemp[i] = this.y[i] + h * (this.b51 * this.dydx[i] + this.b52 * this.ak2[i] + this.b53 * this.ak3[i] + this.b54 * this.ak4[i]);
        this.force(x + this.a5 * h, this.aytemp, this.ak5);
        for (i = 1; i < this.n; i++)
            this.aytemp[i] = this.y[i] + h * (this.b61 * this.dydx[i] + this.b62 * this.ak2[i] + this.b63 * this.ak3[i] + this.b64 * this.ak4[i] + this.b65 * this.ak5[i]);
        this.force(x + this.a6 * h, this.aytemp, this.ak6);
        for (i = 1; i < this.n; i++)
            this.ytemp[i] = this.y[i] + h * (this.c1 * this.dydx[i] + this.c3 * this.ak3[i] + this.c4 * this.ak4[i] + this.c6 * this.ak6[i]);
        for (i = 1; i < this.n; i++)
            this.yerr[i] = h * (this.dc1 * this.dydx[i] + this.dc3 * this.ak3[i] + this.dc4 * this.ak4[i] + this.dc5 * this.ak5[i] + this.dc6 * this.ak6[i]);
    }
    rkqs(hv, htry, eps) {
        let i;
        let errmax;
        let h;
        let maxarg;
        h = htry;
        for (;;) {
            this.rk(hv[0], h);
            errmax = 0.0;
            for (i = 1; i < this.n; i++) {
                maxarg = Math.abs(this.yerr[i] / this.yscal[i]);
                errmax = (errmax > maxarg ? errmax : maxarg);
            }
            errmax /= eps;
            if (errmax > 1.0) {
                h = 0.9 * h * Math.pow(errmax, -0.25);
                if (h < 0.1 * h)
                    h *= 0.1;
                this.xnew = hv[0] + h;
                if (this.xnew == hv[0])
                    console.log("stepsize underflow in rkqs");
                continue;
            }
            else {
                if (errmax > 1.89e-4)
                    hv[2] = 0.9 * h * Math.pow(errmax, -0.2);
                else
                    hv[2] = 5.0 * h;
                hv[0] += (hv[1] = h);
                for (i = 1; i < this.n; i++)
                    this.y[i] = this.ytemp[i];
                break;
            }
        }
    }
    mmid(hv, htot, nstep) {
        let nx; // int
        let i;
        let x;
        let swap;
        let h2;
        let h;
        h = htot / nstep;
        for (i = 1; i < this.n; i++) {
            this.ym[i] = this.y[i];
            this.yn[i] = this.y[i] + h * this.dydx[i];
        }
        //    console.log(h+" "+htot+" "+nstep);
        x = hv[0] + h;
        this.force(x, this.yn, this.yseq);
        //    for (i=1;i<this.n;i++)
        //      console.log(this.y[i]+" "+this.yseq[i]+" "+this.yn[i]+" "+this.ym[i]);
        h2 = 2.0 * h;
        for (nx = 2; nx <= nstep; nx++) {
            for (i = 1; i < this.n; i++) {
                swap = this.ym[i] + h2 * this.yseq[i];
                this.ym[i] = this.yn[i];
                this.yn[i] = swap;
            }
            x += h;
            this.force(x, this.yn, this.yseq);
        }
        for (i = 1; i < this.n; i++)
            this.yseq[i] = 0.5 * (this.ym[i] + this.yn[i] + h * this.yseq[i]);
    }
    pzextr(iest, xest) {
        let k1; // int
        let j; // int
        let q;
        let f2;
        let f1;
        let delta;
        this.xv[iest] = xest;
        for (j = 1; j < this.n; j++)
            this.yerr[j] = this.y[j] = this.yseq[j];
        if (iest == 1) {
            for (j = 1; j < this.n; j++)
                this.dv[j][1] = this.yseq[j];
        }
        else {
            for (j = 1; j < this.n; j++)
                this.cv[j] = this.yseq[j];
            for (k1 = 1; k1 < iest; k1++) {
                delta = 1.0 / (this.xv[iest - k1] - xest);
                f1 = xest * delta;
                f2 = this.xv[iest - k1] * delta;
                for (j = 1; j < this.n; j++) {
                    q = this.dv[j][k1];
                    this.dv[j][k1] = this.yerr[j];
                    delta = this.cv[j] - q;
                    this.yerr[j] = f1 * delta;
                    this.cv[j] = f2 * delta;
                    this.y[j] += this.yerr[j];
                }
            }
            for (j = 1; j < this.n; j++)
                this.dv[j][iest] = this.yerr[j];
        }
    }
    bsstep(hv, htry, eps) {
        let i;
        let iq;
        let k;
        let kk;
        let km = 1;
        let eps1;
        let errmax = this.tiny;
        let fact;
        let hh;
        let red = 1.0;
        let scale = 1.0;
        let work;
        let wrkmin;
        let xest;
        let reduct;
        let exitflag = false;
        if (eps != this.epsold) {
            hv[2] = this.xnew = -1.0e29;
            eps1 = this.safe1 * eps;
            this.av[1] = this.nseq[1] + 1.0;
            for (k = 1; k <= this.kmaxx; k++)
                this.av[k + 1] = this.av[k] + this.nseq[k + 1];
            for (iq = 2; iq <= this.kmaxx; iq++) {
                for (k = 1; k < iq; k++)
                    this.alf[k][iq] = Math.pow(eps1, (this.av[k + 1] - this.av[iq + 1]) /
                        ((this.av[iq + 1] - this.av[1] + 1.0) * (2 * k + 1)));
            }
            this.epsold = eps;
            for (this.kopt = 2; this.kopt < this.kmaxx; this.kopt++)
                if (this.av[this.kopt + 1] > this.av[this.kopt] * this.alf[this.kopt - 1][this.kopt])
                    break;
            this.kmax = this.kopt;
        }
        //        console.log(this.kmax);
        hh = htry;
        for (i = 1; i < this.n; i++)
            this.ysav[i] = this.y[i];
        if (hv[0] != this.xnew || hh != hv[2]) {
            this.first = true;
            this.kopt = this.kmax;
        }
        reduct = false;
        for (;;) {
            for (k = 1; k <= this.kmax; k++) {
                this.xnew = hv[0] + hh;
                //                console.log(xnew);
                if (this.xnew == hv[0])
                    console.log("step size underflow in bsstep");
                this.mmid(hv, hh, this.nseq[k]);
                xest = (hh / this.nseq[k]);
                xest = xest * xest;
                this.pzextr(k, xest);
                if (k != 1) {
                    errmax = this.tiny;
                    for (i = 1; i < this.n; i++) {
                        // Don't allow the Z component to enter into the error analysis since this is mostly a 2D solution...
                        if (i % 3 != 0 && i > 3) {
                            //              console.log(i+" "+Math.abs(this.yerr[i]/this.yscal[i])+" "+this.yerr[i]+" "+this.yscal[i]+" "+this.yseq[i]);
                            errmax = (errmax > Math.abs(this.yerr[i] / this.yscal[i]) ? errmax : Math.abs(this.yerr[i] / this.yscal[i]));
                        }
                    }
                    //          console.log("  "+errmax);
                    errmax /= eps;
                    km = k - 1;
                    this.err[km] = Math.pow(errmax / this.safe1, 1.0 / (2 * km + 1));
                }
                if (k != 1 && (k >= this.kopt - 1 || this.first)) {
                    if (errmax < 1.0) {
                        exitflag = true;
                        break;
                    }
                    if (k == this.kmax || k == this.kopt + 1) {
                        red = this.safe2 / this.err[km];
                        break;
                    }
                    else if (k == this.kopt && this.alf[this.kopt - 1][this.kopt] < this.err[km]) {
                        red = 1.0 / this.err[km];
                        break;
                    }
                    else if (this.kopt == this.kmax && this.alf[km][this.kmax - 1] < this.err[km]) {
                        red = this.alf[km][this.kmax - 1] * this.safe2 / this.err[km];
                        break;
                    }
                    else if (this.alf[km][this.kopt] < this.err[km]) {
                        red = this.alf[km][this.kopt - 1] / this.err[km];
                        break;
                    }
                }
            }
            if (exitflag)
                break;
            red = (red < this.redmin ? red : this.redmin);
            red = (red > this.redmax ? red : this.redmax);
            hh *= red;
            //            console.log(red);
            reduct = true;
        }
        hv[0] = this.xnew;
        hv[1] = hh;
        this.first = false;
        wrkmin = 1.0e35;
        for (kk = 1; kk <= km; kk++) {
            fact = (this.err[kk] > this.scalmx ? this.err[kk] : this.scalmx);
            work = fact * this.av[kk + 1];
            if (work < wrkmin) {
                scale = fact;
                wrkmin = work;
                this.kopt = kk + 1;
            }
        }
        hv[2] = hh / scale;
        if (this.kopt >= k && this.kopt != this.kmax && !reduct) {
            fact = (scale / this.alf[this.kopt - 1][this.kopt] > this.scalmx ? scale / this.alf[this.kopt - 1][this.kopt] : this.scalmx);
            if (this.av[this.kopt + 1] * fact <= wrkmin) {
                hv[2] = hh / fact;
                this.kopt++;
            }
        }
    }
    odeint(ystart, x1, x2, eps, h1, hmin) {
        let nstp;
        let i;
        let j;
        let good;
        let bad;
        let xsav;
        let h;
        let scal;
        good = bad = 0;
        this.hv[0] = x1;
        h = (x2 > x1 ? Math.abs(h1) : -Math.abs(h1));
        //    this.hv[1]=this.hv[2]=h;  // Not necessary, but it gets rid of the javac error message
        for (i = 1; i < this.n; i++)
            this.y[i] = ystart[i];
        for (nstp = 0; nstp < 1000; nstp++) {
            //      console.log("Step "+nstp+" Good "+good+" Bad "+bad+" Time "+this.hv[0]);
            this.force(this.hv[0], this.y, this.dydx);
            for (i = 1; i < this.n; i++) {
                //        this.yscal[i]=Math.abs(this.y[i])+Math.abs(this.dydx[i]*h)+1.0e30;
                this.yscal[i] = Math.abs(this.y[i]) + Math.abs(this.dydx[i] * h) + 1.0e-30;
                // The sun gives this.yscal values of 1.0e30 which messes up the BSstep error analysis
                /*
                if (this.rocket_top.useBSstep && this.yscal[i] == 1.0e30)
                  this.yscal[i] = 1.0e20;
                */
            }
            // Redo scales:
            /*
            for (i=0; i<this.nobj; i++) {
              j = i*6;
              if (this.rocket_top.use2D)
                scal = Math.sqrt(this.y[j+1]*this.y[j+1]+this.y[j+2]*this.y[j+2]);
              else
                scal = Math.sqrt(this.y[j+1]*this.y[j+1]+this.y[j+2]*this.y[j+2]+this.y[j+3]*this.y[j+3]);
              this.yscal[j+1] = this.yscal[j+2] = this.yscal[j+3] = scal+1.0e-30;
              if (this.rocket_top.use2D)
                scal = Math.sqrt(this.y[j+4]*this.y[j+4]+this.y[j+5]*this.y[j+5]);
              else
                scal = Math.sqrt(this.y[j+4]*this.y[j+4]+this.y[j+5]*this.y[j+5]+this.y[j+6]*this.y[j+6]);
              this.yscal[j+4] = this.yscal[j+5] = this.yscal[j+6] = scal+1.0e-30;
            }
            */
            if ((this.hv[0] + h - x2) * (this.hv[0] + h - x1) > 0.0)
                h = x2 - this.hv[0];
            if (this.rocket_top.useBSstep) {
                this.bsstep(this.hv, h, eps);
            }
            else {
                this.rkqs(this.hv, h, eps);
            }
            if (this.hv[1] == h)
                good++;
            else
                bad++;
            if ((this.hv[0] - x2) * (x2 - x1) >= 0.0) {
                for (i = 1; i < this.n; i++)
                    ystart[i] = this.y[i];
                return;
            }
            if (Math.abs(this.hv[2]) <= hmin)
                console.log("Step size too small in odeint");
            h = this.hv[2];
        }
        console.log("Too many steps in routine odeint");
    }
    queueReset() {
        this.rocket_top.canvas.clearTrails();
        if (this.rocket_top.threadstarted) {
            if (this.rocket_top.running)
                this.resetQueued = true;
            else {
                this.reset();
                this.refresh();
                this.resetQueued = false;
            }
        }
    }
    doStart() {
    }
    doStop() {
    }
    doResume() {
        window.requestAnimationFrame((ts) => this.run(ts));
    }
    run(ts) {
        //while (true) {
        if (this.timeTweak != 1.0) {
            this.tstep *= this.timeTweak;
            this.timeTweak = 1.0;
        }
        if (this.resetQueued) {
            this.reset();
            this.refresh();
            this.resetQueued = false;
        }
        if (this.running) {
            if (this.rocket_top.RocketMode)
                this.checkLaunch();
            for (let i = 0; i <= this.nobj * 6; i++)
                this.opos[i] = this.pos[i];
            if (this.rocket_top.RocketMode) {
                let tweak = (this.homeplanet == 3 ? this.astDay : this.astDay2 + this.launch2) *
                    86400.0 * this.tscale - this.pos[0];
                if (!this.launched && tweak * (tweak - this.tstep) < 0.0) {
                    this.odeint(this.pos, this.pos[0], this.pos[0] + tweak, 1.0e-6, tweak / 10.0, this.tstep * 1.0e-15);
                    this.pos[0] += tweak;
                    this.checkLaunch();
                    this.odeint(this.pos, this.pos[0], this.pos[0] + this.tstep - tweak, 1.0e-6, (this.tstep - tweak) / 10.0, this.tstep * 1.0e-15);
                    this.pos[0] += this.tstep - tweak;
                }
                else {
                    this.odeint(this.pos, this.pos[0], this.pos[0] + this.tstep, 1.0e-6, this.tstep / 1.0, this.tstep * 1.0e-15);
                    this.pos[0] += this.tstep;
                }
            }
            else {
                this.odeint(this.pos, this.pos[0], this.pos[0] + this.tstep, 1.0e-6, this.tstep / 1.0, this.tstep * 1.0e-15);
                this.pos[0] += this.tstep;
            }
            this.checkRocket();
            this.refresh();
            //yield();
            this.doResume();
        }
        else {
            //suspend();
        }
        //}
    }
    refresh() {
        this.rocket_top.deliverEvent(new JEvent(this, JEvent.ACTION_EVENT, this));
    }
    refreshcanvas() {
        this.rocket_top.deliverEvent(new JEvent(this, JEvent.ACTION_EVENT, this.rocket_top.canvas));
    }
}
let r = new Rocket();
