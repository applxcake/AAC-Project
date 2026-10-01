def print_fibonacci(n):
    if n <= 0:
        print("Please enter a positive integer.")
        return

    a, b = 0, 1
    print("Fibonacci series:")
    for _ in range(n):
        print(a, end=" ")
        a, b = b, a + b
    print()

if __name__ == "__main__":
    try:
        n = int(input("Enter number of terms: "))
        print_fibonacci(n)
    except ValueError:
        print("Invalid input! Please enter an integer.")
