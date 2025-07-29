/* -----------------------  JDK 1.0.x version --------------------------- */

/*
  Notes
  -----

To choose between the "Rocket" and "Asteroid" modes of this program,
change the HTML applet "mode" tag.  That is, use:

<applet code="Rocket.class" width=... height=...>
<param name="mode" value="Rocket">
</applet>

or

<applet code="Rocket.class" width=... height=...>
<param name="mode" value="Asteroid">
</applet>



GENERAL NOTES

The amount of time that messages stay on the top of the screen is
determined by the variable "msgkeeptime."  The units are time steps,
so this counter decrements each time we redraw the screen.

The default start date corresponds to Jan 1, 1996 (see Astronomical
Almanac 1996, p. E3 for data)



ROCKET NOTES

Capture radius (if "Capture Physics" is turned on) is in the variable
"captureradius" and is currently 3e6 km.

Play God:  These are the ad hoc tweaks we made to make the program fit the lab
 - Use the JD 2450320.5 position for Venus instead of 2450120.5 so
   that we can do a gravity assist.
 - Rotate Uranus 90 degrees so it is in position for a Rocket gravity
   assist from Jupiter

*/

/* Notes: Java 1.0.x versus Java 1.1.x
   This applet is currently set up for Java 1.0.x
   To switch it to 1.1.x compliance, do the following:
    - Change definition of "public class Rocket" (comment,uncomment)
    - Change definitions of ItemStateChanged() and ActionPerformed() (comment,uncomment)
    - Change event.getActionCommand() to event.arg (comment,uncomment)
    - Comment out return values for ItemStateChanged() and ActionPerformed()
    - Comment out whole handleEvent() function
    - Uncomment addItemListener() and addActionListener() statements in init()
    - Uncomment ActionEvent dispatches in refresh() and refreshcanvas()
    - Change all "size()" to "getSize()"
    - Change all "appendText()" to "append()"
*/

import java.awt.*;
import java.applet.*;
import java.lang.*;

public class Rocket extends Applet {
/* 
public class Rocket extends Applet implements ActionListener,ItemListener {
*/

// Double buffering Objects
  public Image buf, buf2;                 // bitmap for double buffering
  public Graphics gBuf, gBuf2;             // gc to draw on bitmap
  public int width, height;

// GUI objects -- Should be private unless absolutely necessary
  private Font font;
  private Button resetbutton, optbutton, optbutton2, helpbutton, helpbutton2;
  public Button runbutton;
  private Button timeUp, timeDown, zoomIn, zoomOut;
  public RocketCanvas canvas;
  private Panel center, options, help;
  private CardLayout card;
  private RocketThread intThread;
  private Label time, timestep, zoom;
  private Choice centermenu, destmenu;
  private TextField astDistText, astTanVelText, astRadVelText;
  private TextField astVelText, astDayText, astAngText;
  private TextField astVelText2, astDayText2, astAngText2;
  private Checkbox trailsCheckbox, BSCheckbox, twoDCheckbox, captureCheckbox;
  private Checkbox useCheckbox[];
  private TextArea HelpText;
  private boolean startHandler = false;

// General variables
  public boolean usecapture;
  public boolean use2D;
  public boolean useBSstep;
  public boolean drawtrails;
  public boolean astinput;
  public boolean running;
  public boolean threadstarted;

  private boolean ready;

  public boolean RocketMode, AsteroidMode;

