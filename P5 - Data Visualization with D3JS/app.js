//d3.tsv<CalorimeterData>("data/sensor1.tsv", (d):CalorimeterData => { return new CalorimeterData(d); }, buildCalorimeterCharts);
d3.json("data/2015-07-17-cal-15230001024015.json", buildCalorimeterCharts);
function buildCalorimeterCharts(error, responseData) {
    var margin = { top: 20, right: 20, bottom: 30, left: 50 }, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
    var data = [];
    for (var i in responseData.content) {
        var item = responseData.content[i];
        data.push(new CalorimeterData(item, i));
    }
    var x = d3.time.scale()
        .range([0, width]);
    var xGradient = d3.time.scale()
        .range([0, 100]);
    var y = d3.scale.linear()
        .range([height, 0]);
    var colors = ["red", "white", "green"];
    var color = d3.scale.linear()
        .domain(d3.extent(data, function (d) { return d.temp_delta; }))
        .range(colors);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    var area = d3.svg.area()
        .x(function (d) { return x(d.date); })
        .y0(function (d) { return y(d.temp_o); })
        .y1(function (d) { return y(d.temp_i); });
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    if (error)
        throw error;
    xGradient.domain(d3.extent(data, function (d) { return d.date; }));
    x.domain(d3.extent(data, function (d) { return d.date; }));
    y.domain([0, d3.max(data, function (d) { return d.temp_i; })]);
    svg.append("linearGradient")
        .attr("id", "temperature-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", width).attr("y2", 0)
        .selectAll("stop")
        .data(data)
        .enter().append("stop")
        .attr("offset", function (d) { return xGradient(d.date) + "%"; })
        .attr("stop-color", function (d) { return color(d.temp_delta); });
    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
        .style("fill", "url(#temperature-gradient)");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature");
}
var CalorimeterData = (function () {
    function CalorimeterData(row, dateString) {
        var parseDate = d3.time.format.iso.parse;
        this.date = parseDate(dateString);
        this.temp_i = +row["temp-i_C"];
        this.temp_o = +row["temp-o_C"];
        this.flowrate = +row["flowrate_lm"];
        this.temp_delta = this.temp_o - this.temp_i;
    }
    return CalorimeterData;
})();
