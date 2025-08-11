// This version is a straight port of http://user.astro.wisc.edu/~dolan/java/nbody/Rocket.java changing as little as possible, warts and all.
// Earlier I tried to port + clean up in one go, but it was too hard to understand all the ancient Java code.

// Wrapper around an HTML span to show data
class Label {
  html_label : HTMLSpanElement;

  constructor(id : string) {
    let span = document.getElementById(id);
    if (!(span instanceof HTMLSpanElement)) {throw new Error("Missing span: " + id);}
    this.html_label = <HTMLSpanElement>span;
  }

  setText(s : string) : void {
    this.html_label.innerHTML = s;
  }
}

class JEvent {
  target : any;
  id : number;
  arg : any;

  static ACTION_EVENT : number = 1;

  constructor(target : any, id : number, arg : any) {
    this.target = target;
    this.id = id;
    this.arg = arg;
  }
}

class Rocket {

  canvas : RocketCanvas;
  intThread : RocketThread;

/*
  Button resetbutton, optbutton, optbutton2, helpbutton, helpbutton2;
  public Button runbutton;
  Button timeUp, timeDown, zoomIn, zoomOut;
  Choice centermenu, destmenu;
  TextField astDistText, astTanVelText, astRadVelText;
  TextField astVelText, astDayText, astAngText;
  TextField astVelText2, astDayText2, astAngText2;
  Checkbox trailsCheckbox, BSCheckbox, twoDCheckbox, captureCheckbox;
  Checkbox useCheckbox[];
*/
  time : Label = new Label("time");
  timestep : Label = new Label("timestep");
  zoom : Label = new Label("zoom");

// General variables
  startHandler : boolean = false;
  usecapture : boolean = true;
  use2D : boolean = true;
  useBSstep : boolean = false;
  drawtrails : boolean = true;
  astinput : boolean = false;
  running : boolean = false;
  threadstarted : boolean = false;

  ready : boolean = false;

  RocketMode : boolean = true;
  AsteroidMode : boolean = false;

  populateCenterOnMenu() : void {
    let centermenu = document.getElementById("center-on");
    if (!centermenu) throw new Error("Missing select");
    for (let i : number =0; i<this.intThread.nobj; i++) {
      if (this.intThread.use[i]) {
        let option  = document.createElement("option");
        option.appendChild(document.createTextNode(this.intThread.names[i]));
        option.setAttribute("value", ""+i);
        centermenu.appendChild(option);
      }
     // centermenu.select(0);
    }
  }

