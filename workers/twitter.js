var twitter = require('ntwitter');
var credentials = require('../config/twitter-credentials.js');
var salconfig = require('../config/appconfig.js');
var MongoDB = require('./mongodb.js');
var TM = require('./time.js');
var S = require('string');
var natural = require('natural');
var ntotal2;
var DEBUG = salconfig.TDEBUG;

exports.TW = function(terms, ShowID, RunningTime, ShowStart) {
    var UDC = "users-" + ShowID;
    var TDC = "tweets-" + ShowID;
    var MDC = "mentions-" + ShowID;
    var CDC = "count-" + ShowID;
    var WDC = "words-" + ShowID;
    MongoDB.DBConnect();
    //salconfig.MongoDBDelete = true  //Delete collection and create new one
    MongoDB.DBStart(UDC, "users", salconfig.MongoDBDelete);
    MongoDB.DBStart(TDC, "tweets", salconfig.MongoDBDelete);
    MongoDB.DBStart(MDC, "mentions", salconfig.MongoDBDelete);
    MongoDB.DBStart(CDC, "count", salconfig.MongoDBDelete);
    MongoDB.DBStart(WDC, "words", salconfig.MongoDBDelete);

    // Get Twitter developer credentials
    var t = new twitter({
        consumer_key: credentials.consumer_key,
        consumer_secret: credentials.consumer_secret,
        access_token_key: credentials.access_token_key,
        access_token_secret: credentials.access_token_secret
    });

    //Insert TMP
    // 1000 mili seconds = 1 second
    setInterval(function() {
    MongoDB.DBInsert({time:TM.t("now","HH:mm:ss"),total:ntotal2},null,null,"count");
    ntotal2 = 0;  
    }, 1000 * 60);

    //https://dev.twitter.com/docs/api/1.1/post/statuses/filter
    //https://dev.twitter.com/docs/streaming-apis/parameters#locations
    if (DEBUG) { console.log("Connecting to twitter stream ..."); }
    
    //Geo bounding box
    //var Sochi = "43.58,39.72,43.60, 39.74";
    
    //t.stream('statuses/filter', {track: terms,locations: Sochi}, function(stream) {stream.on('data', function(tweet) {
     t.stream('statuses/filter',{track:terms}, function(stream) { stream.on('data',function(tweet) {
    	
    //Tweets Per Minute (TPM)
    ntotal2++;
    	
    //Big Filter: Ignore tweets without terms (due to geo) 
    //if (tweet.text.indexOf(terms[0]) > -1) 
    //	{
            //console.log("IGNORE ....", tweet.text);
            //console.log(">>>",tweet.text);

            // Processing each tweet
            if (DEBUG) {
                console.log("https://twitter.com/%s/status/%s", tweet.user.screen_name, tweet.id_str);
            }
            // Tweet specific stats
            var UD = {}; // user details
            var TD = {}; // tweet details
            var TPD = {}; //tweet parent details
            var TParent = false;
            var TParentstatusURL = "";
            var utz = "";
            var statusURL = "";
            var TRT = 0;
            var TFav = 0;
            var TReply = 0;
            var TScore = 0;
            var TPRT = 0;
            var TPFav = 0;
            var TPScore = 0;
            var URT = 0;
            var UReply = 0;
            var UScore = 0;
            var MediaURL = "N/A";
            var MediaW = 0;
            var MediaH = 0;

            
            //Handle null timezone
            (tweet.user.time_zone != null) ? (utz = tweet.user.time_zone) : (utz = "N/A");
            
            //Handle Media URL
            if ((tweet.entities['media'] != null) && (tweet.entities['media'].length > 0)) {
                if ((tweet.entities['media'][0].type == "photo") && (tweet.entities['media'][0].sizes.thumb.w != null)) {
                    MediaURL = tweet.entities['media'][0].media_url;
                    MediaW = tweet.entities['media'][0].sizes.thumb.w;
                    MediaH = tweet.entities['media'][0].sizes.thumb.h;
                }
            }
            
            // Generate Status URL
            statusURL = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
            (tweet.retweeted_status != null) ? TParentstatusURL = "https://twitter.com/" + tweet.retweeted_status.user.screen_name + "/status/" + tweet.retweeted_status.id_str : TParentstatusURL = "";

            (tweet.retweet_count != 0) ? TRT = tweet.retweet_count : TRT = 0;
            (tweet.favorite_count != 0) ? TFav = tweet.favorite_count : TFav = 0;
            (tweet.in_reply_to_status_id_str != null) ? TReply = 1 : TReply = 0;
            //Calculate Score
            TScore = TRT + TFav + TReply;
            
            (tweet.retweeted_status != null) ? TParent = true : TParent = false;
            (tweet.retweeted_status != null) ? TPRT = tweet.retweeted_status.retweet_count : TPRT = 0;
            (tweet.retweeted_status != null) ? TPFav = tweet.retweeted_status.favorite_count : TPFav = 0;
            TPScore = TPRT + TPFav;


            var UNT = 1; //User New Tweet
            (tweet.in_reply_to_status_id_str != null) ? UReply = 1 : UReply = 0;
            (tweet.retweeted_status != null) ? URT = 1 : URT = 0;
            UScore = UNT + (UReply * 1.25) + (URT * 0.25);

            TD = {
                id: tweet.id_str,
                //score:1,
                text: tweet.text,
                surl: statusURL,
                name: tweet.user.name,
                screen_name: tweet.user.screen_name,
                pic: tweet.user.profile_image_url,
                source: S(tweet.source).stripTags().s,
                created_at: tweet.created_at,
                time: TM.twitter(tweet.created_at)
            };

            UD = {
                id: tweet.user.id_str,
                name: tweet.user.name,
                screen_name: tweet.user.screen_name,
                pic: tweet.user.profile_image_url,
                mentions: 0,
                source: S(tweet.source).stripTags().s,
                klout: 1,
                topics: "TBD",
                tz: utz
            };
 
            MongoDB.DBInsert(UD, { $inc: {score: UScore,nt: 1,reply: UReply,rt: URT}}, {upsert: true}, "users");
            MongoDB.DBInsert(TD, {$set: {rt: TRT,fav: TFav,reply: TReply,murl: MediaURL,mw: MediaW,mh: MediaH,score: TScore}}, {upsert: true}, "tweets");
            if ((TParent) && ((TM.twitter(tweet.retweeted_status.created_at) >= ShowStart))) {
                TPD = {
                    id: tweet.retweeted_status.id_str,
                    //score:1,
                    text: tweet.text,
                    surl: TParentstatusURL,
                    name: tweet.retweeted_status.user.name,
                    screen_name: tweet.retweeted_status.user.screen_name,
                    pic: tweet.retweeted_status.user.profile_image_url,
                    source: S(tweet.retweeted_status.source).stripTags().s,
                    created_at: tweet.retweeted_status.created_at,
                    time: TM.twitter(tweet.retweeted_status.created_at)
                };
            MongoDB.DBInsert(TPD, {$set: {rt: TPRT,fav: TPFav,reply: TReply,murl: MediaURL,mw: MediaW,mh: MediaH,score: TPScore}}, {upsert: true}, "tweets");
            } else if ((TParent) && ((TM.twitter(tweet.created_at) < ShowStart))) {
                //console.log("Ignoring: %s",tweet.retweeted_status.id_str);	
            }

            //Handle Mentions
            // http://stackoverflow.com/questions/8449659/parsing-json-array-nodejs
            if (tweet.entities['user_mentions'].length > 0) {
                for (var ii = 0; ii < tweet.entities['user_mentions'].length; ii++) {
                    MongoDB.DBInsert({screen_name: tweet.entities['user_mentions'][ii].screen_name}, {$inc: {score: 1}}, {upsert: true}, "mentions");
                    MongoDB.DBInsert({screen_name: tweet.entities['user_mentions'][ii].screen_name}, {$inc: {mentions: 1,score: 1}}, {upsert: false}, "users");
                }
            }

            //Handle HashTags
            if (tweet.entities['hashtags'].length > 0) {
                for (var ii = 0; ii < tweet.entities['hashtags'].length; ii++) {
                    //Only store hashtags that are different that the term!
                	if (natural.JaroWinklerDistance(tweet.entities['hashtags'][ii].text, terms[0]) >= 0.80) {
                		if (DEBUG) { console.log("ignoring .... ", tweet.entities['hashtags'][ii].text); }
                    } else {
                    MongoDB.DBInsert({word: tweet.entities['hashtags'][ii].text}, {$inc: {count: 1}}, {upsert: true}, "words");
                    }
                }
            }
         //} //end BIG filter
        
        }); // end stream.on('data')

        // https://github.com/mileszim/twat
        stream.on('error', function(err) {
            //TODO: Print detailed error info
            console.log("ntwitter: caught error");
            if (err.text !== undefined) {
                console.log(err.stack);
            }
        });
        stream.on('reconnect', function(info) {
            console.log("ntwitter: caught reconnect");
        });
        stream.on('end', function(response) {
            console.log("ntwitter: caught end");
        });
        stream.on('destroy', function(msg) {
            console.log("ntwitter: caught destroy");
        });

        //WORKS	
        // close stream after running time
        setTimeout(function() {
            console.log('closing twitter stream ....');
            stream.destroy();
            console.log('closed twitter stream ....');
            //TODO: Close DB Connection
            //console.log('start: closing db connection');
            //MongoDB.DBClose();
            //console.log('end: closing db connection');
            // Kue complete
            //console.log("kue job complete: ",moment().zone(+8).format("HH:mm:ss"));
            //done();
        }, RunningTime);

    }); // end t.stream (statuses/filter)

}; //end exports.TW
