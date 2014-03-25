	var leaderboard = UTweets(document.getElementById('leaderboard'));
	var socket = io.connect(window.location.hostname);
	socket.on("time", function(data) {
		$("#" + data.key).html(data.count);
	});
	socket.on("leaderboard", function(aa) {
		leaderboard.drawLB(aa);
	});
        socket.emit('chart', { type: 'LEADERBOARD' });