  constructor() {
    let i : number;
    this.getParams();
/*
    Dimension d = size();

    width = d.width;
    height = d.height;


    buf = createImage(width, height);
    gBuf = buf.getGraphics();
    buf2 = createImage(width, height);
    gBuf2 = buf2.getGraphics();

    gBuf.setFont(font = new Font("Helvetica", Font.PLAIN, 10));
    gBuf2.setColor(Color.black);
    gBuf2.fillRect(0, 0, width, height);
*/

    if (this.RocketMode) {
      this.usecapture = true;
      this.use2D = true;
    } else {
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

    this.populateCenterOnMenu();
/*
   intThread.setPriority(Thread.MIN_PRIORITY);
     
   setBackground(Color.lightGray);
    setFont(font = new Font("Helvetica", Font.PLAIN, 12));
    setLayout(card = new CardLayout());
    add("Plot", center = new Panel());
    add("Options", options = new Panel());

    center.setLayout(new BorderLayout());
    center.add("Center", canvas = new RocketCanvas(this, intThread));

    panel = new Panel();
    panel.setLayout(new GridLayout(2,1));
    center.add("South", panel);

    bottom = new Panel();
    bottom.setLayout(new FlowLayout(FlowLayout.LEFT, 1, 5));
    panel.add(bottom);

    bottom.add(trailsCheckbox = new Checkbox("Draw trails"));
    trailsCheckbox.setState(drawtrails);
    // trailsCheckbox.addItemlistener(this);
    bottom.add(runbutton = new Button("Run"));
    // runbutton.addActionListener(this);
    bottom.add(resetbutton = new Button("Restart"));
    // resetbutton.addActionListener(this);
    bottom.add(optbutton = new Button("Options"));
    // optbutton.addActionListener(this);
    bottom.add(new Label("Center on:"));

    centermenu = new Choice();
    bottom.add(centermenu);
    // centermenu.addItemlistener(this);

    bottom = new Panel();
    bottom.setLayout(new FlowLayout(FlowLayout.CENTER, 5, 5));
    panel.add(bottom);
    bottom.add(new Label("Time:"));
    bottom.add(time = new Label("000000000.0"));
    setTime();
    bottom.add(timeUp = new Button("+"));
    // timeUp.addActionListener(this);
    bottom.add(timeDown = new Button("-"));
    // timeDown.addActionListener(this);
    bottom.add(new Label("TimeStep:"));
    bottom.add(timestep = new Label("000000000.0"));
    setTimeStep();
    bottom.add(zoomIn = new Button("+"));
    // zoomIn.addActionListener(this);
    bottom.add(zoomOut = new Button("-"));
    // zoomOut.addActionListener(this);
    bottom.add(new Label("Zoom:"));
    bottom.add(zoom = new Label("1.0     "));
    setTimeStep();

    options.setLayout(new BorderLayout());

    options.add("South", panel = new Panel());
    panel.setLayout(new FlowLayout(FlowLayout.CENTER, 5, 5));
    panel.add(optbutton2 = new Button("Return to main screen"));
    // optbutton2.addActionListener(this);

    options.add("Center", current = new Panel());
    current.setLayout(new GridLayout(17,1));

    if (RocketMode) {
      current.add(panel = new Panel());
      panel.setLayout(new FlowLayout(FlowLayout.CENTER, 5, 5));
      panel.add(new Label("Launch Rocket From Earth:"));
      
      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Destination:"));
      destmenu = new Choice();
      for (i=0; i<intThread.nobj-1; i++)
	destmenu.addItem(intThread.names[i]);
      destmenu.select(intThread.realdestplanet);
      panel.add(destmenu);
      // destmenu.addItemlistener(this);
      panel.add(new Label(""));
      
      current.add(new Label(""));
      
      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Angle from Sun (degrees CW):"));
      panel.add(astAngText = new TextField(String.valueOf(intThread.astAng), 12));
      panel.add(new Label(""));

      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Launch Velocity (km/s)"));
      panel.add(astVelText = new TextField(String.valueOf(intThread.astVel), 12));
      panel.add(new Label(""));
      
      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Launch after how many days?"));
      panel.add(astDayText = new TextField(String.valueOf(intThread.astDay), 12));
      panel.add(new Label(""));

      current.add(new Label(""));
      current.add(panel = new Panel());
      panel.setLayout(new FlowLayout(FlowLayout.CENTER, 5, 5));
      panel.add(new Label("Return to Earth:"));
      
      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Angle from Sun (degrees CW):"));
      panel.add(astAngText2 = new TextField(String.valueOf(intThread.astAng2), 12));
      panel.add(new Label(""));
      
      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Launch Velocity (km/s)"));
      panel.add(astVelText2 = new TextField(String.valueOf(intThread.astVel2), 12));
      panel.add(new Label(""));

      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Launch after how many days?"));
      panel.add(astDayText2 = new TextField(String.valueOf(intThread.astDay2), 12));
      panel.add(new Label(""));
    }

    if (AsteroidMode) {
      current.add(panel = new Panel());
      panel.setLayout(new FlowLayout(FlowLayout.CENTER, 5, 5));
      panel.add(new Label("Input Asteroid Observations:"));

      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Distance from Earth (AU):"));
      panel.add(astDistText = new TextField(String.valueOf(intThread.astDist), 12));
      panel.add(new Label(""));

      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Angle from sun (degrees CW):"));
      panel.add(astAngText = new TextField(String.valueOf(intThread.astAng), 12));
      panel.add(new Label(""));

      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Tangential Velocity (km/s):"));
      panel.add(astTanVelText = new TextField(String.valueOf(intThread.astTanVel), 12));
      panel.add(new Label(""));

      current.add(panel = new Panel());
      panel.setLayout(new GridLayout(1,3));
      panel.add(new Label("Radial Velocity (km/s):"));
      panel.add(astRadVelText = new TextField(String.valueOf(intThread.astRadVel), 12));
      panel.add(new Label(""));

      current.add(new Label(""));
      current.add(new Label("(Note: Radial velocity is measured so that positive velocity is away from the Earth)"));
    }

    current.add(new Label(""));
    current.add(new Label("Include the following bodies in the simulation:"));
    useCheckbox = new Checkbox[intThread.nobj];
    current.add(panel = new Panel());
    panel.setLayout(new GridLayout(1,6));
    panel.add(useCheckbox[0] = new Checkbox(intThread.names[0]));    
    panel.add(useCheckbox[1] = new Checkbox(intThread.names[1]));    
    panel.add(useCheckbox[2] = new Checkbox(intThread.names[2]));    
    panel.add(useCheckbox[3] = new Checkbox(intThread.names[3]));    
    panel.add(useCheckbox[4] = new Checkbox(intThread.names[4]));    
    panel.add(useCheckbox[5] = new Checkbox(intThread.names[5]));
    current.add(panel = new Panel());
    panel.setLayout(new GridLayout(1,6));
    panel.add(useCheckbox[6] = new Checkbox(intThread.names[6]));    
    panel.add(useCheckbox[7] = new Checkbox(intThread.names[7]));    
    panel.add(useCheckbox[8] = new Checkbox(intThread.names[8]));    
    panel.add(useCheckbox[9] = new Checkbox(intThread.names[9]));    
    panel.add(useCheckbox[10] = new Checkbox(intThread.names[10]));    
    panel.add(new Label(""));    
    for (i=0; i<intThread.nobj; i++) {
      useCheckbox[i].setState(intThread.use[i]);
      // useCheckbox[i].addItemlistener(this);
    }
*/


/*
    current.add(new Label(""));
    current.add(panel = new Panel());
    panel.setLayout(new GridLayout(1,4));
    panel.add(twoDCheckbox = new Checkbox("Use 2D physics?"));
    twoDCheckbox.setState(use2D);
    // twoDCheckbox.addItemlistener(this);
    panel.add(captureCheckbox = new Checkbox("Use capture physics?"));
    captureCheckbox.setState(usecapture);
    // captureCheckbox.addItemlistener(this);
*/

    this.setTime();
    this.setTimeStep();
    this.setZoom();
    
    this.startHandler = true;
    this.canvas.update(this.canvas.getGraphics());
  }

  getParams() : void {
    this.RocketMode = false;
    this.AsteroidMode = false;

    let url = window.location.href;
    if (!url) {
      this.RocketMode = true;
    } else {
      if (url.includes("Rocket.html")) {
	this.RocketMode = true;
      } else if (url.includes("Asteroid.html")) {
	this.AsteroidMode = true;
      } else {
	this.RocketMode = true;
      }
    }
  }

  setTime() : void {
    this.time.setText("" + (this.intThread.pos[0]/(this.intThread.tscale*86400.0))+"      ");
  }

  setTimeStep() : void {
    if (this.intThread.timeTweak == 0.0)
      this.timestep.setText("" + (this.intThread.tstep/(this.intThread.tscale*86400.0))+"     ");
    else
      this.timestep.setText("" + (this.intThread.tstep*this.intThread.timeTweak/(this.intThread.tscale*86400.0))+"      ");
  }

  setZoom() : void {
    this.zoom.setText("" + (Math.floor(100000.0*this.canvas.zoom)/100000.0)+"     ");
  }

  itemStateChanged(event : JEvent) : boolean {
    let target : any = event.target;

/*
    if (target == BSCheckbox) {
      useBSstep = BSCheckbox.getState();
      intThread.queueReset();
    } else if (target == twoDCheckbox) {
      use2D = twoDCheckbox.getState();
      intThread.queueReset();
    } else if (target == captureCheckbox) {
      usecapture = captureCheckbox.getState();
      intThread.queueReset();
    } else if (target == trailsCheckbox) {
      drawtrails = trailsCheckbox.getState();
      canvas.clearTrails();
    } else if (target == useCheckbox[0]) {
      intThread.use[0] = useCheckbox[0].getState();
    } else if (target == useCheckbox[1]) {
      intThread.use[1] = useCheckbox[1].getState();
    } else if (target == useCheckbox[2]) {
      intThread.use[2] = useCheckbox[2].getState();
    } else if (target == useCheckbox[3]) {
      intThread.use[3] = useCheckbox[3].getState();
    } else if (target == useCheckbox[4]) {
      intThread.use[4] = useCheckbox[4].getState();
    } else if (target == useCheckbox[5]) {
      intThread.use[5] = useCheckbox[5].getState();
    } else if (target == useCheckbox[6]) {
      intThread.use[6] = useCheckbox[6].getState();
    } else if (target == useCheckbox[7]) {
      intThread.use[7] = useCheckbox[7].getState();
    } else if (target == useCheckbox[8]) {
      intThread.use[8] = useCheckbox[8].getState();
    } else if (target == useCheckbox[9]) {
      intThread.use[9] = useCheckbox[9].getState();
    } else if (target == useCheckbox[10]) {
      intThread.use[10] = useCheckbox[10].getState();
    } else if (target == centermenu) {
      int i,j,n;
      n = centermenu.getSelectedIndex();
      for (i=0,j=0; i<n; i++,j++)
	while (!intThread.use[j])
	  j++;
      canvas.setCenter(j);
    } else {
      if (RocketMode) {
	if (target == destmenu) {
	  int i,j,n;
	  n = destmenu.getSelectedIndex();
	  for (i=0,j=0; i<n; i++,j++)
	    while (!intThread.use[j])
	      j++;
	  intThread.realdestplanet = j;
	} else {
	  return false;
	}
      } else {
	return false;
      }
    }
    */
    return false;
  }

  actionPerformed(event : JEvent) : boolean{
    let target : any = event.target;

    if (target == this.intThread) {
      if (event.arg == this.canvas) {
	this.canvas.capture(this.intThread.capture);
      } else {
	this.setUnready();
	this.setTime();
	this.canvas.update(this.canvas.getGraphics());
      }
/*
    } else if (target == optbutton) {
      card.show(this, "Options");
    } else if (target == helpbutton) {
      card.show(this, "Help");
    } else if (target == helpbutton2) {
      card.show(this, "Plot");
    } else if (target == resetbutton) {
      if (threadstarted) {
	if (running) {
	  intThread.queueReset();
	} else {
	  intThread.queueReset();
	  intThread.resume();
	}
      }
    } else if (target == runbutton) {
      if (!running) {
	if (!threadstarted) {
	  threadstarted = true;
	  intThread.start();
	} else {
	}
	runbutton.setLabel("Stop");
	running = true;
	intThread.running = true;
	intThread.resume();
      } else {
	runbutton.setLabel("Run");
	running = false;
	intThread.running = false;
      }
    } else if (target == timeUp) {
      intThread.adjustTimeStepUp(true);
      setTimeStep();
    } else if (target == timeDown) {
      intThread.adjustTimeStepUp(false);
      setTimeStep();
    } else if (target == zoomIn) {
      canvas.ZoomIn(true);
      this.setZoom();
    } else if (target == zoomOut) {
      canvas.ZoomIn(false);
      this.setZoom();
    } else if (target == optbutton2) {
      if (RocketMode) {
	intThread.doRocket(1, new Double(astAngText.getText()).doubleValue(),
			   new Double(astVelText.getText()).doubleValue(),
			   new Double(astDayText.getText()).doubleValue());
	intThread.doRocket(2, new Double(astAngText2.getText()).doubleValue(),
			   new Double(astVelText2.getText()).doubleValue(),
			   new Double(astDayText2.getText()).doubleValue());
	card.show(this, "Plot");
      } else {
	intThread.doAsteroid(new Double(astDistText.getText()).doubleValue(),
			     new Double(astAngText.getText()).doubleValue(),
			     new Double(astTanVelText.getText()).doubleValue(),
			     new Double(astRadVelText.getText()).doubleValue());
	card.show(this, "Plot");
      }
*/
    }
    return false;
  }

  handleEvent(event : JEvent) : boolean {
    if (!this.startHandler) {
      return false; // super.handleEvent(event);
    }

    if (event.id == JEvent.ACTION_EVENT) {
      if (this.itemStateChanged(event) || this.actionPerformed(event))
	return true;
      else
	return false; // super.handleEvent(event);
    } else
      return false; // super.handleEvent(event);
  }

  deliverEvent(event : JEvent) : boolean {
    return this.handleEvent(event);
  }

  isReady() : boolean {
    return this.ready;
  }

  setReady() : void {
    this.ready = true;
  }

  setUnready() : void {
    this.ready = false;
  }
}

class Dimension {
 width : number = 0.0;
 height : number = 0.0;
}

class RocketCanvas {

  d : Dimension = new Dimension();
  xmid : number;
  ymid : number;
  scale : number;
  zoom : number;
  rocket_top : Rocket;
  thread : RocketThread;
  centerOn : number;
  useDoubleBuffer : boolean;
  useTrailBuffer : boolean;
  //int trails[][][]
  trailstart : number;
  trailstop : number;
  trailmax : number;
  //Color trailColor[];
  launched : boolean;
  message : string;
  msgcount : number; // int
  msgkeeptime : number; // int

