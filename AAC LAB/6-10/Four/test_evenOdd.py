import unittest

from is_even import isEven

class TestEven(unittest.TestCase):

    def test_positive(self):
        self.assertEqual(isEven(2), True)
    
    def test_negative(self):
        self.assertEqual(isEven(7), False)
        self.assertEqual(isEven(9), False)

    def test_edge_case(self):
        self.assertEqual(isEven(0), True)
    
    def test_invalid_test_case(self):
        with self.assertRaises(ValueError):
            isEven(-3)

if __name__ == "__main__":
    unittest.main(verbosity=3)