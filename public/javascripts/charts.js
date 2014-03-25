(function($){

////////////////////////////////////////////	
//Leader Board
this.UTweets= function(canvas){	
var obj = {};   
obj.canvas = canvas;
obj.drawLB = function(ss) {		   
	$('#leaderboard').animate({'background-color' : 'white', 'opacity': 1}, 1000);
	$("#leaderboard").empty(); 
	var result = JSON.parse(ss);
	$("#leaderboard").append(result);
   }  // obj.drawET	  
return obj;
}  // end constructor 



///////////////////////////////////////////
//Engaging Tweets
this.Tweets= function(canvas){      
var obj = {};   
obj.canvas = canvas;
obj.drawET = function(ss) {           
	$('#etweets').animate({'background-color' : 'white', 'opacity': 1}, 1000);
	$("#etweets").empty();
	var result = JSON.parse(ss);
	//http://jsfiddle.net/harishvc/9TxN8/5/  
	$("#etweets").append(result);
    }  // obj.drawET       
return obj;
}  // end constructor 

////////////////////////////////////////////////
//Bubble Chart
this.BubbleChart= function(canvas) { 
var obj = {};   
obj.canvas = canvas;
obj.drawBubbleChart = function(ss) {
	var diameter = 450,
	format = d3.format(",d"),
	color = d3.scale.category20c();
	var bubble = d3.layout.pack()
					.sort(null)
					.size([diameter, diameter])
					.padding(1.5);
	//Generate chart
	$("#usertz").empty();    
	var svg = d3.select($("#usertz")[0]).append("svg")
				.attr("width", diameter)
				.attr("height", diameter)
				.attr("class", "bubble");

	var node = svg.selectAll("g.node")
				  .data(bubble.nodes(classes(ss))
				  .filter(function(d) { return !d.children; }))
				  .enter().append("g")
				  .attr("class", "node")
				  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("title")
		.text(function(d) { return d.className + ": " + format(d.value); });

	node.append("circle")
		.attr("r", function(d) { return d.r; })
		// option 1
		.style("fill", function (d,i) { return color(i); });
		// option 1
		//.style("fill", function (d) { return color(d.size); });

	node.append("text")
		.attr("dy", ".3em")
		.style("text-anchor", "middle")
		.text(function(d) { return d.className.substring(0, d.r / 3); });
		//http://stackoverflow.com/questions/11007640/fit-text-into-svg-element-using-d3-js
		//.html(function(d) { return ( "<div style=mee>" + d.className.substring(0, d.r / 3) + "<br/> (" +  d.value + ")</div>" ); });

	//Returns a flattened hierarchy containing all leaf nodes under the root.
	function classes(ss) {
		var classes = [];
		function recurse(name, node) {
			if (node.children) {
                  node.children.forEach(function(child) { recurse(node.name, child); });
                  //node.children.forEach(function(child) { recurse(node.tz, child); });
            }
			else {
                  classes.push({packageName: name, className: node.name, value: node.size});
                  //classes.push({packageName: tz, className: node.tz, value: node.count});
             }
		}
		recurse(null, JSON.parse(ss));  
		return {children: classes};
	}
	d3.select(self.frameElement).style("height", diameter + "px");
	}// end drawBubbleChart
   return obj;
}  // end constructor 


///////////////////////////////////////////////////
//Horizontal bar chart
this.HBarChart = function(canvas){   
    var obj = {};
    obj.canvas = canvas;    
    //obj.canvas_width = canvas.width;
    //obj.canvas_height = canvas.height;
// called from client-app.js        
obj.drawHBarChart = function(ss,divid) {   
    var names = [ ];
    var hotdogs = [ ];      
    var result = JSON.parse(ss);
    for(var k in result) {
            names.push(result[k].name);
            hotdogs.push(result[k].score);
    }
    //console.log("names.length:", names.length);
    //obj.canvas.width = obj.canvas.width; // this clears the canvas       
    var chart;
    var width = 400;
    var bar_height = 20;
    var height = bar_height * names.length;
    var spacing = 220; //space between source and count
    var outside = 40;  // place count outside bar
    var left_width = 2; //left padding before source
    var gap = 2;
    var extra_width = 100;
    var x,y,yRangeBand;
    x = d3.scale.linear().domain([0, d3.max(hotdogs)]).range([0, width]);
    yRangeBand = bar_height + 2 * gap;
    y = function(i) { return yRangeBand * i; }      
    // Redraw
    //$("#mentions").empty();   
    $(divid).empty();   
    
    chart = d3.select($(divid)[0])
       .append('svg')
       .attr('class', 'chart')
       .attr('width', spacing + width + 40 + extra_width)
       .attr('height', (bar_height + gap * 2) * (names.length + 1))
       .append("g")
       .attr("transform", "translate(10,20");
     
     chart.selectAll("rect")
     .data(hotdogs)
     .enter().append("rect")
     .attr("x", spacing)
     .attr("y", function(d, i) { return y(i) + gap; })
     .attr("width", x)
     .attr("height", bar_height);
  
   chart.selectAll("text.score")
     .data(hotdogs)
     .enter().append("text")
     .attr("x", function(d) { return x(d) + spacing + outside ; })
     .attr("y", function(d, i){ return y(i) + yRangeBand/2; } )
     .attr("dx", -1)
     .attr("dy", ".36em")
     .attr("text-anchor", "end")
     .attr('class', 'score')
     .text(String);
  
   chart.selectAll("text.name")
     .data(names)
     .enter().append("text")
     .attr("x", left_width / 2)
     .attr("y", function(d, i){ return y(i) + yRangeBand/2; } )
     .attr("dy", ".36em")
     .attr("text-anchor", "start")
     .attr('class', 'name')
     .text(String);
   }  // obj.drawBar
 return obj;
 }  // end constructor 


///////////////////////////////////////////////
//TODO: Fix chart to have LONG legend (only 12 values NOW)
//Tweet Frequency
this.DonutChart= function(canvas) {	
var obj = {};   
obj.canvas = canvas;
//////////////////////////
obj.drawDonutChart = function(ss) {
	var width = 450,
	height = 200,
	radius = Math.min(width, height) / 2;
	
	var color = d3.scale.category20();
	//var color = d3.scale.ordinal()
//			               .range(["#98abc5", "#a05d56", "#d0743c", "#ff8c00"]);
	
	var arc = d3.svg.arc()
	.outerRadius(radius - 10)
	.innerRadius(radius - 70);
	
	var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) { return d.population; });
	
	//Generate chart
	$("#tfrequency").empty();
	
	var svg = d3.select($("#tfrequency")[0]).append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	//d3.csv("data.csv", function(error, data) {
	var result = JSON.parse(ss);
	var data = [];
	for(var k in result) {
		data.push({"age":result[k].tweets,"population":result[k].count});
			}	
		  	
		 data.forEach(function(d) {
		    d.population = +d.population;
		  });	

		 var fudge = -80;
		 var fudge2 = 15;
		 var fudge3 = -70;
		 var legend = svg.selectAll("g.arc")
		 .data(data)
		 .enter()
		 .append('g')
		 .attr('class', 'legend');

		 legend.append('rect')
		 .attr('x', 110)
		 .attr('y', function(d, i){ return ((i *  15) + fudge);})
		 .attr('width', 10)
		 .attr('height', 10)
		 .style('fill', function(d) { 
		 return color(d.age);
		 });

		 legend.append('text')
		 .attr('x', 125)
		 .attr('y', function(d, i){ return (i *  15) + fudge3;})
		 .text(function(d){ return (d.age +" (" + d.population + ")"); });

		 var g = svg.selectAll(".arc")
		      .data(pie(data))
		    .enter().append("svg:g")
		      .attr("class", "donutarc");

		  g.append("svg:path")
		      .attr("d", arc)
		      .style("fill", function(d) { return color(d.data.age); });

		  //g.append("text")
		    //  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		      //.attr("dy", ".35em")
		      //.style("text-anchor", "middle")
		      //.text(function(d) { return d.data.age; });
		//});		
	}// end drawDonutChart
	return obj;
  }  // end constructor 

