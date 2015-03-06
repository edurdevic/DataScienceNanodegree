#!/usr/bin/env python
# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import pprint
import re
"""
returns a set of unique user IDs ("uid") from OSM files
"""

FILENAME = 'C:/Users/Erni/Downloads/venice_italy.osm'

def get_user(element):
    return

            
def process_map(filename):
    users = set()

    # Fast iter block    
    osm_file = open(filename, "r")
    context = ET.iterparse(osm_file, events=("start", "end"))
    context = iter(context)
    event, root = context.next()
    i = 1
    
    for event, node in context:
        if event == "start":
            i = i + 1
            # -------------
            if not (node.get('uid') == None):
                users.add(node.get('uid'))
            
            # -------------
            if (i % 10000) == 0:
                print len(users)
                i = 1
                
        #Clears the root element content to save momory
        if event == "end":
            root.clear()
            
    # Fast iter block
            

    return users


def test():

    users = process_map(FILENAME)
    pprint.pprint(users)
    print len(users)
    #assert len(users) == 6



if __name__ == "__main__":
    test()