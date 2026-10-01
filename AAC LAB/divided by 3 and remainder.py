# Zero Shot
# determine the remainder obtained when a number is divided by 3
def get_remainder_div_3(num: int) -> int:
    return num % 3


if __name__ == "__main__":
    try:
        num = int(input("Enter a number: "))
        remainder = get_remainder_div_3(num)
        if remainder == 0:
            print(f"{num} is divisible by 3 (remainder: {remainder}).")
        else:
            print(f"{num} is not divisible by 3 (remainder: {remainder}).")
    except ValueError:
        print("Please enter a valid integer.")


# One Shot
#input: 10
#output: not divisible by 3 (remainder: 1)
# Write a python program to determine the remainder obtained when a number is divided by 3
def get_remainder_div_3(num: int) -> int:
    return num % 3


if __name__ == "__main__":
    try:
        num = int(input("Enter a number: "))
        remainder = get_remainder_div_3(num)
        if remainder == 0:
            print(f"{num} is divisible by 3 (remainder: {remainder}).")
        else:
            print(f"{num} is not divisible by 3 (remainder: {remainder}).")
    except ValueError:
        print("Please enter a valid integer.")


# few shot
#input: 9
#output: divisible by 3 (remainder: 0)
#input: 14
#output: not divisible by 3 (remainder: 2)
# Generate code for the given input and output
def get_remainder_div_3(num: int) -> int:
    return num % 3


if __name__ == "__main__":
    try:
        num = int(input("Enter a number: "))
        remainder = get_remainder_div_3(num)
        if remainder == 0:
            print(f"{num} is divisible by 3 (remainder: {remainder}).")
        else:
            print(f"{num} is not divisible by 3 (remainder: {remainder}).")
    except ValueError:
        print("Please enter a valid integer.")