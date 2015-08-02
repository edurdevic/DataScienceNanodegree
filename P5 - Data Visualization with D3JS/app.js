//d3.tsv<CalorimeterData>("data/sensor1.tsv", (d):CalorimeterData => { return new CalorimeterData(d); }, buildCalorimeterCharts);
d3.json("data/2015-07-17-cal-15230001024015.json", buildCalorimeterCharts);
function buildCalorimeterCharts(error, responseData) {
    var data = CalorimeterData.parseJsonToArray(responseData);
    var chart = new CalorimeterChart(data);
    chart.draw(".onOffChart");
}
var Constants = (function () {
    function Constants() {
    }
    Constants.waterSpecificHeat = 4.186;
    return Constants;
})();
var CalorimeterChart = (function () {
    function CalorimeterChart(data) {
        var _this = this;
        this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
        this.width = 960 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.colors = ["#0000A0", "white", "#E42217"];
        this.data = data;
        this.xScale = d3.time.scale()
            .range([0, this.width])
            .domain(d3.extent(data, function (d) { return d.date; }));
        this.xGradientScale = d3.time.scale()
            .range([0, 100])
            .domain(d3.extent(data, function (d) { return d.date; }));
        this.yScale = d3.scale.linear()
            .range([this.height, 0])
            .domain([0, d3.max(data, function (d) { return d.temp_i; })]);
        var minThermicPower = d3.min(data, CalorimeterData.getThermicPower);
        var maxThermicPower = d3.max(data, CalorimeterData.getThermicPower);
        var thermicPowerExtension = Math.max(Math.abs(minThermicPower), Math.abs(maxThermicPower));
        this.colorScale = d3.scale.linear()
            .domain([-thermicPowerExtension, 0, thermicPowerExtension])
            .range(this.colors);
        this.xAxis = d3.svg.axis()
            .scale(this.xScale)
            .orient("bottom");
        this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left");
        this.area = d3.svg.area()
            .x(function (d) { return _this.xScale(d.date); })
            .y0(function (d) { return _this.yScale(d.temp_o); })
            .y1(function (d) { return _this.yScale(d.temp_i); });
    }
    CalorimeterChart.prototype.draw = function (selector) {
        var self = this;
        var svg = d3.select(selector)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        svg.append("linearGradient")
            .attr("id", "temperature-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", this.width).attr("y2", 0)
            .selectAll("stop")
            .data(this.data)
            .enter().append("stop")
            .attr("offset", function (d) { return self.xGradientScale(d.date) + "%"; })
            .attr("stop-color", function (d) { return self.colorScale(CalorimeterData.getThermicPower(d)); });
        svg.append("path")
            .datum(this.data)
            .attr("class", "area")
            .attr("d", this.area)
            .style("fill", "url(#temperature-gradient)");
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis)
            .append("text")
            .attr("y", -16)
            .attr("x", this.width)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Time");
        ;
        svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Temperature");
    };
    return CalorimeterChart;
})();
var CalorimeterData = (function () {
    function CalorimeterData(row, dateString) {
        var parseDate = d3.time.format.iso.parse;
        this.date = parseDate(dateString);
        this.temp_i = +row["temp-i_C"];
        this.temp_o = +row["temp-o_C"];
        this.flowrate = +row["flowrate_lm"] / 60 / 1000;
        this.temp_delta = this.temp_o - this.temp_i;
    }
    CalorimeterData.getThermicPower = function (d) {
        return d.temp_delta * d.flowrate * Constants.waterSpecificHeat * 1000000;
    };
    CalorimeterData.parseJsonToArray = function (json) {
        var data = [];
        for (var i in json.content) {
            var item = json.content[i];
            data.push(new CalorimeterData(item, i));
        }
        return data;
    };
    return CalorimeterData;
})();
