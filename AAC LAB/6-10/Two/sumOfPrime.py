import doctest
def primeCheck(x):
    if x<=1:
        return False
    for i in range(2,int(x**0.5)+1):
        if x%i==0:
            return False
    return True

def sumOfPrimes(x):
    """
    >>> sumOfPrimes(10)
    17
    >>> sumOfPrimes(5)
    10
    >>> sumOfPrimes(3)
    5
    """
    primes =[]
    for i in range(2,x+1):
        if primeCheck(i):
            primes.append(i)
    return sum(primes)

if __name__=="__main__":
    doctest.testmod(verbose=True)