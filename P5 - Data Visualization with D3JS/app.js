d3.tsv("data/sensor1.tsv", function (d) { return new CalorimeterData(d); }, buildCalorimeterCharts);
function buildCalorimeterCharts(error, data) {
    var margin = { top: 20, right: 20, bottom: 30, left: 50 }, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
    var x = d3.time.scale()
        .range([0, width]);
    var y = d3.scale.linear()
        .range([height, 0]);
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
    x.domain(d3.extent(data, function (d) { return d.date; }));
    y.domain([0, d3.max(data, function (d) { return d.temp_i; })]);
    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);
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
    function CalorimeterData(row) {
        var parseDate = d3.time.format.iso.parse;
        this.date = parseDate(row["date"]);
        this.temp_i = +row["temp_i"];
        this.temp_o = +row["temp_o"];
        this.flowrate = +row["flowrate"];
    }
    return CalorimeterData;
})();
