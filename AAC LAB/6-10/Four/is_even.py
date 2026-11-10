def isEven(x):
    if x<0:
        raise ValueError("We are checking for only non-negative values")
    return x%2 == 0