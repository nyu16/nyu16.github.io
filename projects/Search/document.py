"""
Nicholas Yu
CSE163 AD
May 5, 2021
"""
import re


class Document:
    """
    The Document class represents the data in a single web
    page. The class consists of different methods to return
    pahts of a Document, return unique words the Document
    consists of, an initiliar and ultimately the method that
    computes a given term's frequency within a single Document.
    """
    def __init__(self, path):
        """
        The method takes in a self and a path to a document and
        initializes the document data. A dictionary is created to
        show frequencies for each term in the document in the initializer
        and maps each string term to its float value of term frequency
        which is calculated via a given equation. All terms are normalized
        and lower cased.
        """
        self._path = path
        self._words = {}
        totwords = 0

        with open(self._path) as f:
            lines = f.readlines()
            for line in lines:
                terms = line.split()
                totwords += len(terms)
                for term in terms:
                    term = term.lower()
                    term = re.sub(r'\W+', '', term)
                    if term not in self._words:
                        self._words[term] = 0
                    self._words[term] += 1

            for counts in self._words:
                self._words[counts] /= totwords

    def term_frequency(self, term):
        """
        The method returns the term frequency of a given term by
        passed in the parameter via looking the term up from the
        precomputed dictionary. The term is normalized and lower
        cased for an accurate result.
        """
        term = term.lower()
        term = re.sub(r'\W+', '', term)

        if term not in self._words:
            return 0
        return self._words[term]

    def get_path(self):
        """
        returns the path of the file of the document which was
        initilized previously within in the initializer
        method.
        """
        return self._path

    def get_words(self):
        """
        returns a list of the unique, normalized words in a
        single document.
        """
        return list(self._words.keys())