  html_canvas : HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  size() : Dimension {
    let dd : Dimension = new Dimension();
    dd.width = this.html_canvas.width;
    dd.height = this.html_canvas.height;
    return dd;
  }

  constructor(parent : Rocket, intThread : RocketThread) {
    let i : number;

    this.html_canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.ctx = <CanvasRenderingContext2D>this.html_canvas.getContext("2d");

    this.d = this.size();
    this.xmid = this.d.width/2;
    this.ymid = this.d.height/2;

    this.rocket_top = parent;
    this.thread = intThread;

    this.useDoubleBuffer = false;
    this.useTrailBuffer = false;

    this.launched = false;

    this.message = "";
    this.msgcount = 0;
    this.msgkeeptime = 300;  // - This was too short for Windows java SLJ 12-Nov-09
   // this.msgkeeptime = 2000; - This works on Windows but make everthing else too slow SLJ 12-Nov-09

    this.scale = 1.0/(4.0*1.496e13*this.thread.dscale);
    this.zoom = 1.0;

    this.centerOn = 0;  // Track the Sun

    //setFont(new Font("Helvetica", Font.PLAIN, 10));
    //setBackground(Color.black);
    //setForeground(Color.white);

    this.trailstart = this.trailstop = 0;
    this.trailmax = 1000;
    //trails = new int[this.thread.nobj][trailmax][2];
    //trailColor = new Color[this.thread.nobj];

    //for (i=0; i<this.thread.nobj; i++)
    //  trailColor[i] = Color.red;
    //trailColor[10] = Color.cyan;

    if (this.useTrailBuffer)
      this.clearTrails();
  }

  getGraphics() : CanvasRenderingContext2D {
    return this.ctx;
  }

  ZoomIn(is_in : boolean) : void {
    let amt : number = 1.5;
    this.scale /= this.zoom;
    if (is_in)
      this.zoom *= 1.5;
    else
      this.zoom /= amt;
    this.scale *= this.zoom;
    this.update(this.getGraphics());
    if (this.useTrailBuffer)
      this.clearTrails();
  }

  setCenter(c : number) : void {
    this.centerOn = c;
    this.update(this.getGraphics());
    if (this.useTrailBuffer)
      this.clearTrails();
  }

  clearTrails() : void {
    if (this.useTrailBuffer) {
      this.d = this.size();
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, this.d.width, this.d.height);
    } else {
      this.trailstart = this.trailstop = 0;
    }
  }

  drawCenteredString(g : CanvasRenderingContext2D, s : string, x : number, y : number) : void {
    let t : TextMetrics = g.measureText(s);
    g.fillText(s, x - t.width/2, y + t.fontBoundingBoxAscent/2);
  }

  drawLine(g : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) : void {
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.closePath();
    g.stroke();
  }

  fillOval(g : CanvasRenderingContext2D, x : number, y : number, w : number, h : number) : void {
    g.beginPath();
    g.arc(x, y, (w+h)/4.0, 0, Math.PI*2, true);
    g.closePath();
    g.fill();
  }

  paintScale(g : CanvasRenderingContext2D) : void {
    let l : number;
    let ll : number; // int;

    l = 1.0/(this.scale*this.thread.dscale*5*1.496e13);
    l = Math.pow(10.0, Math.round(Math.log(l)/Math.log(10.0)));
    ll = Math.floor(0.5*l*this.thread.dscale*this.scale*1.496e13*this.d.width);
    g.fillStyle = "white";
    this.drawLine(g, this.xmid-ll, this.d.height-8, this.xmid+ll, this.d.height-8);
    this.drawCenteredString(g, ""+l+" AU", this.xmid, this.d.height-17);   
  }

  paintSky(g : CanvasRenderingContext2D) : void {
    let i : number;
    let j : number;
    let size : number = 3;
    let x : number;
    let y : number;
    let z : number;

    this.d = this.size();
    this.xmid = this.d.width/2;
    this.ymid = this.d.height/2;

    if (this.useTrailBuffer) {
      if (this.rocket_top.drawtrails) {
        // TODO
        //g.drawImage(this.rocket_top.buf2, 0, 0, this);
      } else {
	g.fillStyle = "black";
	g.fillRect(0, 0, this.d.width, this.d.height);
      }
    } else {
      g.fillStyle = "black";
      g.fillRect(0, 0, this.d.width, this.d.height);

/*
      if (this.rocket_top.drawtrails) {
	for (i=0; i<this.thread.nobj; i++) {
	  g.setColor(trailColor[i]);
	  if (this.thread.use[i]) {
	    if (this.trailstart <= this.trailstop) {
	      for (j=this.trailstart; j<this.trailstop; j++)
		this.fillOval(g, trails[i][j][0], trails[i][j][1], 2, 2);
	    } else {
	      for (j=this.trailstart; j<this.trailmax; j++)
		this.fillOval(g, trails[i][j][0], trails[i][j][1], 2, 2);
	      for (j=0; j<this.trailstop; j++)
		this.fillOval(g, trails[i][j][0], trails[i][j][1], 2, 2);
	    }
	  }
	}
      }
*/
    }

    g.fillStyle = "white";
    for (i=0; i<this.thread.nobj; i++) {
      if (this.thread.use[i] && (this.launched || i != this.thread.nobj-1 || !this.rocket_top.RocketMode)) {
	x = this.xmid + Math.floor(this.d.width*this.scale*(this.thread.pos[i*6+1]-this.thread.pos[this.centerOn*6+1]));
	y = this.ymid - Math.floor(this.d.height*this.scale*(this.thread.pos[i*6+2]-this.thread.pos[this.centerOn*6+2]));
	// z = Math.floor(this.d.height*this.scale*(this.thread.pos[i*6+3]-this.thread.pos[this.centerOn*6+3])*0.2);
	z = Math.floor(this.d.height*this.scale*this.thread.pos[i*6+3]*0.2);
	g.fillStyle = "white";
       	this.fillOval(g, x - size, y - size, size*2, size*2);
	this.drawCenteredString(g, this.thread.names[i], x, y+7);

        /*
	if (rocket_top.drawtrails) {
	  if (useTrailBuffer) {
	    rocket_top.gBuf2.setColor(trailColor[i]);
	    rocket_top.gBuf2.fillOval(x-1, y-1, 2, 2);
	  } else {
	    trails[i][trailstop][0] = x-1;
	    trails[i][trailstop][1] = y-1;
	    trailstop++;
	    if (trailstop == trailmax)
	      trailstop = 0;
	    if (trailstop == trailstart) {
	      trailstart++;
	      if (trailstart == trailmax)
		trailstart = 0;
	    }
	  }
	}
        */

      }
    }
    if (this.rocket_top.drawtrails && this.useTrailBuffer && !this.launched && this.thread.launched) {
      i = this.thread.nobj-1;
      x = this.xmid + Math.floor(this.d.width*this.scale*(this.thread.pos[i*6+1]-this.thread.pos[this.centerOn*6+1]));
      y = this.ymid - Math.floor(this.d.height*this.scale*(this.thread.pos[i*6+2]-this.thread.pos[this.centerOn*6+2]));
      z = Math.floor(this.d.height*this.scale*this.thread.pos[i*6+3]*0.2);
      g.fillStyle = "green";
      this.drawLine(g, x, y, x, y-6);
      this.drawCenteredString(g, "launched", x, y-15);
      this.launched = true;
    }
    this.paintScale(g);
    if (this.message != "") {
      g.fillStyle = "yellow";
      this.drawCenteredString(g, this.message, this.xmid, 10);
      if (++this.msgcount == this.msgkeeptime) {
	this.message = "";
	this.msgcount = 0;
      }
    }
  }

  paint(g : CanvasRenderingContext2D) : void {
    console.log("paint");
    let bbox = this.html_canvas.getBoundingClientRect();
    this.html_canvas.width = bbox.width;
    this.html_canvas.height = bbox.height;
    if (this.useDoubleBuffer) {
      //this.paintSky(rocket_top.gBuf);
      //g.drawImage(rocket_top.buf, 0, 0, this);
    } else {
      this.paintSky(g);
    }
    this.rocket_top.setReady();
  }

  update(g : CanvasRenderingContext2D) : void {
    // override this because the default implementation always
    // calls clearRect first, causing unwanted flicker
    this.paint(g);
  }

/*
  paintCapture(g : CanvasRenderingContext2D, n : number) : void {
    FontMetrics f = g.getFontMetrics(g.getFont());
    int w,h;
    String s;

    d = size();
    xmid = d.width/2;
    ymid = d.height/2;
    
    s = "Rocket has arrived at "+this.thread.names[n];
    w = f.stringWidth(s);
    h = f.getHeight();

    g.setColor(Color.black);
    g.fillRect(xmid-w/2-15, ymid-h/2-15, w+30, h+30);
    
    g.setColor(Color.yellow);
    g.drawString(s, xmid - w/2, ymid + h/2);
  }
*/

