"""
Nicholas Yu
CSE163 AD
May 5, 2021
"""
from cse163_utils import assert_equals

from document import Document
from search_engine import SearchEngine


def test_document(doc):
    """
    Tests whether the Document class performs its given tasks
    with correct results by calling and comparing the results
    via asset_equals function.
    """
    assert_equals(0.043209876543209874, doc.term_frequency("in"))
    assert_equals('/home/testfile/carly.txt', doc.get_path())
    assert_equals(0.012345679012345678, doc.term_frequency("to"))


def test_search_engine(path):
    """
    Tests whether the SearchEngine class performs its given tasks
    with correct results by calling and comparing the results
    via asset_equals function.
    """
    assert_equals(
        ['/home/testfile/carly.txt', '/home/testfile/guido.txt',
            '/home/testfile/justempty.txt'], path.search("in"))
    assert_equals(['/home/testfile/carly.txt'], path.search("carly"))
    assert_equals(
        ['/home/testfile/test1.txt', '/home/testfile/carly.txt',
            '/home/testfile/test3.txt', '/home/testfile/test2.txt',
            '/home/testfile/justempty.txt', '/home/testfile/guido.txt'],
        path.search("for carly and"))


def main():
    """
    main method that creates Document and SearchEngine objects,
    calls in different test functions and passes down each object
    to the corresponding function for testing purposes.
    """
    doc = Document('/home/testfile/carly.txt')
    path = SearchEngine('/home/testfile')

    test_document(doc)
    test_search_engine(path)


if __name__ == '__main__':
    main()
