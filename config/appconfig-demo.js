var appconfig = {
 port: 80,                         //port to start express
 title: "My Title",   //enter title
 environment: "development",
 logstatus: "false",               // debug flag
 loglevel: 1,                      //debug level
 MONGOURL: "mongodb://username:pass@abcd.mongohq.com:12345/db",
 MongoDBDocumentSuffix: "something-meaningful",
 MongoDBDelete: "true",             //false=DON'T DELETE
 StatusUpdate: 1000 * 60,           //1 minute
 RunningTime: 1000 * 60 * 60 * 4,  // 4 hours
 DelayTime:  0,                     // 0 minutes, NOW
 LeaderBoardLimit: 10,
 TweetLimit: 5,
 MentionsLimit: 15,
 SourceLimit: 10,
 TZLimit: 15,
 TFrequencyLimit: 10,
 WordCloudLimit: 45,
 NormalizeLimit: 100,
 MediaLimit: 50,
 SDEBUG: false,
 TDEBUG: false,
 MONGODEBUG: false,
 DBTDEBUG: false
};

module.exports = appconfig;
