var salconfig = require('../config/appconfig.js');
var TwitterWorker = require('./twitter.js');
var MongoDB = require('./mongodb.js');
var twix = require("twix");
var TM = require('./time.js');
var numeral = require('numeral');

//Global variables
var ShowComplete = false;
var ShowEndMessage ="";
var DEBUG = salconfig.DBTDEBUG;
var StatusUpdate = salconfig.StatusUpdate;
var LeaderBoardLimit = salconfig.LeaderBoardLimit;
var TweetLimit = salconfig.TweetLimit;
var MentionsLimit = salconfig.MentionsLimit;
var WordCloudLimit = salconfig.WordCloudLimit;
var MediaLimit = salconfig.MediaLimit;
var SourceLimit = salconfig.SourceLimit;
var TFrequencyLimit = salconfig.TFrequencyLimit;
var TZLimit = salconfig.TZLimit;


function MyClose(ShowStart,RunningTime,socket){
	setTimeout(function () {
		if (DEBUG) { console.log("dbTrainman: oh! show is complete"); }
	    ShowComplete = true;
	    var SS  = TM.t("now","HH:mm:ss");
	    var TimeNow = TM.t("now","valueof");
	    var SE  = TM.t("now","HH:mm:ss");
	    ShowEndMessage = "( " + SS + " - " + SE + " PSD)";
	    // TODO: Move to server.js 
	    //socket.emit('time',{key :'runningtime',count :ShowEndMessage  });	    
	    //console.log('start: closing db connection');
		//MongoDB.DBClose();
	    //console.log('end: closing db connection');
   },RunningTime);	
} 

function UpdateGlobalStats(ShowStart,socket){
 	//Update users
	MongoDB.DBCount({},"users",function(docs) {
		socket.emit("time",{key:'totalusers',count:numeral(docs).format('0,0')});
	});
	//Update tweets
	MongoDB.DBCount({},"tweets",function(docs) {
		socket.emit("time",{key:'totaltweets',count:numeral(docs).format('0,0')});
		//Calculate Tweets/Minute
		var TimeNow = TM.t("now","valueof");
		var t1 = new twix(parseInt(ShowStart), parseInt(TimeNow));
		var t2 = t1.count('minutes');
		var TweetAverage = Number(docs / t2).toFixed(0);
		socket.emit("time",{key:'tweetaverage',count:TweetAverage});
		//Calculate running time		
		var RTime =  TM.f(ShowStart,TimeNow);
		socket.emit('time',{key :'runningtime',count :RTime});
	});
	//Update RT
	MongoDB.DBAgg2({rt:{$exists:true}},{_id:"",rt:{$sum: "$rt"}},{_id:1},1,"users",function(docs) {
	   if (docs.length > 0) {
		   socket.emit("time",{key:'totalrt',count:numeral(docs[0].rt).format('0,0')}); }
	   else {
		   socket.emit("time",{key:'totalrt',count:0});
	   }
	});
	//Update Media shared
	MongoDB.DBCount({"murl":{"$ne":"N/A"}},"tweets",function(docs) {
		socket.emit("time",{key:'mediacount',count:numeral(docs).format('0,0')})
	});
};

function UpdateLeaderBoard(socket){
    MongoDB.DBFind({},{reply:-1,nt:-1,rt:-1,score: -1,mentions: -1}, LeaderBoardLimit,"users",function(docs) {				
		var h1 = '<table class=lbtable>'
				+ '<th>Author</th>'
				+'<th>Tweets</th>'
				+'<th>Reply</th>'
				+'<th>Mentions</th>'
				+'<th>RT</th>'
				+'<th>Twitter Client</th>'
				+'<th>Timezone</th>'
				+'</tr>';
		var h2 = '</table>';
		var tsource = "";
		var LB ="";
		docs.forEach(function(doc) {
		tsource = tsource  + '<tr class=separating_line>'
		            + '<td><div class=name>@' + doc.screen_name + '</div></td>'
		            + '<td>' + doc.nt + '</td>' 
		            + '<td>' + doc.reply + '</td>' 
		            + '<td>' + doc.mentions + '</td>'
					+ '<td>' + doc.rt + '</td>' 
					+ '<td>' + doc.source + '</td>' 
					+ '<td>' + doc.tz + '</td>' 
					+ '</tr>';
		 });
         LB = h1 + tsource + h2;
         if (docs.length > 0) { socket.emit("leaderboard",JSON.stringify(LB));}
        }); //end Leader Board	
}


function UpdateLineChart(socket) {
	MongoDB.DBFindNoLimit({},{date:1},"count",function(docs) {			
		socket.emit("lchart",JSON.stringify(docs));
	}); //end line chart
}


