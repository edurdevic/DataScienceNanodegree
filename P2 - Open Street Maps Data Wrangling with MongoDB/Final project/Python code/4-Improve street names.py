
import xml.etree.cElementTree as ET
from collections import defaultdict
import re
import pprint
"""
Checkes the street types against expected values
"""
OSMFILE = "C:/Users/Erni/Downloads/venice_italy.osm"
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


def audit_street_type(street_types, street_name):
    m = street_type_re.search(street_name)
    if m:
        street_type = m.group()
        if street_type not in expected:
            street_types[street_type].add(street_name)


def is_street_name(elem):
    return (elem.attrib['k'] == "addr:street")


def audit(filename):
    """ 
    Returns a dictionary with the unexpected street types found in the OSM file
    """

    unexpected_street_types = defaultdict(set)
    
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
            if node.tag == "node" or node.tag == "way":
                for tag in node.iter("tag"):
                    if is_street_name(tag):
                        audit_street_type(unexpected_street_types, tag.attrib['v'])
            
            # -------------
            
            
            if (i % 100000) == 0:
                print len(unexpected_street_types.keys())
                i = 1
                
        if event == "end":
            root.clear()
            
    # Fast iter block
        

    return unexpected_street_types


def update_name(name, mapping):

    m = street_type_re.search(name)
    if m:
        street_type = m.group()
        if street_type in mapping:
            return street_type_re.sub(mapping[street_type], name)
    
    return name


def test():
    st_types = audit(OSMFILE)
    pprint.pprint(dict(st_types))

    for st_type, ways in st_types.iteritems():
        for name in ways:
            better_name = update_name(name, mapping)
            print name, "=>", better_name

if __name__ == '__main__':
    test()