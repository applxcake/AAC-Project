def calculate_stats(numbers):
    if not numbers:
        return None
    return {
        "mean": sum(numbers) / len(numbers),
        "min": min(numbers),
        "max": max(numbers)
    }

def main():
    user_input = input("Enter numbers separated by spaces: ")
    try:
        numbers = [float(x) for x in user_input.split()]
        if not numbers:
            print("No numbers provided.")
            return

        stats = calculate_stats(numbers)
        print(f"Minimum: {stats['min']}")
        print(f"Maximum: {stats['max']}")
        print(f"Mean: {stats['mean']}")
    except ValueError:
        print("Invalid input! Please enter valid numbers.")

if __name__ == "__main__":
    main()
