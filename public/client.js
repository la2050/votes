// client-side js
// run by the browser each time your view template is loaded

(function(){

  fetch('/data/')
    .then(function(response) {
      return response.json()
    })
    .then(function(myJson) {
      //parseData(myJson)
      let totals = (myJson)
      showChart(totals)
    })
    .catch(function(error) {
      console.error(error)
    })

  function showChart(totals) {
    const goals = ['learn', 'create', 'play', 'connect', 'live']

    goals.forEach(function(goal) {
      console.log('goal: ' + goal);

    var margin = {top: 20, right: 20, bottom: 70, left: 40},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%Y-%m").parse;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom") 
        //.tickFormat(d3.time.format("%Y-%m"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        //  .ticks(10);

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 600 + margin.top + margin.bottom)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // d3.csv("bar-data.csv", function(error, data) {

    var data = totals[goal]

      x.domain(data.map(function(d) { return d.finalist; }));
      y.domain([0, d3.max(data, function(d) { return d.votes; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          //.text("Value ($)");


      let color
      switch(goal) {
        case 'learn':
          color = 'rgb(6, 179, 188)' // ; /* @blueberry */
          break
        case 'create':
          color = 'rgb(255, 194, 51)' //; /* @banana */
          break
        case 'play':
          color = 'rgb(237, 59, 136)' //; /* @strawberry */
          break
        case 'connect':
          color = 'rgb(249, 160, 51)' //; /* @tangerine */
          break
        case 'live':
          color = 'rgb(141, 208, 59)' //; /* @lime */
          break
        default:
          color = 'gray'
      }

      svg.selectAll("bar")
          .data(data)
        .enter().append("rect")
          .style("fill", color)
          .attr("x", function(d) { return x(d.finalist); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.votes); })
          .attr("height", function(d) { return height - y(d.votes); });

    // });

    })

  }

})()