'''
# Zero shot
def check_even_odd(num: int) -> str:
    if num % 2 == 0:
        return "Even"
    return "Odd"


if __name__ == "__main__":
    try:
        user_input = int(input("Enter a number: "))
        result = check_even_odd(user_input)
        print(f"{user_input} is {result}.")
    except ValueError:
        print("Please enter a valid integer.")
'''

# One Shot
#input: 5
#output: odd
# Generate code for the given input and output

def check_even_odd(num: int) -> str:
    return "Even" if num % 2 == 0 else "Odd"

if __name__ == "__main__":
    user_input = int(input("Enter a number: "))
    result = check_even_odd(user_input)
    print(f"{user_input} is {result}.")


#Few shot
#input: 5
#output: odd
#input: 24
#output: even
# Generate code for the given input and output
def check_even_odd(num: int) -> str:
    return "Even" if num % 2 == 0 else "Odd"

if __name__ == "__main__":
    user_input = int(input("Enter a number: "))
    result = check_even_odd(user_input)
    print(f"{user_input} is {result}.")
