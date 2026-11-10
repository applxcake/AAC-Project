def prime(x):
    if x<0:
        raise ValueError
    elif x>=0 | x<=1:
        return False
    for i in range(2,int(x**0.5)+1):
        if x%i==0:
            return False
    return True