  public void init() {
    int i;
    Panel panel, bottom, current;

    //    startHandler = false;

    Dimension d = size();

    width = d.width;
    height = d.height;

    getParams();

    buf = createImage(width, height);
    gBuf = buf.getGraphics();
    buf2 = createImage(width, height);
    gBuf2 = buf2.getGraphics();

    gBuf.setFont(font = new Font("Helvetica", Font.PLAIN, 10));
    gBuf2.setColor(Color.black);
    gBuf2.fillRect(0, 0, width, height);

    if (RocketMode) {
      usecapture = true;
      use2D = true;
    } else {
      usecapture = false;
      use2D = false;
    }
    useBSstep = false;
    drawtrails = true;
    astinput = false;
    running = false;
    threadstarted = false;

    ready = true;

    intThread = new RocketThread(this);
    intThread.setPriority(Thread.MIN_PRIORITY);
    
    setBackground(Color.lightGray);
    setFont(font = new Font("Helvetica", Font.PLAIN, 12));
    setLayout(card = new CardLayout());
    add("Plot", center = new Panel());
    add("Options", options = new Panel());
    add("Help", help = new Panel());

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
    bottom.add(helpbutton = new Button("Help"));
    // helpbutton.addActionListener(this);
    bottom.add(new Label("Center on:"));

    centermenu = new Choice();
    for (i=0; i<intThread.nobj; i++) {
      if (intThread.use[i])
	centermenu.addItem(intThread.names[i]);
      centermenu.select(0);
    }
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

    //    current.add(new Label(""));
    //    current.add(BSCheckbox = new Checkbox("Use BSstep algorithm?"));
    //    BSCheckbox.setState(useBSstep);
    // //   BSCheckbox.addItemlistener(this);

    current.add(new Label(""));
    current.add(panel = new Panel());
    panel.setLayout(new GridLayout(1,4));
    panel.add(twoDCheckbox = new Checkbox("Use 2D physics?"));
    twoDCheckbox.setState(use2D);
    // twoDCheckbox.addItemlistener(this);
    panel.add(captureCheckbox = new Checkbox("Use capture physics?"));
    captureCheckbox.setState(usecapture);
    // captureCheckbox.addItemlistener(this);

    help.setLayout(new BorderLayout());

    help.add("South", panel = new Panel());
    panel.setLayout(new FlowLayout(FlowLayout.CENTER, 5, 5));
    panel.add(helpbutton2 = new Button("Return to main screen"));
    // helpbutton2.addActionListener(this);

    help.add("Center", current = new Panel());
    //    current.setLayout(new FlowLayout(FlowLayout.CENTER, 0, 0));
    current.setLayout(new BorderLayout());
    current.add("Center", HelpText = new TextArea());
    HelpText.setEditable(false);
    HelpText.appendText("Help for Rocket/Asteroid Applet -- Chris Dolan, UWisc Astronomy, 1998\n");
    HelpText.appendText("\n");
    HelpText.appendText("You can use this program to watch a realistic animation of our solar system.\n");
    HelpText.appendText("Click the \"Run\" button to start or stop the simulation\n");
    HelpText.appendText("Click the \"Restart\" button put the planets back where they started.\n");
    HelpText.appendText("Click the \"Options\" button to change the orbit of the Rocket or Asteroid.\n");
    HelpText.appendText("You can increase or decrease the speed of the animation by changing the time step.\n");
    HelpText.appendText("You can zoom in or zoom out to see different views of the solar system.\n");
    HelpText.appendText("By default, you are looking down at the solar system centered on the Sun, but\n");
    HelpText.appendText("    you can change which body to center on with the pull-down menu.\n");
    HelpText.appendText("If you click \"Draw Trails\" the planets will leave dots along their paths so\n");
    HelpText.appendText("    you can trace the orbits.\n");
    HelpText.appendText("\n");
    HelpText.appendText("--- Options Page ---\n");
    if (RocketMode) {
      HelpText.appendText("On the Options screen, you can adjust when the Rocket blasts off from the Earth\n");
      HelpText.appendText("    as well as how fast and in which direction it goes.  For the sake of\n");
      HelpText.appendText("    simplicity, the launch velocity is a simple speed relative to the Earth,\n");
      HelpText.appendText("    ignoring the complication of the Earth's gravity.\n");
      HelpText.appendText("If you turn on \"Capture Physics\" at the bottom of the page, then if the Rocket\n");
      HelpText.appendText("    gets within 3 million km of a planet, it will land.\n");
      HelpText.appendText("If the Rocket successfully lands on another planet, it will wait a certain amount\n");
      HelpText.appendText("    of time (specified on the Options screen) and then take off again to try to\n");
      HelpText.appendText("    get back to Earth, based on the direction and velocity you enter.\n");
      HelpText.appendText("The \"Destination\" is used to tell the program where you are trying to send the\n");
      HelpText.appendText("    Rocket.  You can actually land on any planet even if it is not your stated\n");
      HelpText.appendText("    destination, but the program will only report by how much you missed a planet\n");
      HelpText.appendText("    if it is your destination.\n");
      HelpText.appendText("The default scenario is that the Rocket and the planets all move in a\n");
      HelpText.appendText("    two-dimensional plane (ignoring distance in and out of the screen) for\n");
      HelpText.appendText("    simplicity.  If you turn off \"Use 2D physics\" then the full-blown 3D\n");
      HelpText.appendText("    motions of the planets will be used.  In this case, the screen is in the\n");
      HelpText.appendText("    plane of the Earth's orbit.  In 3D physics it is nearly impossible to\n");
      HelpText.appendText("    simulate a gravity assist off another planet, since there is no way to\n");
      HelpText.appendText("    specify the Rocket's inclination from the Ecliptic plane.\n");
    }
    if (AsteroidMode) {
      HelpText.appendText("On the Options screen, you can enter parameters to specify where the asteroid is\n");
      HelpText.appendText("    when you first look at it.  You specify\n");
      HelpText.appendText("    (1) how far it is from the Earth, which you can deduce via parallax measurements;\n");
      HelpText.appendText("    (2) what's the angle from the Sun, which you can deduce from the coordinates of\n");
      HelpText.appendText("        the asteroid and the time of the observations;\n");
      HelpText.appendText("    (3) the tangential velocity of the asteroid, which you can deduce from the proper\n");
      HelpText.appendText("        motion of the asteroid, along with its distance from the Earth;\n");
      HelpText.appendText("    (4) the radial velocity of the asteroid, which you can measure by observing a\n");
      HelpText.appendText("        spectrum of the asteroid.\n");
      HelpText.appendText("If you turn on \"Capture Physics\" at the bottom of the page, then if the Asteroid\n");
      HelpText.appendText("    gets within 400,000 km of a planet, it will collide.  Of course, in reality it\n");
      HelpText.appendText("    has to get much closer than this, but we thought we'd make this a little more\n");
      HelpText.appendText("    interesting.\n");
      HelpText.appendText("The default scenario is that the Asteroid and the planets all move in 3D space.  If\n");
      HelpText.appendText("    you turn on \"2D physics\" then the program ignores the motions and distance in\n");
      HelpText.appendText("    and out of the screen.  This makes it much more likely that you will see collisions\n");
      HelpText.appendText("    or gravity slingshots in the motion of the asteroid.  In 3D space, these encounters\n");
      HelpText.appendText("    are extremely rare, since the orbital plane of the Asteroid is inclined to the\n");
      HelpText.appendText("    orbits of all the planets except the Earth.\n");
    }
    HelpText.appendText("\n");
    HelpText.appendText("\n");
    HelpText.appendText("--- About this program ---\n");
    HelpText.appendText("This Java program is a realistic simulation of the major bodies in our solar system.\n");
    HelpText.appendText("It uses only Newton's Law of gravity (F=GMm/r^2) to simulate the motions of the\n");
    HelpText.appendText("    planets.\n");
    HelpText.appendText("The technique to translate forces into an animation is called an \"N Body Algorithm\"\n");
    HelpText.appendText("    where in this case, N=11 (the Sun, nine planets and a Rocket or Asteroid).\n");
    HelpText.appendText("Specifically, it is an adaptive step-size, Runga-Kutta integrator algorithm\n");
    HelpText.appendText("Even the Sun moves due to the tug of the planets, but its motion is very small\n");
    HelpText.appendText("    since its mass is so large.\n");
    HelpText.appendText("\n");
    HelpText.appendText("As implied above, this program is multi-purpose.  Depending on the initial\n");
    HelpText.appendText("    parameters, this acts as either a Rocket simulator for the Astro 114 Astronautics\n");
    HelpText.appendText("    lab or as an Asteroid simulator for the Astro 114 Doomsday Asteroid lab.  The key\n");
    HelpText.appendText("    difference is the way the Options page behaves.\n");
    HelpText.appendText("To switch between the two modes, choose one of the methods below to start the\n");
    HelpText.appendText("    applet (see \"Page Source\" from the Netscape View menu to see which one is\n");
    HelpText.appendText("    used for this invokation of the applet.\n");
    HelpText.appendText("\n");
    HelpText.appendText("<applet code=\"Rocket.class\" width=... height=...>\n");
    HelpText.appendText("<param name=\"mode\" value=\"Rocket\">\n");
    HelpText.appendText("</applet>\n");
    HelpText.appendText("\n");
    HelpText.appendText("or\n");
    HelpText.appendText("\n");
    HelpText.appendText("<applet code=\"Rocket.class\" width=... height=...>\n");
    HelpText.appendText("<param name=\"mode\" value=\"Asteroid\">\n");
    HelpText.appendText("</applet>\n");
    HelpText.appendText("\n");

    startHandler = true;
  }

  public void getParams() {
    RocketMode = false;
    AsteroidMode = false;

    if (getParameter("mode") == null) {
      RocketMode = true;
    } else {
      if (getParameter("mode").equals("Rocket")) {
	RocketMode = true;
      } else if (getParameter("mode").equals("Asteroid")) {
	AsteroidMode = true;
      } else {
	RocketMode = true;
      }
    }
  }

  public void destroy() {
    gBuf.dispose();
  }

  private void setTime() {
    time.setText(Double.toString(intThread.pos[0]/(intThread.tscale*86400.0))+"      ");
  }

  private void setTimeStep() {
    if (intThread.timeTweak == 0.0)
      timestep.setText(Double.toString(intThread.tstep/(intThread.tscale*86400.0))+"     ");
    else
      timestep.setText(Double.toString(intThread.tstep*intThread.timeTweak/(intThread.tscale*86400.0))+"      ");
  }

  /*
  public void itemStateChanged(ItemEvent event) {
    Object target = event.getItem();
  */
  public boolean itemStateChanged(Event event) {
    Object target = event.target;

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
    return true;
  }

  /*
  public void actionPerformed(ActionEvent event) {
    Object target = event.getSource();
  */
  public boolean actionPerformed(Event event) {
    Object target = event.target;

    if (target == intThread) {
      /*
      if (event.getActionCommand().equals("canvas")) {
      */
      if (event.arg == canvas) {
	canvas.capture(intThread.capture);
      } else {
	setUnready();
	setTime();
	canvas.update(canvas.getGraphics());
      }
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
      zoom.setText(Double.toString(Math.floor(100000.0*canvas.zoom)/100000.0)+"     ");
    } else if (target == zoomOut) {
      canvas.ZoomIn(false);
      zoom.setText(Double.toString(Math.floor(100000.0*canvas.zoom)/100000.0)+"     ");
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
    } else {
      return false;
    }
    return true;
  }

  public synchronized boolean handleEvent(Event event) {
    if (!startHandler) {
      return super.handleEvent(event);
    }

    if (event.id == Event.ACTION_EVENT) {
      if (itemStateChanged(event) || actionPerformed(event))
	return true;
      else
	return super.handleEvent(event);
    } else
      return super.handleEvent(event);
  }

  public synchronized boolean isReady() {
    return ready;
  }

  public synchronized void setReady() {
    ready = true;
  }

  public synchronized void setUnready() {
    ready = false;
  }
}

class RocketCanvas extends Canvas {

  private Dimension d;
  private int xmid, ymid;
  private double scale;
  public double zoom;
  private Rocket top;
  private RocketThread thread;
  private int centerOn;
  private boolean useDoubleBuffer, useTrailBuffer;
  private int trails[][][], trailstart, trailstop, trailmax;
  private Color trailColor[];
  public boolean launched;
  public String message;
  public int msgcount;
  private int msgkeeptime;

