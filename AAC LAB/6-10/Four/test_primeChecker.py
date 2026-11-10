import unittest

from primeChecker import prime

class TestPrime(unittest.TestCase):

    def test_positive_case(self):
        self.assertEqual (prime(7), True)
        self.assertEqual(prime(8), False)
        self.assertEqual(prime(9), False)
        self.assertEqual (prime(11), True)

    def test_negative_test(self):
        with self.assertRaises(ValueError):
            prime(-1)
        with self.assertRaises(ValueError):
            prime(-10)

    def test_edge_case(self):
        self.assertEqual (prime(0), False)
        self.assertEqual(prime(1), False)
        self.assertEqual(prime(2), True)


if __name__ =="__main__":
    unittest.main(verbosity=2)