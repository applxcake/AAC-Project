#Zero Shot
# Write a python program to check if a number is prime or not
def is_prime(n: int) -> bool:
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True


if __name__ == "__main__":
    try:
        num = int(input("Enter a number: "))
        if num <= 1:
            print(f"{num} is neither prime nor composite.")
        elif is_prime(num):
            print(f"{num} is a prime number.")
        else:
            print(f"{num} is a composite number.")
    except ValueError:
        print("Please enter a valid integer.")

#One Shot
#input: 
#output: prime
# Write a python program to check if a number is prime or not
def is_prime(n: int) -> bool:
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True


if __name__ == "__main__":
    try:
        num = int(input("Enter a number: "))
        if num <= 1:
            print(f"{num} is neither prime nor composite.")
        elif is_prime(num):
            print(f"{num} is a prime number.")
        else:
            print(f"{num} is a composite number.")
    except ValueError:
        print("Please enter a valid integer.")

#few shot
#input: 5
#output: prime
#input: 24
#output: composite
# Generate code for the given input and output
def is_prime(n: int) -> bool:
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True


if __name__ == "__main__":
    try:
        num = int(input("Enter a number: "))
        if num <= 1:
            print(f"{num} is neither prime nor composite.")
        elif is_prime(num):
            print(f"{num} is a prime number.")
        else:
            print(f"{num} is a composite number.")
    except ValueError:
        print("Please enter a valid integer.")