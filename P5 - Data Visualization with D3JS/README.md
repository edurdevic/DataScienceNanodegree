# Inverter heat pumps vs On/Off heat pumps  
Final project for Udacity course: Make Effective Data Visualization

## Summary
When planning a heat pump thermic implant it is important to understand the main differences between the
two most common pump categories: "On/Off" and "with Inverter".
The intent of this project was to explain the operative difference by comparing the cooling performance of two sample installations.

Technical note:
I used Typescript to better organize and type-check javascript code. Both Typescript and Javascript sources are provided.

## Design
Before starting this project I already had confidence with the datasets.
I wanted to create a data visualization that allows to see how a heating or cooling system is performing and spot at a glance if there is a possible issue in the installation.
The important data to visualize were the following:
.) Absolute input temperature
.) Absolute output temperature
.) Temperature delta (difference between input and output)
.) Thermic power "produced"

The first three points were easily addressable with an area chart on temperatures.
Temperature delta indirectly represents the power as well (for constant flowrate), so it was not planned as direct representation originally.

By going through the chart development I realized that I could use color scale to encode thermic power and complete the representation.

An interactive tooltip and a legend were added to complete the cart reading experience.

## Feedback
The following feedbacks were collected.

### Feedback 1)
A brief heat pump working explanation was missing to understand the charts.

I Added a brief description of how the heat exchange works, a simplified svg schema and
the thermic power calculation formula.

### Feedback 3)
The color scale for positive temperature difference was very different from the temperature scale of negative temperatures. The result was that even a slight temperature inversion caused an intense red color in the chart, and it was misleading.

I changed the scale computation in order to be symmetrical.

### Feedback 4)
Lower temperature line was too unstable for On/Off temp_o line and the lower limit was hard to interpret.

I set the line opacity to 0.5 to improve the chart readability.

### Feedback 5)
The tooltip was overlapping with legend when hovering on the far right.

I added a semi-transparent box around the tooltip, to improve readability.

## Resources
In order to complete this project I used the following resources:
.) Udacity "Make Effective Data Visualization" course materials and references
.) D3 JS document references
.) Tutorial http://bl.ocks.org/mbostock/3883195
.) Tutorial http://bl.ocks.org/d3noob/4433087
.) Tutorial http://synthesis.sbecker.net/articles/2012/07/16/learning-d3-part-6-scales-colors
.) D3 JS definitions for Typescript https://github.com/borisyankov/DefinitelyTyped
.) W3C SVG documentation:
