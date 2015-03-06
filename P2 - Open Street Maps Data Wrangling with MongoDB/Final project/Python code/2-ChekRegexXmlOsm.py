#!/usr/bin/env python
# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import pprint
import re
"""
Counts the possible problematic keys in the OSM 'tag' nodes
"""


lower = re.compile(r'^([a-z]|_)*$')
lower_colon = re.compile(r'^([a-z]|_)*:([a-z]|_)*$')
problemchars = re.compile(r'[=\+/&<>;\'"\?%#$@\,\. \t\r\n]')

FILENAME = 'C:/Users/Erni/Downloads/venice_italy.osm'

def key_type(element, keys):
    if element.tag == "tag":
        # YOUR CODE HERE
        k = element.get('k')
        
        if not(lower_colon.match(k) == None):
            keys['lower_colon'] = keys['lower_colon'] + 1  
            
        elif not(lower.match(k) == None):
            keys['lower'] = keys['lower'] + 1  
            
        elif not(problemchars.search(k) == None):
            keys['problemchars'] = keys['problemchars'] + 1  
            
        else:
            keys['other'] = keys['other'] + 1
            
    return keys



def process_map(filename):
    keys = {"lower": 0, "lower_colon": 0, "problemchars": 0, "other": 0}
    #for _, element in ET.iterparse(filename):
    #    keys = key_type(element, keys)

    osm_file = open(filename, "r")

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
            keys = key_type(node, keys)
                
            if (i % 10000) == 0:
                print keys
                i = 1
                
        if event == "end":
            root.clear()
            
    return keys



def test():
    # You can use another testfile 'map.osm' to look at your solution
    # Note that the assertions will be incorrect then.
    keys = process_map(FILENAME)
    pprint.pprint(keys)
    

if __name__ == "__main__":
    test()