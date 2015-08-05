var data = [4, 8, 15, 16, 23, 42];

var width:number = 420;
var barHeight:number = 20;

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
  .attr("transform",
      (d, i):string => {
        return "translate(0, " + i * barHeight + ")";
      })

bar.append("rect")
  .attr("width", (d: number) => { return scaleX(d) })
  .attr("height", barHeight - 1);

bar.append("text")
  .attr("x", (d) => { return scaleX(d); })
  .attr("y", barHeight / 2)
  .attr("dy", ".35em")
  .text((d) => { return d; })
