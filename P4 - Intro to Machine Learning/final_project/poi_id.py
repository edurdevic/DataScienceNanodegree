#!/usr/bin/python

import sys
import pickle
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
sys.path.append("../tools/")

from feature_format import featureFormat, targetFeatureSplit
from tester import test_classifier, dump_classifier_and_data
from sklearn.grid_search import GridSearchCV
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier

### Execution options (use only one True value at the time)
print_exploratory_box_plots       = False
print_feature_importance          = False
print_lasso_coef                  = False
find_best_estimator_svc           = False
find_best_estimator_tree          = False
find_best_estimator_random_forest = False
find_best_estimator_k_mean        = False
scoring                           = "recall"  # or "precision" | "accuracy"

# ----------------------------
# Helper functions
# ----------------------------

def compute_fraction (poi_messages, all_messages):
    """ given a number messages to/from POI (numerator) 
        and number of all messages to/from a person (denominator),
        return the fraction of messages to/from that person
        that are from/to a POI
   """

    fraction = 0.

    if (poi_messages == "NaN" or all_messages == "NaN" or float(all_messages) == 0.):
        return 0.
    
    fraction = float(poi_messages) / float(all_messages)
    
    return fraction

def get_data_frame(data_dict, print_describe = True):

    person_keys = data_dict.keys()
    feature_keys = data_dict[person_keys[0]].keys()
    #print type(feature_keys) # list
    feature_keys.remove('email_address')

    data = featureFormat(my_dataset, feature_keys, sort_keys = True, remove_NaN = False)
    
    df = pd.DataFrame(data, columns = feature_keys)
    
    if (print_describe):
        print "Describing the datset:"
        print df.describe()
    
    return df

def explore_one_variable_data(data_dict):
    
    df = get_data_frame(data_dict)    
    #print df.head(10)
    for feature in list(df):
        if ( not feature == "poi"):
            df.boxplot(column=feature, by="poi")
    
    return

def display_feature_importances(clf):
    print "Printing feature importance..."
    for i in clf.feature_importances_:
        if i >= 0.0:        
            feature_index = np.where(clf.feature_importances_ == i)[0][0] + 1
            feature_name = features_list[feature_index]
            print "{}      val: {}".format(feature_name, i)





### Task 1: Select what features you'll use.
### features_list is a list of strings, each of which is a feature name.
### The first feature must be "poi".
features_list = ['poi', 
                 'salary', 
                 'exercised_stock_options', 
                 'bonus', 
                 'shared_receipt_with_poi',
                 'deferred_income',
                 #'fraction_from_poi',
                 'fraction_to_poi'] # You will need to use more features

 
### Load the dictionary containing the dataset
data_dict = pickle.load(open("final_project_dataset.pkl", "r"))

### Task 2: Remove outliers
data_dict.pop("TOTAL", 0)   # Removes the TOTAL record

### Task 3: Create new feature(s)

# Creating the normalized from_poi_to_this_person and from_this_person_to_poi
for name in data_dict:

    data_point = data_dict[name]
    
    from_poi_to_this_person = data_point["from_poi_to_this_person"]
    to_messages = data_point["to_messages"]
    fraction_from_poi = compute_fraction(from_poi_to_this_person, to_messages)
    data_point["fraction_from_poi"] = fraction_from_poi


    from_this_person_to_poi = data_point["from_this_person_to_poi"]
    from_messages = data_point["from_messages"]
    fraction_to_poi = compute_fraction(from_this_person_to_poi, from_messages)
    data_point["fraction_to_poi"] = fraction_to_poi

### Store to my_dataset for easy export below.
my_dataset = data_dict

### Extract features and labels from dataset for local testing
data = featureFormat(my_dataset, features_list, sort_keys = True, remove_all_zeroes = True)

labels, features = targetFeatureSplit(data)


if (print_exploratory_box_plots):
    print "Total records count: {}".format(len(my_dataset))
    print "Total number of features: {}".format(len(my_dataset[my_dataset.keys()[0]]))
    poi_count = sum(labels)
    non_poi_count = len(my_dataset) - poi_count
    print "Total POI count: {}, non POI count: {}".format(poi_count, non_poi_count)    
    explore_one_variable_data(my_dataset)

if (print_lasso_coef):
    from sklearn import linear_model
    clf = linear_model.Lasso(alpha=0.1, max_iter = 2000)
    clf.fit(features, labels)
    
    for i in clf.coef_:
        if i >= 0.0:        
            feature_index = np.where(clf.coef_ == i)[0][0] + 1
            feature_name = features_list[feature_index]
            print "{}        val: {}".format(feature_name, i)

    print(clf.coef_)
    
