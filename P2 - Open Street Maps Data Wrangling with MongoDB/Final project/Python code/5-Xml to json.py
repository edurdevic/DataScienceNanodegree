#!/usr/bin/env python
# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import pprint
import re
import codecs
import json
"""
-Processes OSM file by correcting street names
-Creates JSON file ready to be imported
-Imports JSON data into local DB
"""


address_re = re.compile(r'addr:([a-z]|_)*$')
lower = re.compile(r'^([a-z]|_)*$')
lower_colon = re.compile(r'^([a-z]|_)*:([a-z]|_)*$')
problemchars = re.compile(r'[=\+/&<>;\'"\?%#$@\,\. \t\r\n]')
lower_double_colon = re.compile(r'^([a-z]|_)*:([a-z]|_)*:([a-z]|_)*$')
street_type_re = re.compile(r'^\S+\.?', re.IGNORECASE)


expected = ["Via", "Borgo", "Campo", "Piazza", "Viale", "Largo", "Calle", 
            "Piazzale", "Piazzetta", "Corte", "Lungomare", "Strada", "Galleria", 
            "Riva", "Salita", "Isola", "Ponte", "Campiello", "Vicolo",
            "Riviera", "Passaggio", "Salizada", "Corso", "Villaggio", 
            "Fondamenta", "Monte", "Quartiere"]

# UPDATE THIS VARIABLE
mapping = { "via": "Via",
           "VIa": "Via",
           "VIA": "Via",
            "V.le": "Viale",
            "calle": "Calle",
            "P.zza": "Piazza",
            "piazza": "Piazza",
            "viale": "Viale",
            "Lugomare": "Lungomare"
            }

CREATED = [ "version", "changeset", "timestamp", "user", "uid"]
POS = [ "lat", "lon"]

OSMFILE = "C:/Users/Erni/Downloads/venice_italy.osm"
OSMJSONFILE = "C:/Users/Erni/Downloads/venice_italy.json"

def shape_element(element):
    node = {}
    if element.tag == "node" or element.tag == "way" :
        # YOUR CODE HERE
        node["created"] = {}
        node["type"] = element.tag
        
        #Sets the position attribute
        if ("lat" in element.attrib) and ("lon" in element.attrib):
            node["pos"] = [None, None]

        #Maps the node attributes into json values
        for attr in element.attrib:
            
            #All the info about node creation goes into the "created" JSON dictionary
            if attr in CREATED:
                node["created"][attr] = element.get(attr)
                
            #Latitude and longitude are mapped into the "pos" array
            elif attr == "lat":
                node["pos"][0] = float(element.get(attr))
            elif attr == "lon":
                node["pos"][1] = float(element.get(attr))
                
            #Any other element is directly mapped
            else:
                node[attr] = element.get(attr)
        
        #The child tag elements are mapped by key-value
        for t in element.findall("tag"):
            
            k = t.get("k")
            v = t.get("v")

            #Skip keys with problem chars
            if problemchars.search(k) or lower_double_colon.match(k):
                print "This key is not valid: " + k
                continue
            
            #Addresses has to be audited and corrected
            elif address_re.match(k):
                if is_street_name(k) and not is_correct_street_name(v):
                    correct_v = update_name(v, mapping)
                    print "{0} => {1}".format(v, correct_v)
                    v = correct_v
                    
                if not ("address" in node):
                    node["address"] = {}
                node["address"][re.sub(r"^addr:", "", k)] = v
            
            #Other valid keys are mapped directly into the JSON
            elif lower.match(k):
                node[k] = v

        #Node references has to be imported into node_refs array
        for t in element.findall("nd"):
            ref = t.get("ref")
            
            if not ("node_refs" in node):
                node["node_refs"] = []
                    
            node["node_refs"].append(ref)

        return node
    else:
        return None


def process_map(file_in, file_out, pretty = False):
    
    with codecs.open(file_out, "w") as fo:
        #fo.write("[\n")
    
        # Fast iter block    
        osm_file = open(file_in, "r")
        context = ET.iterparse(osm_file, events=("start", "end"))
        context = iter(context)
        event, root = context.next()
        i = 1
        
        #Iterates through the OSM file and writes the output JSON without caching it in memory
        
        for event, node in context:
            if event == "start":
                i = i + 1
                
                # -------------
                el = shape_element(node)
                if el:
                    if pretty:
                        fo.write(json.dumps(el, indent=2)+"\n")
                    else:
                        fo.write(json.dumps(el) + "\n")
                # -------------
                
                
                if (i % 100000) == 0:
                    print i
                    #break
                
            if event == "end":
                root.clear()
        
        # Fast iter block
        #fo.write("]")
        
    return #data



def is_street_name(key):
    return (key == "addr:street")
    

def is_correct_street_name(street_name):
    m = street_type_re.search(street_name)
    if m:
        street_type = m.group()
        if street_type not in expected:
            return False #update_name(street_name, mapping)

    return True #street_name


def update_name(name, mapping):
    m = street_type_re.search(name)
    if m:
        street_type = m.group()
        if street_type in mapping:
            return street_type_re.sub(mapping[street_type], name)
    
    return name


def db_import(file_in):
    from pymongo import MongoClient
    client = MongoClient("mongodb://localhost:27017")
    db = client.OpenStreetMaps
        
    with open(file_in) as f:
        for line in f:
            data = json.loads(line)
            db.nodes.insert(data)
            
    
def test():
    print "Processing OSM"
    process_map(OSMFILE, OSMJSONFILE, False)
    
    print "Importing into MongoDB"
    db_import(OSMJSONFILE)
    
    #pprint.pprint(data)
    
    

if __name__ == "__main__":
    test()