  public RocketCanvas(Rocket parent, RocketThread intThread) {
    int i;

    top = parent;
    thread = intThread;

    useDoubleBuffer = true;
    useTrailBuffer = true;

    launched = false;

    message = "";
    msgcount = 0;
    msgkeeptime = 300;  // - This was too short for Windows java SLJ 12-Nov-09
   // msgkeeptime = 2000; - This works on Windows but make everthing else too slow SLJ 12-Nov-09

    scale = 1.0/(4.0*1.496e13*thread.dscale);
    zoom = 1.0;

    setFont(new Font("Helvetica", Font.PLAIN, 10));

    centerOn = 0;  // Track the Sun

    setBackground(Color.black);
    setForeground(Color.white);

    trailstart = trailstop = 0;
    trailmax = 1000;
    trails = new int[thread.nobj][trailmax][2];
    trailColor = new Color[thread.nobj];

    for (i=0; i<thread.nobj; i++)
      trailColor[i] = Color.red;
    trailColor[10] = Color.cyan;

    if (useTrailBuffer)
      clearTrails();
  }

  public void ZoomIn(boolean in) {
    double amt = 1.5;
    scale /= zoom;
    if (in)
      zoom *= 1.5;
    else
      zoom /= amt;
    scale *= zoom;
    update(getGraphics());
    if (useTrailBuffer)
      clearTrails();
  }

  public void setCenter(int c) {
    centerOn = c;
    update(getGraphics());
    if (useTrailBuffer)
      clearTrails();
  }

  public void clearTrails() {
    if (useTrailBuffer) {
      d = size();
      top.gBuf2.setColor(Color.black);
      top.gBuf2.fillRect(0, 0, d.width, d.height);
    } else {
      trailstart = trailstop = 0;
    }
  }

  private void drawCenteredString(Graphics g, String s, int x, int y) {

    FontMetrics f = g.getFontMetrics(g.getFont());

    g.drawString(s, x - f.stringWidth(s)/2, y + f.getHeight()/2);
  }

  protected void paintScale(Graphics g) {
    double l;
    int ll;

    l = 1.0/(scale*thread.dscale*5*1.496e13);
    l = Math.pow(10.0, Math.round(Math.log(l)/Math.log(10.0)));
    ll = (int)(0.5*l*thread.dscale*scale*1.496e13*(double)d.width);
    g.setColor(Color.white);
    g.drawLine(xmid-ll, d.height-8, xmid+ll, d.height-8);
    drawCenteredString(g, ""+l+" AU", xmid, d.height-17);   
  }