  capture(n: number) : void {
    let i : number;
    let x : number;
    let y : number;
    let z : number;

    if (this.rocket_top.drawtrails && this.useTrailBuffer) {
      i = this.thread.nobj-1;
      x = this.xmid + Math.floor(this.d.width*this.scale*(this.thread.pos[i*6+1]-this.thread.pos[this.centerOn*6+1]));
      y = this.ymid - Math.floor(this.d.height*this.scale*(this.thread.pos[i*6+2]-this.thread.pos[this.centerOn*6+2]));
      z = Math.floor(this.d.height*this.scale*this.thread.pos[i*6+3]*0.2);
      //rocket_top.gBuf2.setColor(Color.green);
      //rocket_top.gBuf2.drawLine(x, y, x, y-6);
      //drawCenteredString(rocket_top.gBuf2, "arrived", x, y-15);
      this.launched = false;
    }
  }
}

class RocketThread {

  rocket_top : Rocket;

  yscal : number[];
  y : number[];
  dydx : number[];
  yerr : number[];
  ytemp : number[];
  ak2 : number[];
  ak3 : number[];
  ak4 : number[];
  ak5 : number[];
  ak6 : number[];
  aytemp : number[];
  hv : number[];
    
  a2 : number =0.2;
  a3 : number =0.3;
  a4 : number =0.6;
  a5 : number =1.0;
  a6 : number =0.875;
  b21 : number =0.2;
  b31 : number =3.0/40.0;
  b32 : number =9.0/40.0;
  b41 : number =0.3;
  b42 : number = -0.9;
  b43 : number =1.2;
  b51 : number = -11.0/54.0;
  b52 : number =2.5;
  b53 : number = -70.0/27.0;
  b54 : number =35.0/27.0;
  b61 : number =1631.0/55296.0;
  b62 : number =175.0/512.0;
  b63 : number =575.0/13824.0;
  b64 : number =44275.0/110592.0;
  b65 : number =253.0/4096.0;
  c1 : number =37.0/378.0;
  c3 : number =250.0/621.0;
  c4 : number =125.0/594.0;
  c6 : number=512.0/1771.0;
  dc5 : number = -277.0/14336.0;
  dc1 : number = this.c1-2825.0/27648.0;
  dc3 : number = this.c3-18575.0/48384.0;
  dc4 : number = this.c4-13525.0/55296.0;
  dc6 : number = this.c6-0.25;
  
  safe1 : number =0.25;
  safe2 : number =0.7;
  redmax : number =1.0e-5;
  redmin : number =0.7;
  tiny : number =1.0e-30;
  scalmx : number =0.1;

  first : boolean =true;
  kmax : number = 0; // int
  kopt: number = 0; // int
  epsold : number = -1.0;
  xnew : number = 0.0;
  kmaxx : number; // int
  imaxx : number; // int
  ysav : number[];
  yseq : number[];
  ym : number[];
  yn : number[];
  cv : number[];
  dv : number[][]; // todo
  xv : number[];
  err : number[]
  av : number[];
  alf : number[][];  // todo
  nseq : number[] = [0,2,4,6,8,10,12,14,16,18,0];

  astDist : number;
  astTanVel : number;
  astRadVel : number;
  astAng : number;
  astVel : number;
  astDay : number;
  astAng2 : number;
  astVel2 : number;
  astDay2 : number;
  tstep : number;
  timeTweak : number;
  use : boolean[];
  pos : number[];
  opos : number[];
  nobj : number;  // int
  names: string[] = ["Sun", "Mercury", "Venus", "Earth", "Mars", 
			   "Jupiter", "Saturn", "Uranus", "Neptune", 
			   "Pluto", "Rocket"];

  dscale : number;
  tscale : number;
  mscale : number;
  G : number;
  gmass : number[];
  n : number; // int
  nall : number;  // int
  resetQueued : boolean;
  running : boolean;

  captureradius : number = 0.0;
  lastDist : number = 0.0;
  baseDist : number = 0.0;
  defaultDist : number;

  launched : boolean = false;
  launched2 : boolean = false;
  capture : number; // int
  homeplanet : number = 3; // int
  destplanet : number = -1; // int
  realdestplanet : number = -1; // int
  launch2 : number = 0.0;
  vfuel : number;

  start : number[] = [ 2450120.5,    // JD
	    //   X           Y            Z         dX/dt          dY/dt        dZ/dt
	    //  (au)        (au)         (au)      (au/day)       (au/day)     (au/day)
 	      0.0,        0.0,        0.0,        0.0,          0.0,          0.0,          // Sun
 	     -0.3857365, -0.1639517, -0.0475646,  0.00549764,  -0.02151416,  -0.01206210,   // Mercury
	      0.3712951,  0.5729661,  0.2342605, -0.01740866,   0.00900940,   0.00515493,   // Venus
	     -0.7275681,  0.6107332,  0.2647897, -0.01189440,  -0.01170492,  -0.00507485,   // Earth
	      1.1654028, -0.6640779, -0.3361055,  0.00805691,   0.01189269,   0.00523687,   // Mars
	      0.056618,  -4.830622,  -2.072002,   0.007452809,  0.000464097,  0.000017346,  // Jupiter
	      9.538874,  -0.433794,  -0.589470,   0.000072742,  0.005138641,  0.002119286,  // Saturn
	     10.10557,  -15.49204,   -6.92805,    0.003357478,  0.001695406,  0.000694931,  // Uranus
	     12.95617,  -25.09561,  -10.59449,    0.002821829,  0.001292370,  0.000458749,  // Neptune
	    -14.07658,  -26.07059,   -3.89443,    0.002854335, -0.001553801, -0.001342638,  // Pluto
	     -0.7275681,  0.6107332,  0.2647897, -0.01189440,  -0.01170492,  -0.00507485];  // Rocket
    
//	     -0.1108571,  0.6454034,  0.2973650, -0.02005303,  -0.00340512,  -0.00026263,   // Venus, 24409920.5
//            0.6827481,  0.2361149,  0.0630089, -0.00681826,   0.01715097,   0.00814731,   // Venus 2450320.5
//	     13.01258,  -13.68721,   -6.17881,    0.002944503,  0.002214815,  0.000928295,  // Uranus, 2451040.5

