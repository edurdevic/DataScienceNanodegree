#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Parses a XML file and counts the node types
"""
import xml.etree.ElementTree as ET
import pprint

def count_tags(filename):

    osm_file = open(filename, "r")
    tags = {}    

    # get an iterable
    context = ET.iterparse(osm_file, events=("start", "end"))
    
    # turn it into an iterator
    context = iter(context)
    
    # get the root element
    event, root = context.next()
    i = 1
    for event, node in context:
        if event == "start":
            i = i + 1
            if not(node.tag in tags):
                tags[node.tag] = 1
            else:
                tags[node.tag] = tags[node.tag] + 1
                
            #Print the value of tags every 10000 nodes
            if (i % 10000) == 0:
                print tags
                i = 1
                
        #Clear the root node to decrease memory usage
        if event == "end":
            root.clear()
            


    return tags

def test():

    tags = count_tags('C:/Users/Erni/Downloads/venice_italy.osm')
    pprint.pprint(tags)
        

if __name__ == "__main__":
    test()