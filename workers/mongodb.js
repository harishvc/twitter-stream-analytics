//https://docs.mongohq.com/languages/nodejs.html
//http://stackoverflow.com/questions/5669321/insert-into-mongodb-via-node-js - STEP example
//https://github.com/creationix/step
// https://github.com/caolan/async  - Controlling controlflow
// http://stackoverflow.com/questions/6954588/what-is-the-best-control-flow-module-for-node-js - example
// http://mongodb.github.io/node-mongodb-native/
//http://www.hacksparrow.com/node-js-async-programming.html series vs waterfall
//http://malderhout.wordpress.com/2013/07/05/stream-tweets-in-mongodb-with-node-js/
//http://www.sebastianseilund.com/nodejs-async-in-practice
//http://learnmongodbthehardway.com/ex4.html
//http://blog.ijasoneverett.com/2013/08/creating-custom-modules-in-node-js/

var salconfig = require('../config/appconfig.js');
var mongodb = require('mongodb');
MongoClient = mongodb.MongoClient;
var async = require('async');
var sleep = require('sleep');
var TM = require('./time.js');
var DEBUG = salconfig.MONGODEBUG;
var MONGOHQ_URL=salconfig.MONGOURL;


var t1 = false;
var t2 = false;
var t3 = false;
var t4 = false;
var t5 = false;
var t6 = false;
var t7 = false;
var t8 = false;
var TCOUNT = 0;
var COUNT = 0;
var update = false;
var BLF = 50;   //Back Log Factor = 50% 

var db;
var usersdocument;
var tweetsdocument;
var mentionsdocument;
var countdocument;
var wordsdocument;

function DType (type) {
	if (type == "users") { return usersdocument;}
	else if (type == "tweets") { return tweetsdocument;}
	else if (type == "mentions") { return mentionsdocument;} 
	else if (type == "count") { return countdocument;} 
	else if (type == "words") { return wordsdocument;} 
	else { return "null"; }
}

exports.DBConnect = function () {
	async.series([
     function (callback) {
    	 // CONNECT
    	  if (DEBUG) { console.log("start: db connect"); }
    	  MongoClient.connect(MONGOHQ_URL, { server: { auto_reconnect: true } }, function(err, db2) {
	    	 if (err) {return callback(err, "connect error");}
	    	 db = db2;
	    	 if (DEBUG) { console.log("end: db connect"); }
		     t1 = true;
		     callback(null,"end: db connect"); 
    	  });
	   }]
	); //end async
}

exports.DBStart = function (colname,type,reset) {
	async.series([
	   function (callback) {
	   if (DEBUG) { console.log("start: DBReadyNow"); }	 
	     DBReadyNow("conn", function (err) {
		 if (err) {return callback(err, "db connection error");} 
		 if (DEBUG) { console.log("end: DBReadyNow");	}
		 callback(err, "db connection error"); 
	     });	 
      },  
      function (callback) {
    	  // DELETE COLLECTION
    	   if(reset == "true") {
            if (DEBUG) { console.log ("start: delete %s collection", colname ); }
            db.dropCollection(colname, function(err) {
       	     if (err) {return callback(err, "delete collection error");}
             if (DEBUG) { console.log("end: delete %s collection", colname); }
       	     t2 = true;
       	     callback(err, "end: delete collection");
       	     callback(null);
             });
            }
            else {
             t2 = true;
             callback(null);
            }
      },
      function (callback) {
    	  if (reset == "true") {
          // CREATE COLLECTION
    	  if (DEBUG) { console.log ("start: create %s collection", colname); }
          db.createCollection(colname, function(err) {
       	   if (err) {return callback(err, "insert error");}
       	if (DEBUG) { console.log("end: create %s collection", colname); }
       	   t3 = true;
       	   callback(err, "end: create collection");
       	   callback(null);
         });
         }
          else
         {
           t3 = true;
           callback(null);
         }
      },
      function (callback) {
    	  // HANDLE 2 COLLECTION
    	  if (DEBUG) { console.log("start: getting handle to %s collection %s type", colname,type); }  
    	  if (type == "users") { 
    		  usersdocument = db.collection(colname);  
    		  t4 = true;
    		  if (DEBUG) { console.log("end: getting handle to %s collection",colname); }
    	   }
    	  else if (type == "tweets") { 
    		  tweetsdocument = db.collection(colname);  
    		  t5 = true; 
    		  if (DEBUG) { console.log("end: getting handle to %s collection",colname); }
    	   }
    	  else if (type == "mentions") { 
    		  mentionsdocument = db.collection(colname);  
    		  t6 = true; 
    		  if (DEBUG) { console.log("end: getting handle to %s collection",colname); }
    	   }
    	  else if (type == "count") { 
    		  countdocument = db.collection(colname);  
    		  t7 = true; 
    		  if (DEBUG) { console.log("end: getting handle to %s collection",colname); }
    	   }
    	  else if (type == "words") { 
    		  wordsdocument = db.collection(colname);  
    		  t8 = true; 
    		  if (DEBUG) { console.log("end: getting handle to %s collection",colname); }
    	   }
    	  callback(null,"end: getting handle to collection");  
      }]
	); //end async
}