if (print_feature_importance):
    
    clf = DecisionTreeClassifier()
    test_classifier(clf, my_dataset, features_list)

    display_feature_importances(clf)


### Task 4: Try a varity of classifiers
### Please name your classifier clf for easy export below.
### Note that if you want to do PCA or other multi-stage operations,
### you'll need to use Pipelines. For more info:
### http://scikit-learn.org/stable/modules/pipeline.html

### Task 5: Tune your classifier to achieve better than .3 precision and recall 
### using our testing script.
### Because of the small size of the dataset, the script uses stratified
### shuffle split cross validation. For more info: 
### http://scikit-learn.org/stable/modules/generated/sklearn.cross_validation.StratifiedShuffleSplit.html


elif (find_best_estimator_svc):
        # Feature scaling
    from sklearn import preprocessing
    min_max_scaler = preprocessing.MinMaxScaler()
    features = min_max_scaler.fit_transform(features)
    
    print "-------------------------------------------"
    print "Fitting the classifier to the training set - SVC"
    
    Crange = [0.00001, 0.0001, 0.0005, 0.001, 0.005, 0.01, 0.1, 1, 10, 100] #np.logspace(-2, 2, 40)
    param_grid = {
             'C': Crange,
              }
    clf = GridSearchCV(SVC(kernel='rbf', class_weight='auto'), param_grid)
    clf = clf.fit(features, labels)
    
    scores = [g[1] for g in clf.grid_scores_]
    plt.plot(Crange, scores);

    print "-------------------------------------------"
    print "Best estimator found by grid search:"
    print clf.best_estimator_
    print "-------------------------------------------"
    
    clf = clf.best_estimator_

elif (find_best_estimator_random_forest):
    """
    Random forest algorithm is very good in scoring a high precision (>0.59), 
    but it scores maximum 0.24 in Recall.
    
    RandomForestClassifier(bootstrap=True, compute_importances=None,
            criterion='gini', max_depth=None, max_features='auto',
            max_leaf_nodes=None, min_density=None, min_samples_leaf=1,
            min_samples_split=3, n_estimators=55, n_jobs=1,
            oob_score=False, random_state=1, verbose=0)
    """
    print "-------------------------------------------"   
    print "Fitting the classifier to the training set - RandomForest"
    Crange = range(10,80) #np.logspace(-2, 2, 40)
    param_grid = {
             'n_estimators': Crange,
             'min_samples_split': [3,4,5,6]
             }

#    clf = GridSearchCV(RandomForestClassifier(min_samples_split = 5, random_state = 1), param_grid, scoring=scoring)
    clf = GridSearchCV(RandomForestClassifier(random_state = 1), param_grid, scoring=scoring)
    clf = clf.fit(features, labels)
    print "-------------------------------------------"
    print "Best estimator found by grid search (scoring= {}):".format(scoring)
    print clf.best_estimator_
    print "-------------------------------------------"
        
    clf = clf.best_estimator_    
       
elif (find_best_estimator_tree):
    """
    The best estimator found is the following:

    DecisionTreeClassifier(compute_importances=None, criterion='gini',
            max_depth=None, max_features=None, max_leaf_nodes=None,
            min_density=None, min_samples_leaf=1, min_samples_split=2,
            random_state=1, splitter='best')
            
        Accuracy: 0.81850       Precision: 0.35527      Recall: 0.33200 F1: 0.34324     F2: 0.33641
    """
    print "Fitting the classifier to the training set - Tree"
    Crange = range(2,100) #np.logspace(-2, 2, 40)
    param_grid = {
             'min_samples_split': Crange
             }
    clf = GridSearchCV(DecisionTreeClassifier(random_state = 1), param_grid, scoring=scoring)
    clf = clf.fit(features, labels)
    print "-------------------------------------------"
    print "Best estimator found by grid search (scoring= {}):".format(scoring)
    print clf.best_estimator_
    print "-------------------------------------------"
        
    scores = [g[1] for g in clf.grid_scores_]
    plt.plot(Crange, scores);
    
    clf = clf.best_estimator_    
    display_feature_importances(clf)
    
elif (find_best_estimator_k_mean):
    # Feature scaling
    from sklearn import preprocessing
    min_max_scaler = preprocessing.MinMaxScaler()
    features = min_max_scaler.fit_transform(features)
    
    clf = KMeans(n_clusters=2)
    
else:
    # By default runs GaussianNB algorythm
    clf = GaussianNB()    # Provided to give you a starting point. Try a varity of classifiers.
    


test_classifier(clf, my_dataset, features_list)

### Dump your classifier, dataset, and features_list so 
### anyone can run/check your results.

dump_classifier_and_data(clf, my_dataset, features_list)




