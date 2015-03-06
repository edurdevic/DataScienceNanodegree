# -*- coding: utf-8 -*-
"""
Created on Sun Mar 01 21:51:54 2015

@author: Erni
"""

from pymongo import MongoClient
import pprint

def audit_db_performance(db):
    #Query performance check
    print "Query performance check"
    print "Before index created"
    
    pprint.pprint(db.nodes.find({"amenity": "school"}).explain())

    print "Creating index..."
    db.nodes.ensure_index("amenity")

    print "After index created"
    pprint.pprint(db.nodes.find({"amenity": "school"}).explain())


def basic_queries(db):
    #Count distinct users
    print "Number of distinct users: {0}".format(len(db.nodes.distinct("created.user")))
    

    #Count distinct element types
    print "Count distinct element types"
    elements_count = [{"$group": {"_id": "$type", "count": {"$sum": 1}}},
                      {"$sort": {"count": -1 }},
                      {"$limit": 3}]
    pprint.pprint(db.nodes.aggregate(elements_count))


    #Node count
    print "Node count"
    print db.nodes.find({"type":"node"}).count()

    #Display users with one post
    print "Display users with one post"
    users_with_one_post = [{ "$group": { "_id": "$created.user", "count": { "$sum": 1 } } },
                           { "$match": { "count": { "$eq": 1 } } } ]    
    pprint.pprint(db.nodes.aggregate(users_with_one_post))
    

    #Count users with one post 
    print "Count users with one post"
    users_with_one_post_count = [{ "$group": { "_id": "$created.user", "count": { "$sum": 1 } } },
                                 { "$match": { "count": { "$eq": 1 } } },
                                 { "$group": { "_id": "users", "count": { "$sum": 1 } } } ]    
    pprint.pprint(db.nodes.aggregate(users_with_one_post_count))   
    
    print "Top ten users"
    top_ten_users = [{ "$group": { "_id": "$created.user", "count": { "$sum" : 1 } } }, 
                     { "$sort": { "count": -1 } },
                     { "$limit": 10 } ]
    pprint.pprint(db.nodes.aggregate(top_ten_users))

def amenities_queries(db):
    
    #Display most frequent amenities
    print "most frequent amenities"
    amenities_count_query = [{ "$match": { "amenity": { "$exists": 1 } } },
                       { "$group": { "_id": "$amenity", "count": { "$sum": 1 } } }, 
                       { "$sort": { "count": -1 } },
                       { "$limit": 10 } ]
    pprint.pprint(db.nodes.aggregate(amenities_count_query))

    print "Total parking count"
    print db.nodes.find({"amenity": "parking"}).count()
    #Out[1]: 4852
    
    print "Toll parking count"
    print db.nodes.find({"amenity": "parking", "fee": "yes"}).count()
    #Out[2]: 70

    print "Free parking count"
    print db.nodes.find({"amenity": "parking", "fee": "no"}).count()
    #Out[3]: 348
    
def geo_spatial_queries(db):
    
    earth_radius_km = 6371
    distance = 0.2 #km
    radians = distance / earth_radius_km
    train_station_pos = [45.4412123, 12.3216705]
    
    amenities_near_train_station_qry = {"amenity": { "$exists": 1 }, 
         "pos": {"$nearSphere": train_station_pos, "$maxDistance": radians}}
    
    print "Amenities near the trein station count"
    print db.nodes.find(amenities_near_train_station_qry).count()


    nodes_nearby = db.nodes.find(amenities_near_train_station_qry)
    
    #Print amenities near Venice Train Station    
    print "Amenities near the trein station"
    for n in nodes_nearby:    
        pprint.pprint(n["amenity"])


def test():
    
    client = MongoClient('localhost:27017')
    db = client.OpenStreetMaps

    audit_db_performance(db)
 
    basic_queries(db)

    amenities_queries(db)
    
    geo_spatial_queries(db)

 
    
if __name__ == "__main__":
    test()