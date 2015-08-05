d3.json("data/2015-07-17-cal-15230001024015.json", buildCalorimeterOnOffCharts);
d3.json("data/2015-07-17-cal-15230008024018.json", buildCalorimeterInverterCharts);
function buildCalorimeterOnOffCharts(error, responseData) {
    var data = CalorimeterData.parseJsonToArray(responseData);
    var chart = new CalorimeterChart(data);
    chart.draw(".onOffChart", 1);
}
function buildCalorimeterInverterCharts(error, responseData) {
    var data = CalorimeterData.parseJsonToArray(responseData);
    var chart = new CalorimeterChart(data);
    chart.draw(".inverterChart", 2);
}
var Constants = (function () {
    function Constants() {
    }
    Constants.waterSpecificHeat = 4.186; // [J/(g*C)]
    return Constants;
})();
// Class responsible for creating and rendering the chart
var CalorimeterChart = (function () {
    function CalorimeterChart(data) {
        var _this = this;
        // setup chart global sizes
        this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
        this.width = 800 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.legendRectSize = 18;
        this.legendSpacing = 4;
        this.legendTextSize = 50;
        this.tooltipVerticalSpacing = 12;
        this.tooltipVerticalOffset = 10;
        //                    EarthBlue   white    LoveRed
        this.colors = ["#0000A0", "white", "#E42217"];
        this.data = data;
        // ----
        // Initializing scales
        this.xScale = d3.time.scale()
            .range([0, this.width])
            .domain(d3.extent(data, function (d) { return d.date; }));
        // Greadient x scale is expressed in %
        this.xGradientScale = d3.time.scale()
            .range([0, 100])
            .domain(d3.extent(data, function (d) { return d.date; }));
        this.yScale = d3.scale.linear()
            .range([this.height, 0])
            .domain([0, d3.max(data, function (d) { return d.temp_i; })]);
        // Power color scale
        this.minThermicPower = d3.min(data, CalorimeterData.getThermicPower);
        this.maxThermicPower = d3.max(data, CalorimeterData.getThermicPower);
        var thermicPowerExtension = Math.max(Math.abs(this.minThermicPower), Math.abs(this.maxThermicPower));
        // The domain spans for the maximum extension in both positive and negative domain
        // to avoid misleading colors if the positive and negative spans are unbalanced
        this.colorScale = d3.scale.linear()
            .domain([-thermicPowerExtension, 0, thermicPowerExtension])
            .range(this.colors);
        // ----
        // Initializing Axis
        this.xAxis = d3.svg.axis()
            .scale(this.xScale)
            .orient("bottom");
        this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left");
        // ----
        // Initializing graphic elements
        this.area = d3.svg.area()
            .x(function (d) { return _this.xScale(d.date); })
            .y0(function (d) { return _this.yScale(d.temp_o); })
            .y1(function (d) { return _this.yScale(d.temp_i); });
        this.lineTemp_o = d3.svg.line()
            .x(function (d) { return _this.xScale(d.date); })
            .y(function (d) { return _this.yScale(d.temp_o); });
        this.lineTemp_i = d3.svg.line()
            .x(function (d) { return _this.xScale(d.date); })
            .y(function (d) { return _this.yScale(d.temp_i); });
    }
    // Draws the chart into the <svg> element selected by the selector string.
    // The id should be unique for the charts in the same page.
    CalorimeterChart.prototype.draw = function (selector, id) {
        var self = this;
        // Appends the main <g> element
        var svg = d3.select(selector)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        // Creates the color gradient
        svg.append("linearGradient")
            .attr("id", "temperature-gradient" + id)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", this.width).attr("y2", 0)
            .selectAll("stop")
            .data(this.data)
            .enter().append("stop")
            .attr("offset", function (d) { return self.xGradientScale(d.date) + "%"; })
            .attr("stop-color", function (d) { return self.colorScale(CalorimeterData.getThermicPower(d)); });
        // Appends the area with gradient fill
        svg.append("path")
            .datum(this.data)
            .attr("class", "area")
            .attr("d", this.area)
            .style("fill", "url(#temperature-gradient" + id + ")");
        // Temo_i line
        svg.append('svg:path')
            .attr('d', this.lineTemp_i(this.data))
            .attr('stroke', 'blue')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5)
            .attr('fill', 'none');
        // Temo_o line
        svg.append('svg:path')
            .attr('d', this.lineTemp_o(this.data))
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5)
            .attr('fill', 'none');
        // X axis
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
        // Y axis
        svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("x", -10)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Temperature [C]");
        // legend
        var legend = svg.selectAll('.legend')
            .data([this.minThermicPower, 0, this.maxThermicPower].sort().reverse())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) {
            var height = self.legendRectSize + self.legendSpacing;
            var offset = height * self.colorScale.domain().length / 2;
            var horz = self.width - self.legendTextSize - self.legendRectSize;
            var vert = i * height;
            return 'translate(' + horz + ',' + vert + ')';
        });
        // Legend color box
        legend.append('rect')
            .attr('width', self.legendRectSize)
            .attr('height', self.legendRectSize)
            .style('fill', self.colorScale)
            .style('stroke', 'gray')
            .attr('stroke-width', 1);
        // Legend color power text
        legend.append('text')
            .attr('x', self.legendRectSize + self.legendSpacing + self.legendTextSize)
            .attr('y', self.legendRectSize - self.legendSpacing)
            .style('text-anchor', 'end')
            .text(function (d) { return (d / 1000).toFixed(1) + " kW"; });
        // legend line temp_i
        var legend2 = svg
            .append('g')
            .attr('class', 'legend_temp')
            .attr('transform', 'translate(' + (self.width - self.legendTextSize - self.legendRectSize) + ',' + ((self.legendRectSize + self.legendSpacing) * 4) + ')');
        legend2.append('line')
            .attr('x1', 0)
            .attr('y1', self.legendRectSize / 2)
            .attr('y2', self.legendRectSize / 2)
            .attr('x2', self.legendRectSize)
            .style('stroke', 'blue')
            .attr('stroke-width', 1);
        legend2.append('text')
            .attr('x', self.legendSpacing + self.legendRectSize)
            .attr('y', self.legendRectSize - self.legendSpacing)
            .text("temp_i");
        // legend line temp_o
        var legend2 = svg
            .append('g')
            .attr('class', 'legend_temp')
            .attr('transform', 'translate(' + (self.width - self.legendTextSize - self.legendRectSize) + ',' + ((self.legendRectSize + self.legendSpacing) * 5) + ')');
        legend2.append('line')
            .attr('x1', 0)
            .attr('y1', self.legendRectSize / 2)
            .attr('y2', self.legendRectSize / 2)
            .attr('x2', self.legendRectSize)
            .style('stroke', 'black')
            .attr('stroke-width', 1);
        legend2.append('text')
            .attr('x', self.legendSpacing + self.legendRectSize)
            .attr('y', self.legendRectSize - self.legendSpacing)
            .text("temp_o");
        // ----
        // Mouse interaction line and tooltip
        var verticalLineGroup = svg
            .append("g")
            .attr('class', 'verticalLineGroup');
        var verticalLine = verticalLineGroup
            .append("line")
            .attr("class", "verticalLine")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", self.height)
            .style("height", self.height)
            .style("top", self.margin.top)
            .style('stroke', 'gray')
            .attr('stroke-width', 0.5);
        // Interactive tooltip
        var tooltip = verticalLineGroup
            .append("g")
            .attr("class", "tooltip")
            .attr("fill", "black")
            .attr("transform", "translate(5," + self.tooltipVerticalOffset + ")");
        var tooltipTime = tooltip
            .append("text")
            .attr("class", "time")
            .attr("x", 0)
            .attr("y", self.tooltipVerticalSpacing * 0);
        var tooltipPower = tooltip
            .append("text")
            .attr("class", "power")
            .attr("x", 0)
            .attr("y", self.tooltipVerticalSpacing * 1);
        var tooltipTemp_i = tooltip
            .append("text")
            .attr("class", "temp_i")
            .attr("x", 0)
            .attr("y", self.tooltipVerticalSpacing * 2);
        var tooltipTemp_o = tooltip
            .append("text")
            .attr("class", "temp_o")
            .attr("x", 0)
            .attr("y", self.tooltipVerticalSpacing * 3);
        var tooltipFlowrate = tooltip
            .append("text")
            .attr("class", "flowrate")
            .attr("x", 0)
            .attr("y", self.tooltipVerticalSpacing * 4);
        // Mouse move event handler
        d3.select(selector)
            .on("mousemove", function () {
            var mousex = d3.mouse(this)[0] - self.margin.left;
            verticalLineGroup.attr('transform', 'translate(' + (mousex) + ',0)');
            var time = self.xScale.invert(mousex);
            var calorimeterReading = CalorimeterData.getElementAtDate(self.data, time);
            tooltipTime.text("time: " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());
            // Transforming power from W to kW
            tooltipPower.text("power: " + (calorimeterReading.thermicPower / 1000).toFixed(1) + " kW");
            tooltipTemp_i.text("temp_i: " + calorimeterReading.temp_i + " C");
            tooltipTemp_o.text("temp_o: " + calorimeterReading.temp_o + " C");
            // Transforming m3/s to l/min
            tooltipFlowrate.text("flowrate: " + (calorimeterReading.flowrate * 60000).toFixed(1) + " l/min");
        });
    };
    return CalorimeterChart;
})();
// Class containing a single calorimeter data point
var CalorimeterData = (function () {
    function CalorimeterData(row, dateString) {
        var parseDate = d3.time.format.iso.parse;
        this.date = parseDate(dateString);
        this.temp_i = +row["temp-i_C"];
        this.temp_o = +row["temp-o_C"];
        this.flowrate = +row["flowrate_lm"] / 60 / 1000; //conversion from l/min to m3/s
        this.temp_delta = this.temp_o - this.temp_i;
        this.thermicPower = CalorimeterData.getThermicPower(this);
    }
    CalorimeterData.getThermicPower = function (d) {
        //        [C]       *  [m3/s]    *        [J/(g*C)]            * [m3 -> g] =  [J*s] = [W]
        return d.temp_delta * d.flowrate * Constants.waterSpecificHeat * 1000000; // [W]
    };
    // Transforms expected JSON object to usable array of CalorimeterData
    CalorimeterData.parseJsonToArray = function (json) {
        var data = [];
        for (var i in json.content) {
            var item = json.content[i];
            data.push(new CalorimeterData(item, i));
        }
        return data;
    };
    // Goes through the passed array and returns the element with closest date.
    // The array should be ordered by date.
    CalorimeterData.getElementAtDate = function (array, date) {
        for (var i in array) {
            var item = array[i];
            if (item.date.valueOf() >= date.valueOf()) {
                return item;
            }
        }
        return null;
    };
    return CalorimeterData;
})();
//# sourceMappingURL=app.js.map