d3.tsv("data.tsv", function (d) { return new DataElement(d); }, buildCharts);
function buildCharts(error, data) {
    var width = 420;
    var barHeight = 20;
    var scaleX = d3.scale.linear()
        .domain([0, d3.max(data, function (d) { return d.value; })])
        .range([0, width]);
    var chart = d3.select(".chart")
        .attr("width", width)
        .attr("heignt", barHeight * data.length);
    var bar = chart.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
        return "translate(0, " + i * barHeight + ")";
    });
    bar.append("rect")
        .attr("width", function (d) {
        return scaleX(d.value);
    })
        .attr("height", barHeight - 1);
    bar.append("text")
        .attr("x", function (d) {
        return scaleX(d.value);
    })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function (d) { return d.value; });
}
var DataElement = (function () {
    function DataElement(row) {
        this.name = row["name"];
        this.value = +row["value"];
    }
    return DataElement;
})();