function DBInsert(t1,t2,t3,type) {
	async.series([
	function (callback) {
		if (DEBUG) { console.log("start: ReadyNow"); }	 
		ReadyNow("insert", function (err) {
			 if (err) {return callback(err, "insert1 error");} 
			 if (DEBUG) { console.log("end: ReadyNow");	}
			 callback(err, "insert1 error"); 
		 });	 
	 },            
	 function (callback) {
		 var cmd;
		 if (DEBUG) { console.log("### start: insert "); }
		 if ((t2 != null) && (t3 != null)) {
			 DType(type).update(t1,t2,t3, function(err) {
				 if (err) {return callback(err, "insert error");}
				 if (DEBUG) { console.log("### end: insert"); }
				 COUNT ++;
				 callback(err, "end: insert");
			 });
		 } //end if
		 else
		 {
			 DType(type).insert(t1, function(err) {
				 if (err) {return callback(err, "insert error");}
				 if (DEBUG) { console.log("### end: insert"); }
				 COUNT ++;
				 callback(err, "end: insert");
			 });	 
		 } // end if
	  	}]
	); //end async
}

exports.DBFind =  function (condition,sort,limit,type,callback) {
	if ((t1) && (t2) && (t3) && (t4) && (t5) && (t6) && (t7) && (t8)) {
		 if (DEBUG) { console.log("### start: listing all entries"); }
		 DType(type).find(condition).sort(sort).limit(limit).toArray(function(err, docs) {
			   	if (err) {return callback(err, "list error");}
			   	if (DEBUG) { console.log("### end: listing all entries"); }
			   	callback(docs);
		   });
     }
};

exports.DBFindNoLimit =  function (condition,sort,type,callback) {
	if ((t1) && (t2) && (t3) && (t4) && (t5) && (t6) && (t7) && (t8))  {
		if (DEBUG) { console.log("### start: find klout score"); }
		 DType(type).find(condition).sort(q).toArray(function(err, docs) {
			    if (err) {return callback(err, "list error");}
			   	if (DEBUG) { console.log("### end: find klout score");}  
			   	callback(docs);
		   });
     }
}


exports.DBCount =  function (q,type,callback) {
	if ((t1) && (t2) && (t3) && (t4) && (t5) && (t6) && (t7) && (t8))  {
		if (DEBUG) { console.log("### start: find # entries"); }
		 DType(type).find(q).count(function(err, docs) {
			    if (err) {return callback(err, "count error");}
			   	if (DEBUG) { console.log("### end: find # entries");}  
			   	callback(docs);
		   });
     }
};


exports.DBAgg2 =  function (q1,q2,q3,limit,type,callback) {
if ((t1) && (t2) && (t3) && (t4) && (t5) && (t6) && (t7) && (t8))  {
	//TCOUNT ++;
	if (DEBUG) { console.log("### start: listing all entries"); }
	DType(type).aggregate([{$match:q1},
	                       {$group:q2},
	                       {$sort: q3},
	                       {$limit: limit}],function(err, docs) {	
							if (err) {return callback(err, "list error");}
							if (DEBUG) { console.log("### end: listing all entries"); }
							callback(docs);
	});
  }
};


//TODO:FIX	              
function DBCloseFIX(){
	async.series([
	function (callback) {
		if (DEBUG) { console.log("###start: close ready?"); }	 
		ReadyNow2("close", function (err) {
			if (err) {return callback(err, "error close");}
			if (DEBUG) { console.log("###end: checking ready?");	}
			callback(err, "close error"); 
		});	 
	},         
	function (callback) {
		if (DEBUG) { console.log("###start: closing connection"); }
		db.close();
		if (DEBUG) { console.log("###end: closing connection"); }      
	}],	     
	function (err, results){
		if (DEBUG) { console.log("err:", err , "return back values:", results); }
	}); 
}


function DBReadyNow (type,callback) {
	 if (DEBUG) { console.log("Is DB connections ready now?"); }
       setTimeout(function () {
        if (t1)  {
        	if (DEBUG) { console.log("db connection ready ..."); }
        	callback(); }
        else	
        {
        	if (DEBUG) { console.log("waiting for db connections setup ..."); }
        	setTimeout(arguments.callee, 10);
        }	
      }, 10);
}

function ReadyNow (type,callback) {
	 if (DEBUG) { console.log("Is DB connections and handles ready now?"); }
     setTimeout(function () {
               if ((t1) && (t2) && (t3) && (t4) && (t5) && (t6) && (t7) && (t8))  {
               	if (DEBUG) { console.log("db setup ready ..."); }
               	callback(); }
               else	
               	{
               	if (DEBUG) { console.log("waiting for db setup ..."); }
               	setTimeout(arguments.callee, 20);
               	}	
       }, 20);
}

function ReadyNow2 (type,callback) {
	if (DEBUG) { console.log("in ReadyNow2 checking"); }
    setTimeout(function () { 
            if ( ( COUNT === TCOUNT) && (t1) && (t3) && (t4) && (t5) && (t6) && (t7) && (t8)) {
            	console.log("db ready for CLOSING 123456789 ..."); 
             callback();
            }
    else 
            {
                    setTimeout(arguments.callee, 20);
        }   
    }, 20);  
}


exports.HW1 = function (input1,input2){
	console.log("%s %s from MongoDB 123",input1,input2);
};

// Alert if jobs are running behind by defined Back Log Factor (BLF)
setInterval(function() {
	if ((1 - COUNT/TCOUNT)*100 >= BLF) { 
		if (DEBUG) { console.log("%s  %d jobs => %d processed",TM.t("now","HH:mm:ss"),TCOUNT,COUNT); }
	}
}, 100); 

 
// Exports
exports.DBInsert = function (t1,t2,t3,type) { TCOUNT++; DBInsert(t1,t2,t3,type); }
