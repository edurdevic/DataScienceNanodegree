var data = [4, 8, 15, 16, 23, 42];
var width = 420;
var barHeight = 20;
var scaleX = d3.scale.linear()
    .domain([0, d3.max(data)])
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
    .attr("width", function (d) { return scaleX(d); })
    .attr("height", barHeight - 1);
bar.append("text")
    .attr("x", function (d) { return scaleX(d); })
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function (d) { return d; });
