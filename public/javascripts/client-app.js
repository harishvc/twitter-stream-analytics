function main() {
	var leaderboard = UTweets(document.getElementById('leaderboard'));
	//var lchart = Chart(document.getElementById('lchart'));
	var etweets = Tweets(document.getElementById('etweets'));
	var usertz = HBarChart(document.getElementById('usertz'));
	var mentions = HBarChart(document.getElementById('mentions'));
	var source = HBarChart(document.getElementById('source'));
	var tfrequency = DonutChart(document.getElementById('tfrequency'));
	var wcloud = Words(document.getElementById('wcloud'));
	
	var socket = io.connect(window.location.hostname);
        socket.emit('chart', { type: 'ALL' }); 
	 
	// Time, Tweets stats
	socket.on("time", function(data) {
		$("#" + data.key).html(data.count);
		
		if (data.key == "photogrid") { collage(); }
		//socket.emit('b1', { my: 'data' });
	});
	
	// Leader Board
	socket.on("leaderboard", function(aa) {
		leaderboard.drawLB(aa);
	});

	//socket.on("lchart", function(aa) {
      //  lchart.drawChart(aa);
    //});

	socket.on("etweets", function(aa) {    
        etweets.drawET(aa); 
    });

	socket.on("usertz", function(aa) {
		usertz.drawHBarChart(aa,"#usertz");
	});
	
   socket.on("mentions", function(aa) {
       mentions.drawHBarChart(aa,"#mentions"); 
    });

   socket.on("source", function(aa) {
       source.drawHBarChart(aa,"#source"); 
    });
   
   socket.on("tfrequency", function(aa) {
       tfrequency.drawDonutChart(aa);
   });
    
   socket.on("wcloud", function(aa) {
     wcloud.drawWords(aa); 
   });    

}



$(document).ready(function() {
	main();
});
