d3.tsv<CalorimeterData>("data/sensor1.tsv", (d):CalorimeterData => { return new CalorimeterData(d); }, buildCalorimeterCharts);

function buildCalorimeterCharts (error, data:CalorimeterData[]) {
   var margin = {top: 20, right: 20, bottom: 30, left: 50},
       width = 960 - margin.left - margin.right,
       height = 500 - margin.top - margin.bottom;


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

    var area = d3.svg.area<CalorimeterData>()
        .x((d) => { return x(d.date); })
        .y0((d) => { return y(d.temp_o); })
        .y1((d) => { return y(d.temp_i); });


    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if (error) throw error;


    x.domain(d3.extent<any>(data, (d) => { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.temp_i; })]);

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

class CalorimeterData {
   constructor(row: { [key: string]: string }){
      var parseDate = d3.time.format.iso.parse;

      this.date = parseDate(row["date"]);
      this.temp_i = +row["temp_i"];
      this.temp_o = +row["temp_o"];
      this.flowrate = +row["flowrate"];
   }

   date: Date;
   temp_i: number;
   temp_o: number;
   flowrate: number;
}
