"""
Nicholas Yu
CSE163 AD
May 5, 2021
"""

import os
import math
import re
from operator import itemgetter

from document import Document


class SearchEngine:
    """
    The SearchEngine class defined in search_engine.py
    represents a corpus of Documents as objects and consists
    of methods to initialize, compute the tf–idf statistic
    between each document of a given query, and search through
    the corpus for the best result ordered in tfidf order.
    """
    def __init__(self, path):
        """
        An initializer method that takes a string path to a
        corpus of documents and constructs an inverted index
        that assigns to each term in the corpus the list of
        documents that consist of the term at least once. We assume
        here that the path directory is valid and the files exist as
        well.
        """
        self._directory = path
        self._wordbook = {}
        for filename in os.listdir(self._directory):
            doc = Document(os.path.join(self._directory, filename))
            for word in doc.get_words():
                if word not in self._wordbook:
                    self._wordbook[word] = []
                li = self._wordbook[word]
                li.append(doc)
                self._wordbook[word] = li

    def _calculate_idf(self, term):
        """
        The method takes in a string term as a parameter
        and returns the inverse document frequency of that
        specific term. If the term is not in the corpus,
        the method returns 0, else it computes the inverse of
        document frequency with the provided equation. This
        method is private and cannot be called by users.
        """
        term = term.lower()
        if term not in self._wordbook:
            return 0
        return math.log(
            len(os.listdir(self._directory)) /
            len(self._wordbook[term]))

    def search(self, search_str):
        """
        Takes a string query that may contain one or more terms.
        The search method returns a list of document paths
        sorted in descending order by tf–idf statistic which we
        calculate through an active use of term frequency method
        from the Document class and _calculate_idf method here.
        Each term is lower cased and normalized for more accurate
        results and if there are no matching documents, an empty list
        is returned.
        """
        terms = search_str.split()
        storage = {}

        for term in terms:
            term = term.lower()
            term = re.sub(r'\W+', '', term)
            if term in self._wordbook:
                for doc in self._wordbook[term]:
                    if doc not in storage:
                        storage[doc] = 0
                    storage[doc] += (doc.term_frequency(term) *
                                     self._calculate_idf(term))

        storage = sorted(storage.items(), key=itemgetter(1), reverse=True)

        return ([i[0].get_path() for i in storage])