  constructor(parent: Rocket) {
    let tweak : number;

    this.rocket_top = parent;

    if (this.rocket_top.RocketMode) {
      // Tweak Venus: use coords for JD 2450320.5
      this.start[2*6+1] = 0.6827481;
      this.start[2*6+2] = 0.2361149;
      this.start[2*6+3] = 0.0630089;
      this.start[2*6+4] = -0.00681826;
      this.start[2*6+5] = 0.01715097;
      this.start[2*6+6] = 0.00814731;
    }
    if (this.rocket_top.AsteroidMode) {
      this.names[10] = "Asteroid";
    }

    this.vfuel = 2.5; // km/s -- exhaust velocity of fuel

    this.dscale = 1.0e-5;
    this.tscale = 1.0/86400.0;
    this.mscale = 1.0e-3;

    // tstep = 7.0*86400.0*this.tscale;  // 1 week
    // tstep = 84600.0*this.tscale;      // 1 day
    // tstep = 8.0*86400.0*this.tscale;  // 8 days (better than seven since it is a power of 2)
    this.tstep = 4.0*86400.0*this.tscale;  // 4 days (changed 10/16/98 since we got a faster applet runner)

    this.launched = false;
    this.running = false;
    this.resetQueued = false;
    this.timeTweak = 1.0;

    this.defaultDist = 5.0e7 * 1.0e5 * this.dscale;
    if (this.rocket_top.RocketMode)
      this.captureradius = 3000000; // 3 million km
    if (this.rocket_top.AsteroidMode)
      this.captureradius =  400000; // 400,000 km

    this.nobj = 11;
    this.nall = 6*this.nobj+1;
    this.n = this.nall;
    
    this.pos = new Array<number>(this.nall);
    this.opos = new  Array<number>(this.nall);
    this.use = new Array<boolean>(this.nobj);
    this.gmass = new  Array<number>(this.nobj);

    for (i=0; i<this.nobj; i++)
      this.use[i] = true;

    this.G = 6.67259e-8 * this.dscale*this.dscale*this.dscale/(this.mscale*this.tscale*this.tscale);

    this.gmass[0] = this.G * 1.990e33*this.mscale;     // Sun       (mass in grams*this.mscale)
    this.gmass[1] = this.G * 3.303e26*this.mscale;     // Mercury
    this.gmass[2] = this.G * 4.870e27*this.mscale;     // Venus
    this.gmass[3] = this.G * 5.976e27*this.mscale;     // Earth-Moon 
    this.gmass[4] = this.G * 6.418e26*this.mscale;     // Mars
    this.gmass[5] = this.G * 1.899e30*this.mscale;     // Jupiter
    this.gmass[6] = this.G * 5.686e29*this.mscale;     // Saturn
    this.gmass[7] = this.G * 8.660e28*this.mscale;     // Uranus
    this.gmass[8] = this.G * 1.030e29*this.mscale;     // Neptune
    this.gmass[9] = this.G * 1.000e25*this.mscale;     // Pluto
    this.gmass[10] = 0.0;             // Test mass (Asteroid, Rocket, etc.)

    this.fixCoords();

    // Static, internal arrays for the RK integrator functions
    this.yscal = new Array<number>(this.nall);
    this.y = new Array<number>(this.nall);
    this.dydx = new Array<number>(this.nall);
    this.yerr = new Array<number>(this.nall);
    this.ytemp = new Array<number>(this.nall);
    this.ysav = new Array<number>(this.nall);
    this.yseq = new Array<number>(this.nall);
    this.ym = new Array<number>(this.nall);
    this.yn = new Array<number>(this.nall);
    this.ak2 = new Array<number>(this.nall);
    this.ak3 = new Array<number>(this.nall);
    this.ak4 = new Array<number>(this.nall);
    this.ak5 = new Array<number>(this.nall);
    this.ak6 = new Array<number>(this.nall);
    this.aytemp = new Array<number>(this.nall);

    this.hv = new Array<number>(3);

    this.kmaxx = 8;
    this.imaxx = this.kmaxx+1;
    this.cv = new Array<number>(this.nall);
    this.dv = [];
    for (var i : number = 0; i < this.nall; i++) {
      this.dv[i] = Array<number>(this.kmaxx+1);
    }
    this.xv = new Array<number>(this.kmaxx+1);
    this.err = new Array<number>(this.kmaxx+1);
    this.av = new Array<number>(this.imaxx+2);
    this.alf = [];
    for (var i : number = 0; i < this.kmaxx+2; i++) {
      this.alf[i] = Array<number>(this.kmaxx+2);
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

  fixCoords() : void {
    let m : number[][];
    let x : number;
    let y : number;
    let r : number;
    let r2 : number;
    let t : number;
    let theta : number;
    let i : number;
    let j : number;

    // Rotate the "start" vector so we are looking at the Earth-Sun
    // plane with no inclination
    
    m = [];
    for (i = 0; i<3; i++) {
      m[i] = new Array<number>(4);
    }

    // First, figure out where the Earth plane is pointing.
    x = this.start[3*6+1];
    y = this.start[3*6+2];
    r2 = Math.sqrt(x*x+y*y);
    r = Math.sqrt(r2*r2 + this.start[3*6+3]*this.start[3*6+3]);

    // anti-z rotation
    m[0][0] = x/r2;
    m[0][1] = -y/r2;
    m[0][2] = 0.0;
    m[1][0] = y/r2;
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

    // y rotation
    t = Math.sqrt(this.start[3*6+1]*this.start[3*6+1] + this.start[3*6+3]*this.start[3*6+3]);
    m[0][0] = this.start[3*6+1]/t;
    m[0][1] = 0.0;
    m[0][2] = -this.start[3*6+3]/t;
    m[1][0] = 0.0;
    m[1][1] = 1.0;
    m[1][2] = 0.0;
    m[2][0] = this.start[3*6+3]/t;
    m[2][1] = 0.0;
    m[2][2] = this.start[3*6+1]/t;

    for (i=0; i<this.nobj; i++)
      for (j=0; j<=1; j++) {
	m[0][3] = this.start[i*6+j*3+1]*m[0][0] + this.start[i*6+j*3+2]*m[1][0] + this.start[i*6+j*3+3]*m[2][0];
	m[1][3] = this.start[i*6+j*3+1]*m[0][1] + this.start[i*6+j*3+2]*m[1][1] + this.start[i*6+j*3+3]*m[2][1];
	m[2][3] = this.start[i*6+j*3+1]*m[0][2] + this.start[i*6+j*3+2]*m[1][2] + this.start[i*6+j*3+3]*m[2][2];
	this.start[i*6+j*3+1] = m[0][3];
	this.start[i*6+j*3+2] = m[1][3];
	this.start[i*6+j*3+3] = m[2][3];
      }

    // anti-x rotation, based on the velocity vector
    t = Math.sqrt(this.start[3*6+5]*this.start[3*6+5] + this.start[3*6+6]*this.start[3*6+6]);
    m[0][0] = 1.0;
    m[0][1] = 0.0;
    m[0][2] = 0.0;
    m[1][0] = 0.0;
    m[1][1] = this.start[3*6+5]/t;
    m[1][2] = -this.start[3*6+6]/t;
    m[2][0] = 0.0;
    m[2][1] = this.start[3*6+6]/t;
    m[2][2] = this.start[3*6+5]/t;

    for (i=0; i<this.nobj; i++)
      for (j=0; j<=1; j++) {
	m[0][3] = this.start[i*6+j*3+1]*m[0][0] + this.start[i*6+j*3+2]*m[1][0] + this.start[i*6+j*3+3]*m[2][0];
	m[1][3] = this.start[i*6+j*3+1]*m[0][1] + this.start[i*6+j*3+2]*m[1][1] + this.start[i*6+j*3+3]*m[2][1];
	m[2][3] = this.start[i*6+j*3+1]*m[0][2] + this.start[i*6+j*3+2]*m[1][2] + this.start[i*6+j*3+3]*m[2][2];
	this.start[i*6+j*3+1] = m[0][3];
	this.start[i*6+j*3+2] = m[1][3];
	this.start[i*6+j*3+3] = m[2][3];
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
      
      i=8;
      for (j=0; j<=1; j++) {
	m[0][3] = this.start[i*6+j*3+1]*m[0][0] + this.start[i*6+j*3+2]*m[1][0] + this.start[i*6+j*3+3]*m[2][0];
	m[1][3] = this.start[i*6+j*3+1]*m[0][1] + this.start[i*6+j*3+2]*m[1][1] + this.start[i*6+j*3+3]*m[2][1];
	m[2][3] = this.start[i*6+j*3+1]*m[0][2] + this.start[i*6+j*3+2]*m[1][2] + this.start[i*6+j*3+3]*m[2][2];
	this.start[i*6+j*3+1] = m[0][3];
	this.start[i*6+j*3+2] = m[1][3];
	this.start[i*6+j*3+3] = m[2][3];
      }
    }

    if (this.rocket_top.AsteroidMode) {
      let tweak : number;

      // Tweak the distance to put it out at the Asteroid Belt

      //    tweak = 1.15;
      tweak = 2.5;
      this.start[10*6+1] *= tweak;
      this.start[10*6+2] *= tweak;
      this.start[10*6+3] *= tweak;
      
      // Tweak the velocity to make it a (roughly) circular orbit at
      // its new distance

      this.start[10*6+4] *= 1.0/Math.sqrt(tweak);
      this.start[10*6+5] *= 1.0/Math.sqrt(tweak);
      this.start[10*6+6] *= 1.0/Math.sqrt(tweak);
    }
  }
  
  adjustTimeStepUp(up : boolean) : void {
    let amt : number = 2.0;
    if (up)
      this.timeTweak *= amt;
    else
      this.timeTweak *= 1.0/amt;
  }

  reset() : void {
    let i : number;
    // Convert JD to sec
    this.pos[0] = (this.start[0]-2450000.0)*86400.0*this.tscale;
    // Renormalize the time scale
    this.pos[0] = 0.0*86400.0*this.tscale;

    for (i=0; i<this.nobj; i++) {
      // Convert AU and AU/day to cm and cm/s
      this.pos[i*6+1] = this.start[i*6+1]*1.496e13*this.dscale;
      this.pos[i*6+2] = this.start[i*6+2]*1.496e13*this.dscale;
      this.pos[i*6+3] = this.start[i*6+3]*1.496e13*this.dscale;
      if (this.use[i]) {
	this.pos[i*6+4] = this.start[i*6+4]*1.496e13*this.dscale/(86400.0*this.tscale);
	this.pos[i*6+5] = this.start[i*6+5]*1.496e13*this.dscale/(86400.0*this.tscale);
	this.pos[i*6+6] = this.start[i*6+6]*1.496e13*this.dscale/(86400.0*this.tscale);
      } else {
	this.pos[i*6+4] = this.pos[i*6+5] = this.pos[i*6+6] = 0.0;
      }
    }

    this.launched = false;
    if (this.rocket_top.threadstarted) {
      this.rocket_top.canvas.launched = false;
      this.rocket_top.canvas.message = "";
      this.rocket_top.canvas.msgcount = 0;
    }
    this.homeplanet = 3;
    this.destplanet = this.realdestplanet;
    this.launch2 = 0.0;
    this.lastDist = this.baseDist = this.defaultDist;
  }

  doAsteroid(dist : number, ang : number, tanvel : number, 
			 radvel : number) : void {
    let i : number;
    let a : number;

    this.astDist = dist;
    this.astAng = ang;
    this.astTanVel = tanvel;
    this.astRadVel = radvel;
    
    // Start from Earth
    for (i=1; i<=6; i++)
      this.start[(this.nobj-1)*6+i] = this.start[3*6+i];

    // Distance in AU
    a = Math.atan2(this.start[(this.nobj-1)*6+2], this.start[(this.nobj-1)*6+1]);
    this.start[(this.nobj-1)*6+1] += this.astDist*Math.cos(a-(this.astAng+180.0)*Math.PI/180.0);
    this.start[(this.nobj-1)*6+2] += this.astDist*Math.sin(a-(this.astAng+180.0)*Math.PI/180.0);

    // Convert velocity from km/s to AU/day
    this.start[(this.nobj-1)*6+4] = this.astTanVel*(86400.0/1.496e8)*Math.cos(a-(this.astAng+90.0)*Math.PI/180.0);
    this.start[(this.nobj-1)*6+5] = this.astTanVel*(86400.0/1.496e8)*Math.sin(a-(this.astAng+90.0)*Math.PI/180.0);
    this.start[(this.nobj-1)*6+4] += this.astRadVel*(86400.0/1.496e8)*Math.cos(a-(this.astAng+180.0)*Math.PI/180.0);
    this.start[(this.nobj-1)*6+5] += this.astRadVel*(86400.0/1.496e8)*Math.sin(a-(this.astAng+180.0)*Math.PI/180.0);
    this.queueReset();
    this.rocket_top.astinput = true;
  }
  
  doRocket(n : number, ang : number, vel : number, day : number) : void {
    if (n == 1) {
      this.astAng = ang;
      this.astVel = vel;
      this.astDay = day;
    } else {
      this.astAng2 = ang;
      this.astVel2 = vel;
      this.astDay2 = day;
    }

    this.queueReset();
    this.rocket_top.astinput = true;
  }

  checkLaunch() : void {
    let a : number;
    let ang : number
    let vel : number;
    let day : number;
    let fuel : number;
    let order : number;
    let sign : number;

    if (this.homeplanet == 3) {
      ang = this.astAng;
      vel = this.astVel;
      day = this.astDay;
    } else {
      ang = this.astAng2;
      vel = this.astVel2;
      day = this.astDay2+this.launch2;
    }

    if (!this.launched && this.pos[0] >= day*86400.0*this.tscale) {
      if (this.launch2 > 0.0 && this.homeplanet == 3) {
	// Already returned to Earth; Don't launch again
      } else {
	// Don't launch if the velocity is zero!
	// This is a clue that the user has not yet entered any
	// parameters on the Options screen.
	if (vel != 0.0) {
	  
	  // Angle of Rocket from Sun
	  a = Math.atan2(this.pos[(this.nobj-1)*6+2], this.pos[(this.nobj-1)*6+1]);
	  
	  // Convert velocity from km/s to "pos" units (cm/s * scale)
	  this.pos[(this.nobj-1)*6+4] += vel * 1.0e5 * this.dscale/this.tscale * 
	    Math.cos(a-(ang+180.0)*Math.PI/180.0);
	  this.pos[(this.nobj-1)*6+5] += vel * 1.0e5 * this.dscale/this.tscale * 
	    Math.sin(a-(ang+180.0)*Math.PI/180.0);
	  this.launched = true;
	  fuel = Math.exp(vel/this.vfuel)-1.0;
	  if (fuel > 0.0) {
	    order = Math.pow(10.0, 
			     Math.floor(Math.log(fuel)/Math.log(10.0)-2));
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
	    fuel = order*(Math.round(fuel/order));
	  }
	  this.rocket_top.canvas.message = "Fuel used: "+fuel;
	  if (this.rocket_top.canvas.message.endsWith("0001")) {
	    this.rocket_top.canvas.message = this.rocket_top.canvas.message.substring(0,
				 this.rocket_top.canvas.message.length-4);
	    while (this.rocket_top.canvas.message.endsWith("0"))
	      this.rocket_top.canvas.message = this.rocket_top.canvas.message.substring(0,
				   this.rocket_top.canvas.message.length-1);
	  }
	  
	  this.rocket_top.canvas.message += " metric tons";
	  this.rocket_top.canvas.msgcount = 0;
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
  checkRocket() : void {
    let i : number;
    let j : number;
    let k : number;
    let mini : number;  // int
    let radius : number;
    let dx : number;
    let dy : number;
    let dz : number;
    let min : number;
    let min2 : number;
    let mint : number;
    let r2 : number;
    let t : number;
    let dx1 : number;
    let dx2 : number;
    let dy1 : number;
    let dy2 : number;
    let denom : number;
    let xa : number;
    let xb : number;
    let ya : number;
    let yb : number;

    min = min2 = mint = 1.0e20;
    mini = 0;
    j = (this.nobj-1)*6;
    for (i=0; i<this.nobj-1; i++)
      /* Only collide with planets that are turned on (use[i])!  Also,
	 don't land on the homeplanet if we are using the rocket
	 instead of the asteroid. */
      if ((!this.rocket_top.RocketMode || i != this.homeplanet) && this.use[i]) {
	k = i*6;

	dx = this.pos[j+1]-this.pos[k+1];
	dy = this.pos[j+2]-this.pos[k+2];
	dz = this.pos[j+3]-this.pos[k+3];
	// Capture is only in 2D!!
	radius = Math.sqrt(dx*dx+dy*dy);

	// Interpolate between time points to find where the closest
	// approach was
	dx1 = this.pos[j+1]-this.opos[j+1];
	dx2 = this.pos[k+1]-this.opos[k+1];
	dy1 = this.pos[j+2]-this.opos[j+2];
	dy2 = this.pos[k+2]-this.opos[k+2];
	denom = (dx1-dx2)*(dx1-dx2) + (dy1-dy2)*(dy1-dy2);
	if (denom == 0.0)
	  t = 0.0;
	else 
	  t = (this.opos[j+1]*(dx2-dx1) + this.opos[k+1]*(dx1-dx2) + 
	       this.opos[j+2]*(dy2-dy1) + this.opos[k+2]*(dy1-dy2)) / denom;
	t = (t < 0.0 ? 0.0 : (t > 1.0 ? 1.0 : t));
	
	xa = this.opos[j+1] + dx1*t;
	xb = this.opos[k+1] + dx2*t;
	ya = this.opos[j+2] + dy1*t;
	yb = this.opos[k+2] + dy2*t;
	dx = xa - xb;
	dy = ya - yb;
	r2 = Math.sqrt(dx*dx+dy*dy);
	
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
	    let s: string;
	    let a1 : number;
            let a2 : number;
            let a : number;
	    
	    this.baseDist = this.lastDist = r2;
	
	    // Calculate angle between planet and rocket in terms of
	    // motion of the planet
	    a1 = Math.atan2(dy,dx);
	    a2 = Math.atan2(yb,xb);
	    a = (((a1-a2)*180.0/Math.PI) % 360.0 + 360.0) % 360.0;
	    //	    console.log("T: "+t);
	    //	    console.log(""+a1*180.0/Math.PI+" "+a2*180.0/Math.PI+" "+a+" ("+dx/(1.0e5*this.dscale)+","+dy/(1.0e5*this.dscale)+")");
	    
	    if (r2 > 1.0e6)
	      s = "Missed by "+Math.round(r2/(1.0e8*this.dscale))*1.0e-3+" million km. ";
	    else
	      s = "Missed by "+Math.round(r2/(1.0e5*this.dscale))+" km. ";

	    if (a < 0.0 || a > 360.0)
	      s = "Error! "+a;
	    else if (a < 45.0 || a >= 315.0)
	      s += "The rocket went outside the orbit of "+this.names[i];
	    else if (a < 135.0)
	      s += "The rocket passed ahead of "+this.names[i];
	    else if (a < 215.0)
	      s += "The rocket went inside the orbit of "+this.names[i];
	    else
	      s += "The rocket passed behind "+this.names[i];
	    this.rocket_top.canvas.message = s;
	    this.rocket_top.canvas.msgcount = 0;
	  }
	}
      }

    /*
    if (min < 1.0e20) {
      console.log(this.names[mini]+": "+min/(1.496e13*this.dscale)+" AU,  "+min/(1.0e5*this.dscale)+" km ("+(this.pos[j+1]-this.pos[mini*6+1])/(1.0e5*this.dscale)+","+(this.pos[j+2]-this.pos[mini*6+2])/(1.0e5*this.dscale)+","+(this.pos[j+3]-this.pos[mini*6+3])/(1.0e5*this.dscale)+")");
      console.log("    R2: "+min2/(1.0e5*this.dscale)+" km, T: "+mint);
    } */

    if (i < this.nobj-1) {  // i.e. we did a "break" before and we are captured
      if (this.rocket_top.RocketMode) {
	let traveltime : number;
	if (i == 3) {
	  traveltime = this.pos[0]/(86400.0*this.tscale)-this.launch2-this.astDay2;
	  if (traveltime < 500.0)
	    this.rocket_top.canvas.message = "Welcome back to Earth! Trip time: "+
	      traveltime+" days";
	  else
	    this.rocket_top.canvas.message = "Welcome back to Earth! Trip time: "+
	      traveltime/365.25+" years";
	  
	} else {
	  traveltime = this.pos[0]/(86400.0*this.tscale)-this.astDay;
	  if (traveltime < 500.0)
	    this.rocket_top.canvas.message = "Welcome to "+this.names[i]+"! Trip time: "+
	      traveltime+" days";
	  else {
	    traveltime = 0.01 * Math.round(100.0*traveltime/365.25);
	    this.rocket_top.canvas.message = "Welcome to "+this.names[i]+"! Trip time: "+
	      traveltime+" years";
	  }
	}
	this.rocket_top.canvas.msgcount = 0;
	this.capture = i;
	this.launched = false;
	this.rocket_top.canvas.launched = false;
	for (k=1;k<=6;k++)
	  this.pos[j+k] = this.pos[i*6+k];
        this.launch2 = this.pos[0]/(86400.0*this.tscale);
        
        this.refreshcanvas();

        this.homeplanet = i;
        this.destplanet = 3;  // Heading back to Earth
        this.lastDist = this.baseDist = this.defaultDist;
      } else {
        this.rocket_top.canvas.message = "Asteroid collided with "+this.names[i]+"!";
        this.rocket_top.canvas.msgcount = 0;
        this.use[10] = false;  // Remove the asteroid from the simulation
      }
    }
  }

  force(t : number, r : number[], dr : number[]) : void {
    let i : number;
    let j : number;
    let k : number;
    let l : number;
    let radius : number;
    let accel : number;
    let dx : number;
    let dy : number;
    let dz : number;
    
    for (k=0;k<this.nobj;k++) {
      i=6*k;
      if (!this.use[k]) {
        dr[i+1] = dr[i+2] = dr[i+3] = dr[i+4] = dr[i+5] = dr[i+6] = 0.0;
      } else {
        dr[i+4] = dr[i+5] = dr[i+6] = 0.0;
        dr[i+1] = r[i+4];
        dr[i+2] = r[i+5];
        if (this.rocket_top.use2D)
          dr[i+3] = 0.0;
        else
          dr[i+3] = r[i+6];
        // only go to this.nobj-2 so we don't try to compute the
        // (nonexistent) gravity due to the Rocket
        for (l=0;l<this.nobj-1;l++) { 
          if (l!=k && this.use[l]) {
            // Skip gravity of the Earth (or whichever planet the
            // Rocket just launched from) on the Rocket
            if (l == this.homeplanet && k == this.nobj-1)
              continue;
            j=6*l;
            dx = r[j+1]-r[i+1];
            dy = r[j+2]-r[i+2];
            dz = r[j+3]-r[i+3];
            if (this.rocket_top.use2D)
              radius = Math.sqrt(dx*dx+dy*dy);
            else
              radius = Math.sqrt(dx*dx+dy*dy+dz*dz);
            accel = this.gmass[l]/(radius*radius*radius);
            dr[i+4] += accel*dx;
            dr[i+5] += accel*dy;
            if (!this.rocket_top.use2D)
              dr[i+6] += accel*dz;
          }
        }
      }
    }
  }

  rk(x : number, h : number) : void {
    let i : number;

    for (i=1;i<this.n;i++)
      this.aytemp[i]=this.y[i]+this.b21*h*this.dydx[i];
    this.force(x+this.a2*h,this.aytemp,this.ak2);
    for (i=1;i<this.n;i++)
      this.aytemp[i]=this.y[i]+h*(this.b31*this.dydx[i]+this.b32*this.ak2[i]);
    this.force(x+this.a3*h,this.aytemp,this.ak3);
    for (i=1;i<this.n;i++)
      this.aytemp[i]=this.y[i]+h*(this.b41*this.dydx[i]+this.b42*this.ak2[i]+this.b43*this.ak3[i]);
    this.force(x+this.a4*h,this.aytemp,this.ak4);
    for (i=1;i<this.n;i++)
      this.aytemp[i]=this.y[i]+h*(this.b51*this.dydx[i]+this.b52*this.ak2[i]+this.b53*this.ak3[i]+this.b54*this.ak4[i]);
    this.force(x+this.a5*h,this.aytemp,this.ak5);
    for (i=1;i<this.n;i++)
      this.aytemp[i]=this.y[i]+h*(this.b61*this.dydx[i]+this.b62*this.ak2[i]+this.b63*this.ak3[i]+this.b64*this.ak4[i]+this.b65*this.ak5[i]);
    this.force(x+this.a6*h,this.aytemp,this.ak6);
    for (i=1;i<this.n;i++)
      this.ytemp[i]=this.y[i]+h*(this.c1*this.dydx[i]+this.c3*this.ak3[i]+this.c4*this.ak4[i]+this.c6*this.ak6[i]);
    for (i=1;i<this.n;i++)
      this.yerr[i]=h*(this.dc1*this.dydx[i]+this.dc3*this.ak3[i]+this.dc4*this.ak4[i]+this.dc5*this.ak5[i]+this.dc6*this.ak6[i]);
  }
  
  rkqs(hv : number[], htry : number, eps : number) : void {
    let i : number;
    let errmax : number;
    let h : number;
    let maxarg : number;

    h=htry;
    for (;;) {
      this.rk(hv[0],h);
      errmax=0.0;
      for (i=1;i<this.n;i++) {
        maxarg = Math.abs(this.yerr[i]/this.yscal[i]);
        errmax = (errmax > maxarg ? errmax : maxarg);
      }
      errmax /= eps;
      if (errmax > 1.0) {
        h=0.9*h*Math.pow(errmax,-0.25);
        if (h < 0.1*h)
          h *= 0.1;
        this.xnew=hv[0]+h;
        if (this.xnew == hv[0])
          console.log("stepsize underflow in rkqs");
        continue;
      } else {
        if (errmax > 1.89e-4)
          hv[2]=0.9*h*Math.pow(errmax,-0.2);
        else 
          hv[2]=5.0*h;
        hv[0] += (hv[1]=h);
        for (i=1;i<this.n;i++)
          this.y[i]=this.ytemp[i];
        break;
      }
    }
  }
  


  mmid(hv : number[], htot : number, nstep : number) : void {
    let nx : number; // int
    let i : number;
    let x : number;
    let swap : number;
    let h2 : number;
    let h : number;

    h=htot/nstep;
    for (i=1;i<this.n;i++) {
      this.ym[i]=this.y[i];
      this.yn[i]=this.y[i]+h*this.dydx[i];
    }
    //    console.log(h+" "+htot+" "+nstep);
    x=hv[0]+h;
    this.force(x,this.yn,this.yseq);
    //    for (i=1;i<this.n;i++)
    //      console.log(this.y[i]+" "+this.yseq[i]+" "+this.yn[i]+" "+this.ym[i]);
    h2=2.0*h;
    for (nx=2;nx<=nstep;nx++) {
      for (i=1;i<this.n;i++) {
        swap=this.ym[i]+h2*this.yseq[i];
        this.ym[i]=this.yn[i];
        this.yn[i]=swap;
      }
      x += h;
      this.force(x,this.yn,this.yseq);
    }
    for (i=1;i<this.n;i++)
      this.yseq[i]=0.5*(this.ym[i]+this.yn[i]+h*this.yseq[i]);
  }

  pzextr(iest : number, xest : number) : void {
    let k1 : number; // int
    let j : number; // int
    let q : number;
    let f2 : number;
    let f1 : number;
    let delta : number;

    this.xv[iest]=xest;
    for (j=1;j<this.n;j++)
      this.yerr[j]=this.y[j]=this.yseq[j];
    if (iest == 1) {
      for (j=1;j<this.n;j++)
        this.dv[j][1]=this.yseq[j];
    } else {
      for (j=1;j<this.n;j++)
        this.cv[j]=this.yseq[j];
      for (k1=1;k1<iest;k1++) {
        delta=1.0/(this.xv[iest-k1]-xest);
        f1=xest*delta;
        f2=this.xv[iest-k1]*delta;
        for (j=1;j<this.n;j++) {
          q=this.dv[j][k1];
          this.dv[j][k1]=this.yerr[j];
          delta=this.cv[j]-q;
          this.yerr[j]=f1*delta;
          this.cv[j]=f2*delta;
          this.y[j] += this.yerr[j];
        }
      }
      for (j=1;j<this.n;j++)
        this.dv[j][iest]=this.yerr[j];
    }
  }

  bsstep(hv : number[], htry : number, eps : number) : void {
    
    let i : number;
    let iq : number;
    let k : number;
    let kk : number;
    let km : number = 1;

    let eps1 : number;
    let errmax : number = this.tiny;
    let fact : number;
    let hh : number;
    let red : number=1.0;
    let scale : number=1.0;
    let work : number;
    let wrkmin : number;
    let xest : number;
    let reduct : boolean;
    let exitflag : boolean =false;
    
    if (eps != this.epsold) {
      hv[2] = this.xnew = -1.0e29;
      eps1=this.safe1*eps;
      this.av[1]=this.nseq[1]+1.0;
      for (k=1;k<=this.kmaxx;k++)
        this.av[k+1]=this.av[k]+this.nseq[k+1];
      for (iq=2;iq<=this.kmaxx;iq++) {
        for (k=1;k<iq;k++)
          this.alf[k][iq]=Math.pow(eps1,(this.av[k+1]-this.av[iq+1])/
                              ((this.av[iq+1]-this.av[1]+1.0)*(2*k+1)));
      }
      this.epsold=eps;
      for (this.kopt=2;this.kopt<this.kmaxx;this.kopt++)
       if (this.av[this.kopt+1] > this.av[this.kopt]*this.alf[this.kopt-1][this.kopt])
         break;
      this.kmax=this.kopt;
    }
    //        console.log(this.kmax);
    hh=htry;
    for (i=1;i<this.n;i++)
      this.ysav[i]=this.y[i];
    if (hv[0] != this.xnew || hh != hv[2]) {
      this.first=true;
      this.kopt=this.kmax;
    }
    reduct=false;
    for (;;) {
      for (k=1;k<=this.kmax;k++) {
        this.xnew=hv[0]+hh;
        //                console.log(xnew);
        if (this.xnew == hv[0])
                console.log("step size underflow in bsstep");
        this.mmid(hv,hh,this.nseq[k]);
        xest=(hh/this.nseq[k]);
        xest = xest*xest;
        this.pzextr(k,xest);
        if (k != 1) {
          errmax=this.tiny;
          for (i=1;i<this.n;i++) {
            // Don't allow the Z component to enter into the error analysis since this is mostly a 2D solution...
            if (i % 3 != 0 && i > 3) {
              //              console.log(i+" "+Math.abs(this.yerr[i]/this.yscal[i])+" "+this.yerr[i]+" "+this.yscal[i]+" "+this.yseq[i]);
              errmax=(errmax>Math.abs(this.yerr[i]/this.yscal[i]) ? errmax : Math.abs(this.yerr[i]/this.yscal[i]));
            }
          }
          //          console.log("  "+errmax);
          errmax /= eps;
          km=k-1;
          this.err[km]=Math.pow(errmax/this.safe1,1.0/(2*km+1));
        }
        if (k != 1 && (k >= this.kopt-1 || this.first)) {
          if (errmax < 1.0) {
            exitflag=true;
            break;
          }
          if (k == this.kmax || k == this.kopt+1) {
            red=this.safe2/this.err[km];
            break;
          } else if (k == this.kopt && this.alf[this.kopt-1][this.kopt] < this.err[km]) {
            red=1.0/this.err[km];
            break;
          } else if (this.kopt == this.kmax && this.alf[km][this.kmax-1] < this.err[km]) {
            red=this.alf[km][this.kmax-1]*this.safe2/this.err[km];
            break;
          } else if (this.alf[km][this.kopt] < this.err[km]) {
            red=this.alf[km][this.kopt-1]/this.err[km];
            break;
          }
        }
      }
      if (exitflag) 
        break;
      red=(red<this.redmin ? red:this.redmin);
      red=(red>this.redmax ? red:this.redmax);
      hh *= red;
      //            console.log(red);
      reduct=true;
    }
    hv[0]=this.xnew;
    hv[1]=hh;
    this.first=false;
    wrkmin=1.0e35;
    for (kk=1;kk<=km;kk++) {
      fact=(this.err[kk] > this.scalmx ? this.err[kk] : this.scalmx);
      work=fact*this.av[kk+1];
      if (work < wrkmin) {
        scale=fact;
        wrkmin=work;
        this.kopt=kk+1;
      }
    }
    hv[2]=hh/scale;
    if (this.kopt >= k && this.kopt != this.kmax && !reduct) {
      fact=(scale/this.alf[this.kopt-1][this.kopt]>this.scalmx ? scale/this.alf[this.kopt-1][this.kopt]:this.scalmx);
      if (this.av[this.kopt+1]*fact <= wrkmin) {
        hv[2]=hh/fact;
        this.kopt++;
      }
    }
  }
  
  odeint(ystart : number[], x1 : number, x2 : number, 
                      eps : number, h1 : number, hmin : number) : void {
    let nstp : number;
    let i : number;
    let j : number;
    let good : number;
    let bad : number;

    let xsav : number;
    let h : number;
    let scal : number;

    good = bad = 0;
    this.hv[0]=x1;
    h=(x2>x1 ? Math.abs(h1) : -Math.abs(h1));
    //    this.hv[1]=this.hv[2]=h;  // Not necessary, but it gets rid of the javac error message
    for (i=1;i<this.n;i++)
      this.y[i]=ystart[i];
    for (nstp=0;nstp<1000;nstp++) {
      //      console.log("Step "+nstp+" Good "+good+" Bad "+bad+" Time "+this.hv[0]);
      this.force(this.hv[0],this.y,this.dydx);
      for (i=1;i<this.n;i++) {
        //        this.yscal[i]=Math.abs(this.y[i])+Math.abs(this.dydx[i]*h)+1.0e30;
        this.yscal[i]=Math.abs(this.y[i])+Math.abs(this.dydx[i]*h)+1.0e-30;
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
        
      if ((this.hv[0]+h-x2)*(this.hv[0]+h-x1) > 0.0)
        h=x2-this.hv[0];
      if (this.rocket_top.useBSstep) {
        this.bsstep(this.hv,h,eps);
      } else {
        this.rkqs(this.hv,h,eps);
      }
      if (this.hv[1] == h)
        good++;
      else 
        bad++;
      if ((this.hv[0]-x2)*(x2-x1) >= 0.0) {
        for (i=1;i<this.n;i++)
          ystart[i]=this.y[i];
        return;
      }
      if (Math.abs(this.hv[2]) <= hmin)
        console.log("Step size too small in odeint");
      h=this.hv[2];
    }
    console.log("Too many steps in routine odeint");
  }

  queueReset() : void {
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

  run() : void {
    let tweak : number;
    let i : number;

    while (true) {
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
        for (i=0; i<=this.nobj*6; i++)
          this.opos[i] = this.pos[i];
        if (this.rocket_top.RocketMode) {
          tweak = (this.homeplanet == 3 ? this.astDay : this.astDay2+this.launch2) * 
            86400.0*this.tscale - this.pos[0];
          if (!this.launched && tweak*(tweak-this.tstep) < 0.0) {
            this.odeint(this.pos, this.pos[0], this.pos[0]+tweak, 1.0e-6, tweak/10.0, this.tstep*1.0e-15);
            this.pos[0] += tweak;
            this.checkLaunch();
            this.odeint(this.pos, this.pos[0], this.pos[0]+this.tstep-tweak, 1.0e-6, (this.tstep-tweak)/10.0, 
                   this.tstep*1.0e-15);
            this.pos[0] += this.tstep-tweak;
          } else {
            this.odeint(this.pos, this.pos[0], this.pos[0]+this.tstep, 1.0e-6, this.tstep/1.0, this.tstep*1.0e-15);
            this.pos[0] += this.tstep;
          }
        } else {
          this.odeint(this.pos, this.pos[0], this.pos[0]+this.tstep, 1.0e-6, this.tstep/1.0, this.tstep*1.0e-15);
          this.pos[0] += this.tstep;
        }        
        this.checkRocket();
        this.refresh();
        //yield();
      } else {
        //suspend();
      }
    }
  }

  refresh() : void {
    this.rocket_top.deliverEvent(new JEvent(this, JEvent.ACTION_EVENT, this));
  }

  refreshcanvas() : void {
    this.rocket_top.deliverEvent(new JEvent(this, JEvent.ACTION_EVENT, this.rocket_top.canvas));
  }
}

let r = new Rocket();