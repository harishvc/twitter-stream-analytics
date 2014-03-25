Generate real-time analytics from Twitter Streaming API using Node.js, MongoDB  & d3

## App Layout
````
-config             // config files
-node_modules       //node_modules
-public             //css & js
-view               //ejs template files
-server.js         // Express3 server
-workers           // libraries - moment, mongodb, twitter
````

## Step 1: Join Twitter Developer
Visit <a href="http://dev.twitter.com">Twitter Developer</a>. Register your app and generate API keys.


## Steps 2: Configure the app
Rename config/appconfig-demo.js as config/appconfig.js
```
port: 80,                          //port to start express
title: "My Title",                //enter title
environment: "development",
logstatus: "false",               // debug flag
loglevel: 1,                      //debug level
MONGOURL: "mongodb://username:pass@abcd.mongohq.com:12345/db",      
MongoDBDocumentSuffix: "something-meaningful",    //create collections
MongoDBDelete: "true",             //false=DON'T DELETE
StatusUpdate: 1000 * 60,           //1 minute
RunningTime: 1000 * 60 * 60 * 4,  // 4 hours
DelayTime:  0,                     // 0 minutes, NOW
//Set limits
LeaderBoardLimit: 10,               
TweetLimit: 5,
MentionsLimit: 15,
SourceLimit: 10, 
TZLimit: 15,
TFrequencyLimit: 10,
WordCloudLimit: 45,
NormalizeLimit: 100,
MediaLimit: 50,
SDEBUG: false,                    //Debug flag for server.js                       
TDEBUG: false,                    //Debug flags for twitter.js
MONGODEBUG: false,                //Debug flags for mongodb.js
DBTDEBUG: false                   //Debug flags for dbTrainman.js
````
Rename config/twitter-credentials-demo.js as config/twitter-credentials.js and provide your API keys
````
consumer_key: "something",
consumer_secret: "something",
access_token_key: "something",
access_token_secret: "soemthing"
````

## Step 3: Deploy the app
````
$> sudo node server.js  //using sudo since running on port 80
````

## Examples:
<a href="http://harishvc.com/2014/02/10/sochi2014-day4/">Sochi 2014: Day 4 Twitter Report</a>
<br/>
<a href="http://harishvc.com/2014/02/02/sb48/">SuperBowl 48: Halftime Twitter Report</a>


## Author: 
Harish Chakravarthy (twitter.com/harishvc)


