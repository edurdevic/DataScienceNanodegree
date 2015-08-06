# Inverter heat pumps vs On/Off heat pumps  
Final project for Udacity course: Make Effective Data Visualization

## Summary
Planning a heat pump thermic implant requires the evaluation of one of the two most common pump categories: "On/Off" and "with Inverter".
The intent of this project was to explain the operative difference by comparing the cooling performance of two sample installations.

Technical note:
I used Typescript to better organize and type-check Javascript code. Both Typescript and Javascript sources are provided.

## Design
Before starting this project, I already had confidence with the datasets.
I wanted to create a data visualization that allows to see how a heating or cooling system is performing and spot at a glance if there is a possible issue in the installation.
The important data to visualize were the following:
* Absolute input temperature
* Absolute output temperature
* Temperature delta (difference between input and output)
* Thermic power "produced"

The first three points were easily addressable with an area chart on temperatures.
Temperature delta indirectly represents the power as well (for constant flowrate), so it was not planned as direct representation originally.

By going through the chart development, I realized that I could use color scale to encode thermic power and complete the representation.

An interactive tooltip and a legend were added to complete the chart reading experience.

## Feedback
The following feedbacks were collected.

### Feedback 1)
The chart was difficult to understand without a background knowledge in heat exchange systems.

I Added a brief description of how the heat pump works, a simplified svg schema and the thermic power calculation formula.

### Feedback 2)
The color scale for positive temperature difference was very different from the temperature scale of negative temperatures (eg. +1.1 kWh = red, 0 kWh = white and -8.9 kWh = blue). As a result, even a slight temperature inversion caused an intense red color in the chart, and it was misleading.

I changed the scale computation in order to be symmetrical  (eg. +8.9 kWh = red, 0 kWh = white and -8.9 kWh = blue). This way the slight temperature inversion of +1.1 kWh become a very light red color.

### Feedback 3)
Lower temperature line was too unstable for On/Off temp_o line and the lower limit was hard to interpret.

I set the line opacity to 0.5 to improve the chart readability.

### Feedback 4)
The tooltip was overlapping with legend when hovering on the far right.

I added a semi-transparent box around the tooltip, to improve readability.

### Feedback 5)
The tooltip was disappearing out of the chart area for the last values on the right.

I set a maximum offset for the tooltip in order to stay within the chart boundaries.


## Resources
In order to complete this project I used the following resources:
* Udacity "Make Effective Data Visualization" course materials and references
* D3 JS document references
* Tutorial http://bl.ocks.org/mbostock/3883195
* Tutorial http://bl.ocks.org/d3noob/4433087
* Tutorial http://synthesis.sbecker.net/articles/2012/07/16/learning-d3-part-6-scales-colors
* D3 JS definitions for Typescript https://github.com/borisyankov/DefinitelyTyped
* W3C SVG documentation:
