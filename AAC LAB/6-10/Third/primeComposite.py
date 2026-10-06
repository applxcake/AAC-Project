def primeComposite(n):
    """
    >>> primeComposite(2)
    'Prime'
    >>> primeComposite(3)
    'Prime'
    >>> primeComposite(4)
    'Composite'
    >>> primeComposite(5)
    'Prime'
    >>> primeComposite(6)
    'Composite'
    >>> primeComposite(1)
    "Neither Prime nor Composite"
    >>> primeComposite(0)
    "Neither Prime nor Composite"
    """
    if n<=1:
        return "Neither Prime nor Composite"
    for i in range(2,int(n**0.5)+1):
        if n%i==0:
            return "Composite"
    return "Prime"