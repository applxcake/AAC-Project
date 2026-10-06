# Function to check prime number then check using doctest.
import doctest 
def primeCheck(x):
    """
    >>> primeCheck(2)
    True
    >>> primeCheck(3)
    True
    >>> primeCheck(4)
    False
    """
    if x<=1:
        return False
    for i in range(2,int(x**0.5)+1):
        if x%i==0:
            return False
    return True

if __name__=="__main__":
    doctest.testmod(verbose=True)