//External SAL configuration file 
var salconfig = require('./config/appconfig.js');

//Debug
var DEBUG = salconfig.SDEBUG;

//Setup Express3 & Socket.IO
var express = require('express');
var engine = require('ejs-locals');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server,{ log: salconfig.logstatus });
io.set('log level', salconfig.loglevel);

//Configure ejs rendering engine
var ShowStatus="ntr";
app.engine('ejs', engine);
app.configure(function() {
	app.set('title', 'Social Analytics Live');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');	
	app.use(express.favicon());
	//Print on console all requested files!
	//app.use(express.logger('dev'));  
	app.use(express.bodyParser()); 
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});
app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions : true,
		showStack : true
	}));
});
app.configure('production', function() {
	app.use(express.errorHandler());
});
app.get('/', function(req, res) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render('index.ejs', {
		terms : terms
	});
});

app.get('/all', function(req, res) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render('all.ejs', {
		terms : terms,
		showstatus : ShowStatus,
		title: salconfig.title
	});
});
//TODO: Handle 404

var TwitterWorker = require('./workers/twitter.js');
var DBT = require('./workers/dbTrainman.js');
var MongoDB = require('./workers/mongodb.js');
var TM = require('./workers/time.js');

//TERMS
var terms = [ 'marchmadness', 'ncaa' , 'basketball2014' ];

//Start Express
process.env.NODE_ENV = salconfig.environment;
server.listen(process.env.PORT || salconfig.port);
var myport ="";
(process.env.PORT != null) ? myport = process.env.PORT : myport = salconfig.port;
console.log("Express3 running on %d in %s mode",myport,salconfig.environment);
if (DEBUG) { console.log("Server time %s (%s milliseconds)",TM.t("now","HH:mm:ss"),TM.t("now","valueof")); }

var ShowID   = salconfig.MongoDBDocumentSuffix;
var StartDT,EndDT,ShowStart,ShowEnd,RunningTime,DelayTime; 
RunningTime =  salconfig.RunningTime;
DelayTime   = salconfig.DelayTime;  
ShowStart = TM.t("now","valueof") + DelayTime; 
ShowEnd   = ShowStart + RunningTime;

if (DEBUG) { console.log("Server:Next show starts at %s",TM.t(ShowStart,"HH:mm:ss")); }
if (DEBUG) { console.log("Show running Time", RunningTime/(1000*60), " minutes"); }

setTimeout(function () {
	if (DEBUG) { console.log("Starting Twitter Stream ...", TM.t("now","HH:mm:ss")); } 
	TwitterWorker.TW(terms,ShowID,RunningTime,ShowStart);
	},DelayTime);

//Listen and Update
io.sockets.on('connection', function(socket) {
	socket.on('chart', function (data) {
	var TimeNow = TM.t("now","valueof");
	var msg ="";
	if ((TimeNow > ShowStart) && (TimeNow < ShowEnd)) {
		if (data.type == "ALL") {
			if (DEBUG) { console.log("Request from client ... showing ALL charts ..."); }			
			DBT.AllFunctions(socket,ShowID,ShowEnd-TimeNow,ShowStart); 
			DBT.StartALL(socket,ShowID,ShowEnd-TimeNow,ShowStart);
			msg = "Show has started! Visit <a href=\"/all\">All charts</a>";
			ShowStatus = "now";
			socket.emit("time",{key:'showstatus',count:msg});
	    }
	   else {
            msg = "Show has started! Visit <a href=\"/all\">All charts</a>";
            socket.emit("time",{key:'showstatus',count:msg});
         }	
	}
	else if (TimeNow < ShowStart){
		if (DEBUG) { console.log("Wait for show to start ...."); }
		var wt = ShowStart-TimeNow;
		msg = "Next show starts at " + TM.t(ShowStart,"HH:mm:ss") + " ("+ wt + " milliseconds)";
		ShowStatus = "upcoming";
		socket.emit("time",{key:'showstatus',count:msg});
	}
	else {
		if (DEBUG) { console.log("No shows scheduled now"); }
		msg = "No shows scheduled now";
		ShowStatus = "ntr";
		socket.emit("time",{key:'showstatus',count:msg});
	}
  });   //end socket on chart
});  // end socket on connections
