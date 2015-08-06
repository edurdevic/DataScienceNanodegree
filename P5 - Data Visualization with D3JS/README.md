# Inverter heat pumps vs On/Off heat pumps  
Final project for Udacity course: Make Effective Data Visualization

## Summary
When planning a heat pump thermic implant it is important to understand the main differences between the
two most common pump categories: "On/Off" and "with Inverter".
The intent of this project was to explain the operative difference by comparing the cooling performance of two sample installations.


## Design
Are initial design decisions documented?
The student explains initial design decisions such as chart type, visual encodings, layout, legends, or hierarchy. These are included at the beginning of the Design section in the README.md file.
-------
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

### Feedback 5) The tooltip was overlapping with legend


## Resources
