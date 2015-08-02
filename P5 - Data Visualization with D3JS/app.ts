//d3.tsv<CalorimeterData>("data/sensor1.tsv", (d):CalorimeterData => { return new CalorimeterData(d); }, buildCalorimeterCharts);

d3.json("data/2015-07-17-cal-15230001024015.json", buildCalorimeterCharts);


function buildCalorimeterCharts (error, responseData) {
   var margin = {top: 20, right: 20, bottom: 30, left: 50},
       width = 960 - margin.left - margin.right,
       height = 500 - margin.top - margin.bottom;

   var data:CalorimeterData[] = [];

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


    //var minDeltaT: number = d3.min(data, (d) => { return d.temp_delta; }); //Celsius
    //var maxDeltaT: number = d3.max(data, (d) => { return d.temp_delta; });

    var minThermicPower: number = d3.min(data, CalorimeterData.getThermicPower);
    var maxThermicPower: number = d3.max(data, CalorimeterData.getThermicPower);

    var colorSpanExtension: number = Math.max(Math.abs(minThermicPower), Math.abs(maxThermicPower));



                   // EarthBlue   white    LoveRed
    var colors:any = ["#0000A0", "white", "#E42217"];
    var color = d3.scale.linear()
        .domain([-colorSpanExtension, 0 , colorSpanExtension])
        .range(colors);

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


    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if (error) throw error;


    xGradient.domain(d3.extent<any>(data, (d) => { return d.date; }));
    x.domain(d3.extent<any>(data, (d) => { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.temp_i; })]);

    svg.append("linearGradient")
      .attr("id", "temperature-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", width).attr("y2", 0)
    .selectAll("stop")
      .data(data)
    .enter().append("stop")
      .attr("offset", function(d) { return xGradient(d.date) + "%"; })
      .attr("stop-color", function(d) { return color(CalorimeterData.getThermicPower(d)); });

    // Area with gradient fill
    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
        .style("fill", "url(#temperature-gradient)");

    // X axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("y", -16)
        .attr("x", width)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Time");;

    // Y axis
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

class Constants {
   public static waterSpecificHeat: number = 4.186; // [J/(g*C)]
}

class CalorimeterData {
   constructor(row: { [key: string]: string }, dateString: string){
      var parseDate = d3.time.format.iso.parse;

      this.date = parseDate(dateString);
      this.temp_i = +row["temp-i_C"];
      this.temp_o = +row["temp-o_C"];
      this.flowrate = +row["flowrate_lm"] / 60 / 1000; //conversion from l/min to m3/s
      this.temp_delta = this.temp_o - this.temp_i;
   }

   public static getThermicPower(d: CalorimeterData): number {
      //        [C]       *  [m3/s]    *        [J/(g*C)]            * [m3 -> g] =  [J*s] = [W]
      return d.temp_delta * d.flowrate * Constants.waterSpecificHeat * 1000000;   // [W]
   }

   date: Date;
   temp_i: number;      // [C]
   temp_o: number;      // [C]
   temp_delta: number;  // [C]
   flowrate: number;    // [m3/s]
}
