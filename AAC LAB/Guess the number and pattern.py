'''
a=int(input("Enter the first number: "))
b=int(input("Enter the second number: "))
c=int(input("Enter the third number: "))
if a>b and a>c:
    print("a is the largest number")
elif b>a and b>c:
    print("b is the largest number")
else:
    print("c is the largest number")
'''

# write a python program to print a star pattern pyramid using a nested loop.
'''
n = int(input("Enter number of rows: "))

for i in range(1, n + 1):
    # Print leading spaces
    for j in range(n - i):
        print(" ", end="")
    # Print stars
    for k in range(2 * i - 1):
        print("*", end="")
    print()
'''

# Write a python program for a number guesing game. Generate a random number between 1 and 40 and let the user keep guessing until they find the correct number. Give hints such as "Too High" or "Too Low".

import random

target_number = random.randint(1, 40)

while True:
    guess = int(input("Guess a number between 1 and 40: "))
    if guess < target_number:
        print("Too Low")
    elif guess > target_number:
        print("Too High")
    else:
        print("Congratulations! You guessed the correct number.")
        break