////////////////////////////////////////////////////////
//Word Cloud
this.Words= function(canvas){	
	var obj = {};   
	obj.canvas = canvas;	
	//obj.canvas_width = canvas.width;
	//obj.canvas_height = canvas.height;
	var fill = d3.scale.category20();
	var chart;
	var width=700;
	var height=400;
	var fudge=25;  //default fudge factor
// called from client-app.js	
obj.drawWords = function(ss) {		  
	  var jWord = [];
	  var jCount = [];
	  // process values
	  var result = JSON.parse(ss);
  	   for(var k in result) {
  		   //var t1 = _.escape(k);
  		    jWord.push(result[k].word);
			jCount.push(result[k].count);
  	   }
	  
  	  //console.log(jWord.toString());
  	  //console.log(jCount.toString());
      
  	  d3.layout.cloud().size([width,height])
      .words(d3.zip(jWord, jCount).map(function(d) {
      return {text: d[0], size: d[1]};}))
      .padding(5)
      //.timeInterval(10)
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();
 }  // obj.drawWords
function draw(words) {
	// Redraw
	$("#wcloud").empty();
	// Generate using d3 
	chart = d3.select($("#wcloud")[0]).append("svg")
        .attr("width",width)
        .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }	  
return obj;
}  // end constructor










//////////////////////////////////////////
//Line Chart
this.Chart= function(canvas){   
var obj = {};   
obj.canvas = canvas;
var margin = {top: 20, right: 20, bottom: 40, left: 50};
var width = 500 - margin.left - margin.right;
var height = 250 - margin.top - margin.bottom;
var formatTime = d3.time.format("%H:%M:%S");
var parseDate = d3.time.format("%H:%M:%S").parse;
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
obj.drawChart = function(ss) {
	var data = [];
	var data2 = [];
	var result = JSON.parse(ss);
	result.forEach(function(k) {       
		data.unshift({"date": parseDate(k.time), "close": +k.total});
	});
	
	//console.log("###START###");
	//data.forEach(function(k) {       
	//console.log(k.date , k.close);
    //});
	//console.log("###END###");

	// Reset range based on data received
	x.domain(d3.extent(data, function(d) { return d.date; }));
	y.domain([0, d3.max(data, function(d) { return d.close; })]);            

	// Generate chart
	$("#lchart").empty();        

	var xAxis = d3.svg.axis()
    			  .scale(x)
    			  .orient("bottom")
    			  .ticks(5)
    			  .tickFormat(d3.time.format("%H:%M:%S"))
    			  .tickPadding(7);
    
	var yAxis = d3.svg.axis()
    			  .scale(y)
    			  .orient("left");
    			//.tickFormat(d3.format('.0f'))  //Remove decimal values
				//.ticks(5)
   
	var area = d3.svg.area()
    			 .x(function(d) { return x(d.date); })
    			 .y0(height)
    			 .y1(function(d) { return y(d.close); });


	var svg = d3.select($("#lchart")[0]).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("id","abcd")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("path")
		.datum(data)
		.attr("class", "area")
		.attr("d", area);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.text("Time (PSD)") 
		.attr("class", "digital")
		.attr("x", width / 2 )
		.attr("y",  height + margin.bottom - 190)  //200 fudge!
      //.attr("transform", "translate(" + (width / 3) + " ," + (height+100) + ")")
      //.attr('stroke', 'black')
      //.attr("dy", "1em") 
      .style("text-anchor", "middle");  

	svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .text("Tweets / Second") 
      .attr("class", "digital")
      //.attr('stroke', 'black')
      .attr("transform", "rotate(-90)")
      .attr("y", 0 -  (margin.left/2 + 10))
      .attr("x", 0 -  (height / 2))
      //.attr("dy", "1em") 
      .style("text-anchor", "middle");

	var elem = svg.selectAll("CircleText").data(data2);
	var elemEnter = elem.enter()
						.append("g")
						.attr("transform", function(d){return "translate("+ x(d.date) + "," + y(d.close) + ")" });

	// Circle for each data point
	var circle = elemEnter.append("circle")
						  .attr("r", 10)
						  .attr("stroke","black")
						  .attr("fill", "white")
						  // Text for each data point
						  elemEnter.append("text")
						  .attr("dx",-4)
						  .attr("dy", 3)        
						  .text(function(d){return d.label})
}; // end drawChart


obj.drawChartCircle = function(ss) { 
	data2.length = 0;
	var result = JSON.parse(ss);
	for(var k in result) {
		//console.log("got....",result[k].date, result[k].label, result[k].close);
		data2.push({"date": parseDate(result[k].date), "close": result[k].close, "label": result[k].label})
		//console.log("added to data2 ....",parseDate(result[k].date), result[k].label, result[k].close);
        };
                
     // Append generated SVG to chart SVG
     //d3.select("#abcd").select(function() {
      //return this.appendChild(document.getElementById("overlay"))});
    
     // Remove generated SVG    
     //$("#chartcircle").empty();      
        
};  // end drawCircle
return obj;


};  // end constructor





})(jQuery);




//////////////////////////////

