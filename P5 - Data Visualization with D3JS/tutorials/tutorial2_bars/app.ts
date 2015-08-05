

d3.tsv<DataElement>("data.tsv", (d):DataElement => { return new DataElement(d); }, buildCharts);

function buildCharts (error, data:DataElement[]) {
   var width:number = 420;
   var barHeight:number = 20;

   var scaleX = d3.scale.linear()
     .domain([0, d3.max(data, (d: DataElement) => { return d.value; } )])
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
     .attr("width", (d:DataElement) => {
        return scaleX(d.value)
        })
     .attr("height", barHeight - 1);

   bar.append("text")
     .attr("x", (d:DataElement) => {
        return scaleX(d.value);
        })
     .attr("y", barHeight / 2)
     .attr("dy", ".35em")
     .text((d: DataElement) => { return d.value; })
}

class DataElement {

   constructor(row: { [key: string]: string }){
      this.name = row["name"];
      this.value = +row["value"];
   }

   name: string;
   value: number;
}