  protected void paintSky(Graphics g) {
    int i,j;
    int size = 3;
    int x,y,z;

    d = size();
    xmid = d.width/2;
    ymid = d.height/2;

    if (useTrailBuffer) {
      if (top.drawtrails) {
        g.drawImage(top.buf2, 0, 0, this);
      } else {
	g.setColor(Color.black);
	g.fillRect(0, 0, d.width, d.height);
      }
    } else {
      g.setColor(Color.black);
      g.fillRect(0, 0, d.width, d.height);

      if (top.drawtrails) {
	for (i=0; i<thread.nobj; i++) {
	  g.setColor(trailColor[i]);
	  if (thread.use[i]) {
	    if (trailstart <= trailstop) {
	      for (j=trailstart; j<trailstop; j++)
		g.fillOval(trails[i][j][0], trails[i][j][1], 2, 2);
	    } else {
	      for (j=trailstart; j<trailmax; j++)
		g.fillOval(trails[i][j][0], trails[i][j][1], 2, 2);
	      for (j=0; j<trailstop; j++)
		g.fillOval(trails[i][j][0], trails[i][j][1], 2, 2);
	    }
	  }
	}
      }
    }

    g.setColor(Color.white);
    for (i=0; i<thread.nobj; i++) {
      if (thread.use[i] && (launched || i != thread.nobj-1 || !top.RocketMode)) {
	x = xmid + (int)((double)d.width*scale*(thread.pos[i*6+1]-thread.pos[centerOn*6+1]));
	y = ymid - (int)((double)d.height*scale*(thread.pos[i*6+2]-thread.pos[centerOn*6+2]));
	// z = (int)((double)d.height*scale*(thread.pos[i*6+3]-thread.pos[centerOn*6+3])*0.2);
	z = (int)((double)d.height*scale*thread.pos[i*6+3]*0.2);
	/*
	g.setColor(Color.red);
	g.drawLine(x + size,y + size,x-z + size,y+z + size);
	*/
	g.setColor(Color.white);
       	g.fillOval(x - size, y - size, size*2, size*2);
	drawCenteredString(g, thread.names[i], x, y+7);

	if (top.drawtrails) {
	  if (useTrailBuffer) {
	    top.gBuf2.setColor(trailColor[i]);
	    top.gBuf2.fillOval(x-1, y-1, 2, 2);
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
      }
    }
    if (top.drawtrails && useTrailBuffer && !launched && thread.launched) {
      i = thread.nobj-1;
      x = xmid + (int)((double)d.width*scale*(thread.pos[i*6+1]-thread.pos[centerOn*6+1]));
      y = ymid - (int)((double)d.height*scale*(thread.pos[i*6+2]-thread.pos[centerOn*6+2]));
      z = (int)((double)d.height*scale*thread.pos[i*6+3]*0.2);
      top.gBuf2.setColor(Color.green);
      top.gBuf2.drawLine(x, y, x, y-6);
      drawCenteredString(top.gBuf2, "launched", x, y-15);
      launched = true;
    }
    paintScale(g);
    if (message != "") {
      g.setColor(Color.yellow);
      drawCenteredString(g, message, xmid, 10);
      if (++msgcount == msgkeeptime) {
	message = "";
	msgcount = 0;
      }
    }
  }

  public void paint(Graphics g) {
    if (useDoubleBuffer) {
      paintSky(top.gBuf);
      g.drawImage(top.buf, 0, 0, this);
    } else {
      paintSky(g);
    }
    top.setReady();
  }

  public void update(Graphics g) {
    // override this because the default implementation always
    // calls clearRect first, causing unwanted flicker
    paint(g);
  }

  protected void paintCapture(Graphics g, int n) {
    FontMetrics f = g.getFontMetrics(g.getFont());
    int w,h;
    String s;

    d = size();
    xmid = d.width/2;
    ymid = d.height/2;
    
    s = "Rocket has arrived at "+thread.names[n];
    w = f.stringWidth(s);
    h = f.getHeight();

    g.setColor(Color.black);
    g.fillRect(xmid-w/2-15, ymid-h/2-15, w+30, h+30);
    
    g.setColor(Color.yellow);
    g.drawString(s, xmid - w/2, ymid + h/2);
  }

  public void capture(int n) {
    int i, x,y,z;

    if (top.drawtrails && useTrailBuffer) {
      i = thread.nobj-1;
      x = xmid + (int)((double)d.width*scale*(thread.pos[i*6+1]-thread.pos[centerOn*6+1]));
      y = ymid - (int)((double)d.height*scale*(thread.pos[i*6+2]-thread.pos[centerOn*6+2]));
      z = (int)((double)d.height*scale*thread.pos[i*6+3]*0.2);
      top.gBuf2.setColor(Color.green);
      top.gBuf2.drawLine(x, y, x, y-6);
      drawCenteredString(top.gBuf2, "arrived", x, y-15);
      launched = false;
    }
  }
}

class RocketThread extends Thread {

  private Rocket top;

  private double yscal[],y[],dydx[],yerr[],ytemp[];
  private double ak2[],ak3[],ak4[],ak5[],ak6[],aytemp[];
  private double hv[];
    
  private double a2=0.2,a3=0.3,a4=0.6,a5=1.0,a6=0.875,b21=0.2,
    b31=3.0/40.0,b32=9.0/40.0,b41=0.3,b42 = -0.9,b43=1.2,
    b51 = -11.0/54.0, b52=2.5,b53 = -70.0/27.0,b54=35.0/27.0,
    b61=1631.0/55296.0,b62=175.0/512.0,b63=575.0/13824.0,
    b64=44275.0/110592.0,b65=253.0/4096.0,c1=37.0/378.0,
    c3=250.0/621.0,c4=125.0/594.0,c6=512.0/1771.0,
    dc5 = -277.0/14336.0;
  private double dc1=c1-2825.0/27648.0,dc3=c3-18575.0/48384.0,
    dc4=c4-13525.0/55296.0,dc6=c6-0.25;
  
  private double safe1=0.25, safe2=0.7, redmax=1.0e-5, redmin=0.7,
    tiny=1.0e-30, scalmx=0.1;
  private boolean first=true;
  private int kmax, kopt;
  private double epsold = -1.0, xnew;
  private int kmaxx, imaxx;
  private double ysav[], yseq[], ym[], yn[], cv[], dv[][], xv[], err[], av[], alf[][];
  private int nseq[] = {0,2,4,6,8,10,12,14,16,18,0};

  public double astDist, astTanVel, astRadVel;
  public double astAng, astVel, astDay;
  public double astAng2, astVel2, astDay2;
  public double tstep;
  public double timeTweak;
  public boolean use[];
  public double pos[], opos[];
  public int nobj;
  public String names[] = {"Sun", "Mercury", "Venus", "Earth", "Mars", 
			   "Jupiter", "Saturn", "Uranus", "Neptune", 
			   "Pluto", "Rocket"};

  public double dscale, tscale, mscale;
  private double G;
  private double gmass[];
  private int n, nall;
  private boolean resetQueued;
  public boolean running;

  public double captureradius;
  private double lastDist, baseDist, defaultDist;

  public boolean launched, launched2;
  public int capture;
  public int homeplanet, destplanet, realdestplanet;
  private double launch2;
  private double vfuel;

  private double start[] = { 2450120.5,    // JD
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
	     -0.7275681,  0.6107332,  0.2647897, -0.01189440,  -0.01170492,  -0.00507485};  // Rocket
    
//	     -0.1108571,  0.6454034,  0.2973650, -0.02005303,  -0.00340512,  -0.00026263,   // Venus, 24409920.5
//            0.6827481,  0.2361149,  0.0630089, -0.00681826,   0.01715097,   0.00814731,   // Venus 2450320.5
//	     13.01258,  -13.68721,   -6.17881,    0.002944503,  0.002214815,  0.000928295,  // Uranus, 2451040.5

  public RocketThread(Rocket parent) {
    super();

    int i;
    double tweak;

    top = parent;

    if (top.RocketMode) {
      // Tweak Venus: use coords for JD 2450320.5
      start[2*6+1] = 0.6827481;
      start[2*6+2] = 0.2361149;
      start[2*6+3] = 0.0630089;
      start[2*6+4] = -0.00681826;
      start[2*6+5] = 0.01715097;
      start[2*6+6] = 0.00814731;
    }
    if (top.AsteroidMode) {
      names[10] = "Asteroid";
    }

    vfuel = 2.5; // km/s -- exhaust velocity of fuel

    dscale = 1.0e-5;
    tscale = 1.0/86400.0;
    mscale = 1.0e-3;

    // tstep = 7.0*86400.0*tscale;  // 1 week
    // tstep = 84600.0*tscale;      // 1 day
    // tstep = 8.0*86400.0*tscale;  // 8 days (better than seven since it is a power of 2)
    tstep = 4.0*86400.0*tscale;  // 4 days (changed 10/16/98 since we got a faster applet runner)

    launched = false;
    running = false;
    resetQueued = false;
    timeTweak = 1.0;

    defaultDist = 5.0e7 * 1.0e5 * dscale;
    if (top.RocketMode)
      captureradius = 3000000; // 3 million km
    if (top.AsteroidMode)
      captureradius =  400000; // 400,000 km

    nobj = 11;
    nall = 6*nobj+1;
    n = nall;
    
    pos = new double[nall];
    opos = new double[nall];
    use = new boolean[nobj];
    gmass = new double[nobj];

    for (i=0; i<nobj; i++)
      use[i] = true;

    G = 6.67259e-8 * dscale*dscale*dscale/(mscale*tscale*tscale);

    gmass[0] = G * 1.990e33*mscale;     // Sun       (mass in grams*mscale)
    gmass[1] = G * 3.303e26*mscale;     // Mercury
    gmass[2] = G * 4.870e27*mscale;     // Venus
    gmass[3] = G * 5.976e27*mscale;     // Earth-Moon 
    gmass[4] = G * 6.418e26*mscale;     // Mars
    gmass[5] = G * 1.899e30*mscale;     // Jupiter
    gmass[6] = G * 5.686e29*mscale;     // Saturn
    gmass[7] = G * 8.660e28*mscale;     // Uranus
    gmass[8] = G * 1.030e29*mscale;     // Neptune
    gmass[9] = G * 1.000e25*mscale;     // Pluto
    gmass[10] = 0.0;             // Test mass (Asteroid, Rocket, etc.)

    fixCoords();

    // Static, internal arrays for the RK integrator functions
    yscal = new double[nall];
    y = new double[nall];
    dydx = new double[nall];
    yerr = new double[nall];
    ytemp = new double[nall];
    ysav = new double[nall];
    yseq = new double[nall];
    ym = new double[nall];
    yn = new double[nall];
    ak2 = new double[nall];
    ak3 = new double[nall];
    ak4 = new double[nall];
    ak5 = new double[nall];
    ak6 = new double[nall];
    aytemp = new double[nall];

    hv = new double[3];

    kmaxx = 8;
    imaxx = kmaxx+1;
    cv = new double[nall];
    dv = new double[nall][kmaxx+1];
    xv = new double[kmaxx+1];
    err = new double[kmaxx+1];
    av = new double[imaxx+2];
    alf = new double[kmaxx+2][kmaxx+2];

    astDist = 0.0;
    astTanVel = 0.0;
    astRadVel = 0.0;

    astAng = 0.0;
    astVel = 0.0;
    astDay = 0.0;
    astAng2 = 0.0;
    astVel2 = 0.0;
    astDay2 = 0.0;

    capture = 3;
    realdestplanet = 4;

    reset();
  }

  private void fixCoords() {
    double m[][];
    double x, y, r, r2, t, theta;
    int i,j;

    // Rotate the "start" vector so we are looking at the Earth-Sun
    // plane with no inclination
    
    m = new double[3][4];

    // First, figure out where the Earth plane is pointing.
    x = start[3*6+1];
    y = start[3*6+2];
    r2 = Math.sqrt(x*x+y*y);
    r = Math.sqrt(r2*r2 + start[3*6+3]*start[3*6+3]);

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

    for (i=0; i<nobj; i++)
      for (j=0; j<=1; j++) {
	m[0][3] = start[i*6+j*3+1]*m[0][0] + start[i*6+j*3+2]*m[1][0] + start[i*6+j*3+3]*m[2][0];
	m[1][3] = start[i*6+j*3+1]*m[0][1] + start[i*6+j*3+2]*m[1][1] + start[i*6+j*3+3]*m[2][1];
	m[2][3] = start[i*6+j*3+1]*m[0][2] + start[i*6+j*3+2]*m[1][2] + start[i*6+j*3+3]*m[2][2];
	start[i*6+j*3+1] = m[0][3];
	start[i*6+j*3+2] = m[1][3];
	start[i*6+j*3+3] = m[2][3];
      }

    // y rotation
    t = Math.sqrt(start[3*6+1]*start[3*6+1] + start[3*6+3]*start[3*6+3]);
    m[0][0] = start[3*6+1]/t;
    m[0][1] = 0.0;
    m[0][2] = -start[3*6+3]/t;
    m[1][0] = 0.0;
    m[1][1] = 1.0;
    m[1][2] = 0.0;
    m[2][0] = start[3*6+3]/t;
    m[2][1] = 0.0;
    m[2][2] = start[3*6+1]/t;

    for (i=0; i<nobj; i++)
      for (j=0; j<=1; j++) {
	m[0][3] = start[i*6+j*3+1]*m[0][0] + start[i*6+j*3+2]*m[1][0] + start[i*6+j*3+3]*m[2][0];
	m[1][3] = start[i*6+j*3+1]*m[0][1] + start[i*6+j*3+2]*m[1][1] + start[i*6+j*3+3]*m[2][1];
	m[2][3] = start[i*6+j*3+1]*m[0][2] + start[i*6+j*3+2]*m[1][2] + start[i*6+j*3+3]*m[2][2];
	start[i*6+j*3+1] = m[0][3];
	start[i*6+j*3+2] = m[1][3];
	start[i*6+j*3+3] = m[2][3];
      }

    // anti-x rotation, based on the velocity vector
    t = Math.sqrt(start[3*6+5]*start[3*6+5] + start[3*6+6]*start[3*6+6]);
    m[0][0] = 1.0;
    m[0][1] = 0.0;
    m[0][2] = 0.0;
    m[1][0] = 0.0;
    m[1][1] = start[3*6+5]/t;
    m[1][2] = -start[3*6+6]/t;
    m[2][0] = 0.0;
    m[2][1] = start[3*6+6]/t;
    m[2][2] = start[3*6+5]/t;

    for (i=0; i<nobj; i++)
      for (j=0; j<=1; j++) {
	m[0][3] = start[i*6+j*3+1]*m[0][0] + start[i*6+j*3+2]*m[1][0] + start[i*6+j*3+3]*m[2][0];
	m[1][3] = start[i*6+j*3+1]*m[0][1] + start[i*6+j*3+2]*m[1][1] + start[i*6+j*3+3]*m[2][1];
	m[2][3] = start[i*6+j*3+1]*m[0][2] + start[i*6+j*3+2]*m[1][2] + start[i*6+j*3+3]*m[2][2];
	start[i*6+j*3+1] = m[0][3];
	start[i*6+j*3+2] = m[1][3];
	start[i*6+j*3+3] = m[2][3];
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

    for (i=0; i<nobj; i++)
      for (j=0; j<=1; j++) {
	m[0][3] = start[i*6+j*3+1]*m[0][0] + start[i*6+j*3+2]*m[1][0] + start[i*6+j*3+3]*m[2][0];
	m[1][3] = start[i*6+j*3+1]*m[0][1] + start[i*6+j*3+2]*m[1][1] + start[i*6+j*3+3]*m[2][1];
	m[2][3] = start[i*6+j*3+1]*m[0][2] + start[i*6+j*3+2]*m[1][2] + start[i*6+j*3+3]*m[2][2];
	start[i*6+j*3+1] = m[0][3];
	start[i*6+j*3+2] = m[1][3];
	start[i*6+j*3+3] = m[2][3];
      }
    */

    /*
    if (top.RocketMode) {
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
	m[0][3] = start[i*6+j*3+1]*m[0][0] + start[i*6+j*3+2]*m[1][0] + start[i*6+j*3+3]*m[2][0];
	m[1][3] = start[i*6+j*3+1]*m[0][1] + start[i*6+j*3+2]*m[1][1] + start[i*6+j*3+3]*m[2][1];
	m[2][3] = start[i*6+j*3+1]*m[0][2] + start[i*6+j*3+2]*m[1][2] + start[i*6+j*3+3]*m[2][2];
	start[i*6+j*3+1] = m[0][3];
	start[i*6+j*3+2] = m[1][3];
	start[i*6+j*3+3] = m[2][3];
      }
    }
    */

    if (top.RocketMode) {
      // Rotate Neptune's "start" vector so it is pretty well lined up for
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
	m[0][3] = start[i*6+j*3+1]*m[0][0] + start[i*6+j*3+2]*m[1][0] + start[i*6+j*3+3]*m[2][0];
	m[1][3] = start[i*6+j*3+1]*m[0][1] + start[i*6+j*3+2]*m[1][1] + start[i*6+j*3+3]*m[2][1];
	m[2][3] = start[i*6+j*3+1]*m[0][2] + start[i*6+j*3+2]*m[1][2] + start[i*6+j*3+3]*m[2][2];
	start[i*6+j*3+1] = m[0][3];
	start[i*6+j*3+2] = m[1][3];
	start[i*6+j*3+3] = m[2][3];
      }
    }

    if (top.AsteroidMode) {
      double tweak;

      // Tweak the distance to put it out at the Asteroid Belt

      //    tweak = 1.15;
      tweak = 2.5;
      start[10*6+1] *= tweak;
      start[10*6+2] *= tweak;
      start[10*6+3] *= tweak;
      
      // Tweak the velocity to make it a (roughly) circular orbit at
      // its new distance

      start[10*6+4] *= 1.0/Math.sqrt(tweak);
      start[10*6+5] *= 1.0/Math.sqrt(tweak);
      start[10*6+6] *= 1.0/Math.sqrt(tweak);
    }
  }
  
  public void adjustTimeStepUp(boolean up) {
    double amt = 2.0;
    if (up)
      timeTweak *= amt;
    else
      timeTweak *= 1.0/amt;
  }

  private void reset() {
    int i;
    // Convert JD to sec
    pos[0] = (start[0]-2450000.0)*86400.0*tscale;
    // Renormalize the time scale
    pos[0] = 0.0*86400.0*tscale;

    for (i=0; i<nobj; i++) {
      // Convert AU and AU/day to cm and cm/s
      pos[i*6+1] = start[i*6+1]*1.496e13*dscale;
      pos[i*6+2] = start[i*6+2]*1.496e13*dscale;
      pos[i*6+3] = start[i*6+3]*1.496e13*dscale;
      if (use[i]) {
	pos[i*6+4] = start[i*6+4]*1.496e13*dscale/(86400.0*tscale);
	pos[i*6+5] = start[i*6+5]*1.496e13*dscale/(86400.0*tscale);
	pos[i*6+6] = start[i*6+6]*1.496e13*dscale/(86400.0*tscale);
      } else {
	pos[i*6+4] = pos[i*6+5] = pos[i*6+6] = 0.0;
      }
    }

    launched = false;
    if (top.threadstarted) {
      top.canvas.launched = false;
      top.canvas.message = "";
      top.canvas.msgcount = 0;
    }
    homeplanet = 3;
    destplanet = realdestplanet;
    launch2 = 0.0;
    lastDist = baseDist = defaultDist;
  }

  public void doAsteroid(double dist, double ang, double tanvel, 
			 double radvel) {
    int i;
    double a;

    astDist = dist;
    astAng = ang;
    astTanVel = tanvel;
    astRadVel = radvel;
    
    // Start from Earth
    for (i=1; i<=6; i++)
      start[(nobj-1)*6+i] = start[3*6+i];

    // Distance in AU
    a = Math.atan2(start[(nobj-1)*6+2], start[(nobj-1)*6+1]);
    start[(nobj-1)*6+1] += astDist*Math.cos(a-(astAng+180.0)*Math.PI/180.0);
    start[(nobj-1)*6+2] += astDist*Math.sin(a-(astAng+180.0)*Math.PI/180.0);

    // Convert velocity from km/s to AU/day
    start[(nobj-1)*6+4] = astTanVel*(86400.0/1.496e8)*Math.cos(a-(astAng+90.0)*Math.PI/180.0);
    start[(nobj-1)*6+5] = astTanVel*(86400.0/1.496e8)*Math.sin(a-(astAng+90.0)*Math.PI/180.0);
    start[(nobj-1)*6+4] += astRadVel*(86400.0/1.496e8)*Math.cos(a-(astAng+180.0)*Math.PI/180.0);
    start[(nobj-1)*6+5] += astRadVel*(86400.0/1.496e8)*Math.sin(a-(astAng+180.0)*Math.PI/180.0);
    queueReset();
    top.astinput = true;
  }
  
  public void doRocket(int n, double ang, double vel, double day) {
    if (n == 1) {
      astAng = ang;
      astVel = vel;
      astDay = day;
    } else {
      astAng2 = ang;
      astVel2 = vel;
      astDay2 = day;
    }

    queueReset();
    top.astinput = true;
  }

  public void checkLaunch() {
    double a, ang, vel, day, fuel, order, sign;

    if (homeplanet == 3) {
      ang = astAng;
      vel = astVel;
      day = astDay;
    } else {
      ang = astAng2;
      vel = astVel2;
      day = astDay2+launch2;
    }

    if (!launched && pos[0] >= day*86400.0*tscale) {
      if (launch2 > 0.0 && homeplanet == 3) {
	// Already returned to Earth; Don't launch again
      } else {
	// Don't launch if the velocity is zero!
	// This is a clue that the user has not yet entered any
	// parameters on the Options screen.
	if (vel != 0.0) {
	  
	  // Angle of Rocket from Sun
	  a = Math.atan2(pos[(nobj-1)*6+2], pos[(nobj-1)*6+1]);
	  
	  // Convert velocity from km/s to "pos" units (cm/s * scale)
	  pos[(nobj-1)*6+4] += vel * 1.0e5 * dscale/tscale * 
	    Math.cos(a-(ang+180.0)*Math.PI/180.0);
	  pos[(nobj-1)*6+5] += vel * 1.0e5 * dscale/tscale * 
	    Math.sin(a-(ang+180.0)*Math.PI/180.0);
	  launched = true;
	  fuel = Math.exp(vel/vfuel)-1.0;
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
	    System.out.println("Order: "+order);
	    */
	    fuel = order*(Math.round(fuel/order));
	  }
	  top.canvas.message = "Fuel used: "+fuel;
	  if (top.canvas.message.endsWith("0001")) {
	    top.canvas.message = top.canvas.message.substring(0,
				 top.canvas.message.length()-4);
	    while (top.canvas.message.endsWith("0"))
	      top.canvas.message = top.canvas.message.substring(0,
				   top.canvas.message.length()-1);
	  }
	  
	  top.canvas.message += " metric tons";
	  top.canvas.msgcount = 0;
	  refresh();
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
  public void checkRocket() {
    int i,j,k, mini;
    double radius,dx,dy,dz, min, min2, mint, r2, t, dx1, dx2, dy1, dy2, denom;
    double xa, xb, ya, yb;

    min = min2 = mint = 1.0e20;
    mini = 0;
    j = (nobj-1)*6;
    for (i=0; i<nobj-1; i++)
      /* Only collide with planets that are turned on (use[i])!  Also,
	 don't land on the homeplanet if we are using the rocket
	 instead of the asteroid. */
      if ((!top.RocketMode || i != homeplanet) && use[i]) {
	k = i*6;

	dx = pos[j+1]-pos[k+1];
	dy = pos[j+2]-pos[k+2];
	dz = pos[j+3]-pos[k+3];
	// Capture is only in 2D!!
	radius = Math.sqrt(dx*dx+dy*dy);

	// Interpolate between time points to find where the closest
	// approach was
	dx1 = pos[j+1]-opos[j+1];
	dx2 = pos[k+1]-opos[k+1];
	dy1 = pos[j+2]-opos[j+2];
	dy2 = pos[k+2]-opos[k+2];
	denom = (dx1-dx2)*(dx1-dx2) + (dy1-dy2)*(dy1-dy2);
	if (denom == 0.0)
	  t = 0.0;
	else 
	  t = (opos[j+1]*(dx2-dx1) + opos[k+1]*(dx1-dx2) + 
	       opos[j+2]*(dy2-dy1) + opos[k+2]*(dy1-dy2)) / denom;
	t = (t < 0.0 ? 0.0 : (t > 1.0 ? 1.0 : t));
	
	xa = opos[j+1] + dx1*t;
	xb = opos[k+1] + dx2*t;
	ya = opos[j+2] + dy1*t;
	yb = opos[k+2] + dy2*t;
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
	if ((r2 < captureradius * 1.0e5 * dscale || 
	     (i == 0 && r2 < 5.0 * captureradius * 1.0e5 * dscale))
	    && top.usecapture)
	  break;

	if (top.RocketMode && i == destplanet) {
	  if (t == 1.0)
	    lastDist = radius;
	  else if (r2 < baseDist) {
	    // The rocket has just started moving away from the
	    // destination planet
	    String s;
	    double a1,a2,a;
	    
	    baseDist = lastDist = r2;
	
	    // Calculate angle between planet and rocket in terms of
	    // motion of the planet
	    a1 = Math.atan2(dy,dx);
	    a2 = Math.atan2(yb,xb);
	    a = (((a1-a2)*180.0/Math.PI) % 360.0 + 360.0) % 360.0;
	    //	    System.out.println("T: "+t);
	    //	    System.out.println(""+a1*180.0/Math.PI+" "+a2*180.0/Math.PI+" "+a+" ("+dx/(1.0e5*dscale)+","+dy/(1.0e5*dscale)+")");
	    
	    if (r2 > 1.0e6)
	      s = "Missed by "+Math.round(r2/(1.0e8*dscale))*1.0e-3+" million km. ";
	    else
	      s = "Missed by "+Math.round(r2/(1.0e5*dscale))+" km. ";

	    if (a < 0.0 || a > 360.0)
	      s = "Error! "+a;
	    else if (a < 45.0 || a >= 315.0)
	      s += "The rocket went outside the orbit of "+names[i];
	    else if (a < 135.0)
	      s += "The rocket passed ahead of "+names[i];
	    else if (a < 215.0)
	      s += "The rocket went inside the orbit of "+names[i];
	    else
	      s += "The rocket passed behind "+names[i];
	    top.canvas.message = s;
	    top.canvas.msgcount = 0;
	  }
	}
      }

    /*
    if (min < 1.0e20) {
      System.out.println(names[mini]+": "+min/(1.496e13*dscale)+" AU,  "+min/(1.0e5*dscale)+" km ("+(pos[j+1]-pos[mini*6+1])/(1.0e5*dscale)+","+(pos[j+2]-pos[mini*6+2])/(1.0e5*dscale)+","+(pos[j+3]-pos[mini*6+3])/(1.0e5*dscale)+")");
      System.out.println("    R2: "+min2/(1.0e5*dscale)+" km, T: "+mint);
    } */

    if (i < nobj-1) {  // i.e. we did a "break" before and we are captured
      if (top.RocketMode) {
	double traveltime;
	if (i == 3) {
	  traveltime = pos[0]/(86400.0*tscale)-launch2-astDay2;
	  if (traveltime < 500.0)
	    top.canvas.message = "Welcome back to Earth! Trip time: "+
	      traveltime+" days";
	  else
	    top.canvas.message = "Welcome back to Earth! Trip time: "+
	      traveltime/365.25+" years";
	  
	} else {
	  traveltime = pos[0]/(86400.0*tscale)-astDay;
	  if (traveltime < 500.0)
	    top.canvas.message = "Welcome to "+names[i]+"! Trip time: "+
	      traveltime+" days";
	  else {
	    traveltime = 0.01 * Math.round(100.0*traveltime/365.25);
	    top.canvas.message = "Welcome to "+names[i]+"! Trip time: "+
	      traveltime+" years";
	  }
	}
	top.canvas.msgcount = 0;
	capture = i;
	launched = false;
	top.canvas.launched = false;
	for (k=1;k<=6;k++)
	  pos[j+k] = pos[i*6+k];
	launch2 = pos[0]/(86400.0*tscale);
	
	refreshcanvas();

	homeplanet = i;
	destplanet = 3;  // Heading back to Earth
	lastDist = baseDist = defaultDist;
      } else {
	top.canvas.message = "Asteroid collided with "+names[i]+"!";
	top.canvas.msgcount = 0;
	use[10] = false;  // Remove the asteroid from the simulation
      }
    }
  }

  private void force(double t, double r[], double dr[]) {
    int i,j,k,l;
    double radius, accel;
    double dx,dy,dz;
    
    for (k=0;k<nobj;k++) {
      i=6*k;
      if (!use[k]) {
	dr[i+1] = dr[i+2] = dr[i+3] = dr[i+4] = dr[i+5] = dr[i+6] = 0.0;
      } else {
	dr[i+4] = dr[i+5] = dr[i+6] = 0.0;
	dr[i+1] = r[i+4];
	dr[i+2] = r[i+5];
	if (top.use2D)
	  dr[i+3] = 0.0;
	else
	  dr[i+3] = r[i+6];
	// only go to nobj-2 so we don't try to compute the
	// (nonexistent) gravity due to the Rocket
	for (l=0;l<nobj-1;l++) { 
	  if (l!=k && use[l]) {
	    // Skip gravity of the Earth (or whichever planet the
	    // Rocket just launched from) on the Rocket
	    if (l == homeplanet && k == nobj-1)
	      continue;
	    j=6*l;
	    dx = r[j+1]-r[i+1];
	    dy = r[j+2]-r[i+2];
	    dz = r[j+3]-r[i+3];
	    if (top.use2D)
	      radius = Math.sqrt(dx*dx+dy*dy);
	    else
	      radius = Math.sqrt(dx*dx+dy*dy+dz*dz);
	    accel = gmass[l]/(radius*radius*radius);
	    dr[i+4] += accel*dx;
	    dr[i+5] += accel*dy;
	    if (!top.use2D)
	      dr[i+6] += accel*dz;
	  }
	}
      }
    }
  }

  private void rk(double x, double h) {
    int i;

    for (i=1;i<n;i++)
      aytemp[i]=y[i]+b21*h*dydx[i];
    force(x+a2*h,aytemp,ak2);
    for (i=1;i<n;i++)
      aytemp[i]=y[i]+h*(b31*dydx[i]+b32*ak2[i]);
    force(x+a3*h,aytemp,ak3);
    for (i=1;i<n;i++)
      aytemp[i]=y[i]+h*(b41*dydx[i]+b42*ak2[i]+b43*ak3[i]);
    force(x+a4*h,aytemp,ak4);
    for (i=1;i<n;i++)
      aytemp[i]=y[i]+h*(b51*dydx[i]+b52*ak2[i]+b53*ak3[i]+b54*ak4[i]);
    force(x+a5*h,aytemp,ak5);
    for (i=1;i<n;i++)
      aytemp[i]=y[i]+h*(b61*dydx[i]+b62*ak2[i]+b63*ak3[i]+b64*ak4[i]+b65*ak5[i]);
    force(x+a6*h,aytemp,ak6);
    for (i=1;i<n;i++)
      ytemp[i]=y[i]+h*(c1*dydx[i]+c3*ak3[i]+c4*ak4[i]+c6*ak6[i]);
    for (i=1;i<n;i++)
      yerr[i]=h*(dc1*dydx[i]+dc3*ak3[i]+dc4*ak4[i]+dc5*ak5[i]+dc6*ak6[i]);
  }
  
  private void rkqs(double hv[], double htry, double eps) {
    int i;
    double errmax,h,maxarg;

    h=htry;
    for (;;) {
      rk(hv[0],h);
      errmax=0.0;
      for (i=1;i<n;i++) {
	maxarg = Math.abs(yerr[i]/yscal[i]);
	errmax = (errmax > maxarg ? errmax : maxarg);
      }
      errmax /= eps;
      if (errmax > 1.0) {
	h=0.9*h*Math.pow(errmax,-0.25);
	if (h < 0.1*h)
	  h *= 0.1;
	xnew=hv[0]+h;
	if (xnew == hv[0])
	  System.out.println("stepsize underflow in rkqs");
	continue;
      } else {
	if (errmax > 1.89e-4)
	  hv[2]=0.9*h*Math.pow(errmax,-0.2);
	else 
	  hv[2]=5.0*h;
	hv[0] += (hv[1]=h);
	for (i=1;i<n;i++)
	  y[i]=ytemp[i];
	break;
      }
    }
  }
  


  private void mmid(double hv[], double htot, int nstep) {
    int nx,i;
    double x,swap,h2,h;

    h=htot/nstep;
    for (i=1;i<n;i++) {
      ym[i]=y[i];
      yn[i]=y[i]+h*dydx[i];
    }
    //    System.out.println(h+" "+htot+" "+nstep);
    x=hv[0]+h;
    force(x,yn,yseq);
    //    for (i=1;i<n;i++)
    //      System.out.println(y[i]+" "+yseq[i]+" "+yn[i]+" "+ym[i]);
    h2=2.0*h;
    for (nx=2;nx<=nstep;nx++) {
      for (i=1;i<n;i++) {
	swap=ym[i]+h2*yseq[i];
	ym[i]=yn[i];
	yn[i]=swap;
      }
      x += h;
      force(x,yn,yseq);
    }
    for (i=1;i<n;i++)
      yseq[i]=0.5*(ym[i]+yn[i]+h*yseq[i]);
  }

  private void pzextr(int iest, double xest) {
    int k1,j;
    double q,f2,f1,delta;

    xv[iest]=xest;
    for (j=1;j<n;j++)
      yerr[j]=y[j]=yseq[j];
    if (iest == 1) {
      for (j=1;j<n;j++)
	dv[j][1]=yseq[j];
    } else {
      for (j=1;j<n;j++)
	cv[j]=yseq[j];
      for (k1=1;k1<iest;k1++) {
	delta=1.0/(xv[iest-k1]-xest);
	f1=xest*delta;
	f2=xv[iest-k1]*delta;
	for (j=1;j<n;j++) {
	  q=dv[j][k1];
	  dv[j][k1]=yerr[j];
	  delta=cv[j]-q;
	  yerr[j]=f1*delta;
	  cv[j]=f2*delta;
	  y[j] += yerr[j];
	}
      }
      for (j=1;j<n;j++)
	dv[j][iest]=yerr[j];
    }
  }

  private void bsstep(double hv[], double htry, double eps) {
    
    int i,iq,k,kk,km=1;
    double eps1,errmax=tiny,fact,hh,red=1.0,scale=1.0,work,wrkmin,xest;
    boolean reduct, exitflag=false;
    
    if (eps != epsold) {
      hv[2] = xnew = -1.0e29;
      eps1=safe1*eps;
      av[1]=(double)nseq[1]+1.0;
      for (k=1;k<=kmaxx;k++)
	av[k+1]=av[k]+(double)nseq[k+1];
      for (iq=2;iq<=kmaxx;iq++) {
	for (k=1;k<iq;k++)
	  alf[k][iq]=Math.pow(eps1,(av[k+1]-av[iq+1])/
			      ((av[iq+1]-av[1]+1.0)*(2*k+1)));
      }
      epsold=eps;
      for (kopt=2;kopt<kmaxx;kopt++)
       if (av[kopt+1] > av[kopt]*alf[kopt-1][kopt])
	 break;
      kmax=kopt;
    }
    //        System.out.println(kmax);
    hh=htry;
    for (i=1;i<n;i++)
      ysav[i]=y[i];
    if (hv[0] != xnew || hh != hv[2]) {
      first=true;
      kopt=kmax;
    }
    reduct=false;
    for (;;) {
      for (k=1;k<=kmax;k++) {
	xnew=hv[0]+hh;
	//		System.out.println(xnew);
	if (xnew == hv[0])
      	  System.out.println("step size underflow in bsstep");
	mmid(hv,hh,nseq[k]);
	xest=(hh/(double)nseq[k]);
	xest = xest*xest;
	pzextr(k,xest);
	if (k != 1) {
	  errmax=tiny;
	  for (i=1;i<n;i++) {
	    // Don't allow the Z component to enter into the error analysis since this is mostly a 2D solution...
	    if (i % 3 != 0 && i > 3) {
	      //	      System.out.println(i+" "+Math.abs(yerr[i]/yscal[i])+" "+yerr[i]+" "+yscal[i]+" "+yseq[i]);
	      errmax=(errmax>Math.abs(yerr[i]/yscal[i]) ? errmax : Math.abs(yerr[i]/yscal[i]));
	    }
	  }
	  //	  System.out.println("  "+errmax);
	  errmax /= eps;
	  km=k-1;
	  err[km]=Math.pow(errmax/safe1,1.0/(2*km+1));
	}
	if (k != 1 && (k >= kopt-1 || first)) {
	  if (errmax < 1.0) {
	    exitflag=true;
	    break;
	  }
	  if (k == kmax || k == kopt+1) {
	    red=safe2/err[km];
	    break;
	  } else if (k == kopt && alf[kopt-1][kopt] < err[km]) {
	    red=1.0/err[km];
	    break;
	  } else if (kopt == kmax && alf[km][kmax-1] < err[km]) {
	    red=alf[km][kmax-1]*safe2/err[km];
	    break;
	  } else if (alf[km][kopt] < err[km]) {
	    red=alf[km][kopt-1]/err[km];
	    break;
	  }
	}
      }
      if (exitflag) 
	break;
      red=(red<redmin ? red:redmin);
      red=(red>redmax ? red:redmax);
      hh *= red;
      //            System.out.println(red);
      reduct=true;
    }
    hv[0]=xnew;
    hv[1]=hh;
    first=false;
    wrkmin=1.0e35;
    for (kk=1;kk<=km;kk++) {
      fact=(err[kk] > scalmx ? err[kk] : scalmx);
      work=fact*av[kk+1];
      if (work < wrkmin) {
	scale=fact;
	wrkmin=work;
	kopt=kk+1;
      }
    }
    hv[2]=hh/scale;
    if (kopt >= k && kopt != kmax && !reduct) {
      fact=(scale/alf[kopt-1][kopt]>scalmx ? scale/alf[kopt-1][kopt]:scalmx);
      if (av[kopt+1]*fact <= wrkmin) {
	hv[2]=hh/fact;
	kopt++;
      }
    }
  }
  
  private void odeint(double ystart[], double x1, double x2, 
		      double eps, double h1, double hmin) {
    int nstp,i,j;
    double xsav,h,scal;
    int good,bad;

    good = bad = 0;
    hv[0]=x1;
    h=(x2>x1 ? Math.abs(h1) : -Math.abs(h1));
    //    hv[1]=hv[2]=h;  // Not necessary, but it gets rid of the javac error message
    for (i=1;i<n;i++)
      y[i]=ystart[i];
    for (nstp=0;nstp<1000;nstp++) {
      //      System.out.println("Step "+nstp+" Good "+good+" Bad "+bad+" Time "+hv[0]);
      force(hv[0],y,dydx);
      for (i=1;i<n;i++) {
	//	yscal[i]=Math.abs(y[i])+Math.abs(dydx[i]*h)+1.0e30;
	yscal[i]=Math.abs(y[i])+Math.abs(dydx[i]*h)+1.0e-30;
	// The sun gives yscal values of 1.0e30 which messes up the BSstep error analysis
	/*
	if (top.useBSstep && yscal[i] == 1.0e30)
	  yscal[i] = 1.0e20;
	*/
      }
      // Redo scales:
      /*
      for (i=0; i<nobj; i++) {
	j = i*6;
	if (top.use2D)
	  scal = Math.sqrt(y[j+1]*y[j+1]+y[j+2]*y[j+2]);
	else
	  scal = Math.sqrt(y[j+1]*y[j+1]+y[j+2]*y[j+2]+y[j+3]*y[j+3]);
	yscal[j+1] = yscal[j+2] = yscal[j+3] = scal+1.0e-30;
	if (top.use2D)
	  scal = Math.sqrt(y[j+4]*y[j+4]+y[j+5]*y[j+5]);
	else
	  scal = Math.sqrt(y[j+4]*y[j+4]+y[j+5]*y[j+5]+y[j+6]*y[j+6]);
	yscal[j+4] = yscal[j+5] = yscal[j+6] = scal+1.0e-30;
      }
      */
	
      if ((hv[0]+h-x2)*(hv[0]+h-x1) > 0.0)
	h=x2-hv[0];
      if (top.useBSstep) {
        bsstep(hv,h,eps);
      } else {
        rkqs(hv,h,eps);
      }
      if (hv[1] == h)
	good++;
      else 
	bad++;
      if ((hv[0]-x2)*(x2-x1) >= 0.0) {
	for (i=1;i<n;i++)
	  ystart[i]=y[i];
	return;
      }
      if (Math.abs(hv[2]) <= hmin)
	System.out.println("Step size too small in odeint");
      h=hv[2];
    }
    System.out.println("Too many steps in routine odeint");
  }

  public void queueReset() {
    top.canvas.clearTrails();
    if (top.threadstarted) {
      if (top.running)
	resetQueued = true;
      else {
	reset();
	refresh();
	resetQueued = false;
      }
    }
  }

  public void run() {
    double tweak;
    int i;

    while (true) {
      if (timeTweak != 1.0) {
	tstep *= timeTweak;
	timeTweak = 1.0;
      }
      if (resetQueued) {
	reset();
	refresh();
	resetQueued = false;
      }
      if (running) {
	if (top.RocketMode)
	  checkLaunch();
	for (i=0; i<=nobj*6; i++)
	  opos[i] = pos[i];
	if (top.RocketMode) {
	  tweak = (homeplanet == 3 ? astDay : astDay2+launch2) * 
	    86400.0*tscale - pos[0];
	  if (!launched && tweak*(tweak-tstep) < 0.0) {
	    odeint(pos, pos[0], pos[0]+tweak, 1.0e-6, tweak/10.0, tstep*1.0e-15);
	    pos[0] += tweak;
	    checkLaunch();
	    odeint(pos, pos[0], pos[0]+tstep-tweak, 1.0e-6, (tstep-tweak)/10.0, 
		   tstep*1.0e-15);
	    pos[0] += tstep-tweak;
	  } else {
	    odeint(pos, pos[0], pos[0]+tstep, 1.0e-6, tstep/1.0, tstep*1.0e-15);
	    pos[0] += tstep;
	  }
	} else {
	  odeint(pos, pos[0], pos[0]+tstep, 1.0e-6, tstep/1.0, tstep*1.0e-15);
	  pos[0] += tstep;
	}	
	checkRocket();
	refresh();
	yield();
      } else {
	suspend();
      }
    }
  }

  private void refresh() {
    // MAJOR Java 1.1.x hack!  I want the event to go to the Rocket class, but it
    // ignores ActionEvents.  So, pass this event to an arbitrary
    // component (I choose the runbutton) which will then pass it on
    // to the Rocket class.
//    top.runbutton.dispatchEvent(new ActionEvent(this, Event.ACTION_EVENT, "thread"));

    /*
    while (!top.isReady()) {
      System.out.println("Sleep");
      try {
	sleep(10);
      } catch (Exception e) {
      }
    }
    */
    top.deliverEvent(new Event(this, Event.ACTION_EVENT, this));
  }

  private void refreshcanvas() {
    // MAJOR Java 1.1.x Hack!  See refresh() for explanation
//    top.runbutton.dispatchEvent(new ActionEvent(this, Event.ACTION_EVENT, "canvas"));

    top.deliverEvent(new Event(this, Event.ACTION_EVENT, top.canvas));
  }
}