function UpdateEngagingTweets(socket) {
	var tsource = "";
	MongoDB.DBFind({},{score:-1,reply:-1,fav:-1},TweetLimit,"tweets",function(docs) { 	
		docs.forEach(function(doc) {
		    tsource = tsource + '<div class=trow>'
                      + '<div class=image><img src='+ doc.pic+'></img></div>'
                      + '<div class=info>'
                      + '<div class=author>'
                      + '<span class=NAME>'+doc.name +'</span>'
                      + '<span class=HANDLE><span class=spacer/>' + "@"+doc.screen_name +'</span>' 
                      + '</div>'
                      + '<div class=tweet>'+ doc.text+'</div>'
                      + '<div class=stats>'
                     // + '<span class=spacer id=SCORE>Score:'+ doc.score +'</span>'
                      + '<span class=spacer id=RT>RT:'+ doc.rt+'</span>'
                      + '<span class=spacer id=FAV>Favorite:'+ doc.fav +'</span>' 
                      + '<span class=spacer id=REPLY>Reply: '+ doc.reply +'</span>'  
                      + '<span class=spacer id=Source>Source:'+ doc.source +'</span>'  
                      + '<span class=spacer id=URL><a href='+ doc.surl+'>Visit Tweet</a></span>'
                      + '</div>'
                      +'</div>' 
                      + '</div><hr style="height:0.1em;" />';
		  }); //end forEach
		if (docs.length > 0) { socket.emit("etweets",JSON.stringify(tsource)); }
	}); //end MongoDB
} //end UpdateEngagingTweets

function UpdateMentions(socket) {
	var aa = [];
	MongoDB.DBFind({},{score:-1},MentionsLimit,"mentions",function(docs) {	
		docs.forEach(function(doc) {
			//console.log(doc.screen_name , doc.score);
			aa.push({name:doc.screen_name,score:doc.score});
		});
		if (aa.length > 0) {socket.emit("mentions",JSON.stringify(aa));}
	}); //end mentions
}

function UpdateTimeZone(socket) {
	var aa = [];
	//Debug
	//var aa = [{name:"a",size:"5"},{name:"b",size:"15"},{name:"c",size:"10"}];
	MongoDB.DBAgg2({},{_id: "$tz",count:{$sum: 1}},{'count':-1},TZLimit,"users",function(docs) {
		docs.forEach(function(k) {       
			aa.push({name:k._id,score:k.count});
		});
	if (aa.length > 0) { socket.emit("usertz",JSON.stringify(aa));}
	}); //end line chart	
}


function UpdateSource(socket) {
	var aa = [];
	MongoDB.DBAgg2({},{_id: "$source",count:{$sum: 1}},{'count':-1},SourceLimit,"users",function(docs) {
		docs.forEach(function(k) {       
			aa.push({name:k._id,score:k.count});
		});
		if (aa.length > 0) { socket.emit("source",JSON.stringify(aa)); }
		}); //end source
}


//TODO: Fix chart to have LONG legend (only 12 values NOW)
function UpdateTweetFrequency(socket) {
	//var aa = [{tweets:1,count:15},{tweets:2,count:5},{tweets:3,count:2}];
	var aa = [];
	MongoDB.DBAgg2({},{_id: "$nt",count:{$sum: 1}},{_id:1},TFrequencyLimit,"users",function(docs) {
		docs.forEach(function(k) {       
			aa.push({tweets:k._id,count:k.count});
		});
		if (aa.length > 0) { socket.emit("tfrequency",JSON.stringify(aa)); }
		});
}

function UpdateWordCloud(socket) {
	var aa = [];
	//DEBUG
	//var aa2 = [{word:"harish",count:7},{word:"hello",count:5},{word:"world",count:2}];
	MongoDB.DBFind({},{count: -1}, WordCloudLimit,"words",function(docs) {
		var ratio = 0;
		if (docs.length > 0) {
			ratio = docs[0].count/salconfig.NormalizeLimit;
		}
		docs.forEach(function(k) {
			aa.push({word:k.word,count:Math.round(k.count/ratio)});
			});
		if (aa.length > 0) { socket.emit("wcloud",JSON.stringify(aa)); }
	}); //end line chart
}

function UpdateMedia(socket){
	var aa = "";
	var header1 = "<section class=\"Collage effect-parent\">";
	var header2= "</section>";
	//Find pic with score > 5
	MongoDB.DBFind({"murl":{"$ne":"N/A"},score:{ $gt:5}},{score:-1,fav:-1,rt:-1},MediaLimit,"tweets",function(docs) {					
		docs.forEach(function(doc) {
			aa +="<div class=\"Image_Wrapper\">" +
			     "<a href=\"" + "https://twitter.com/" + doc.screen_name + "/status/" + doc.id + "\" target=\"_new\">" +
				 "<img src=" + doc.murl + " width=" + doc.mw + " height=" + doc.mh + "/></a></div>";
		});
		if (docs.length > 0) {socket.emit("time",{key:'photogrid',count:header1+aa+header2});}
	});	
}

/// EXPORT
exports.AllFunctions = function (socket,ShowID,RunningTime,ShowStart) { AllFunctions(socket,ShowID,RunningTime,ShowStart); }
AllFunctions = function (socket,ShowID,RunningTime,ShowStart) {
	if (!ShowComplete)   {
		UpdateGlobalStats(ShowStart,socket);
		UpdateLeaderBoard(socket);
		//TODO: Fix line chart
		//UpdateLineChart(socket);
		UpdateEngagingTweets(socket);
		UpdateTimeZone(socket);
		UpdateMentions(socket);
		UpdateSource(socket);
		UpdateTweetFrequency(socket);
		UpdateWordCloud(socket);                         
		UpdateMedia(socket);
	}
	else {
		socket.emit('time',{key :'runningtime',count :ShowEndMessage  });
	}
	
};

exports.StartALL = function (socket,ShowID,RunningTime,ShowStart) {
	setInterval(function(){AllFunctions(socket,ShowID,RunningTime,ShowStart)},StatusUpdate);
	MyClose(ShowStart,RunningTime,socket);
};
