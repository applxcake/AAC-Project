"""Problem 2: Find the Second Largest Unique Number in a List

Rules & Constraints:
    - Do NOT use Python's built-in sort(), sorted(), max(), or set() functions.
    - Must find the second largest UNIQUE element.
    - If there are fewer than two distinct numbers in the list, handle gracefully (returns None).
    - Works with negative numbers, duplicates, and lists of any length.

Algorithm:
    - Maintain two variables: `first_max` and `second_max`, initialized to `None`.
    - Iterate through the list element by element:
        1. If `num > first_max`:
           `second_max` becomes `first_max`, and `first_max` becomes `num`.
        2. Else if `num < first_max` and (`second_max is None` or `num > second_max`):
           `second_max` becomes `num`.
        3. If `num == first_max` or `num == second_max`:
           Skip (ignores duplicates).
    - Time Complexity: O(n) (single pass)
    - Space Complexity: O(1) (constant extra space)
"""

from typing import List, Optional


def find_second_largest_unique(numbers: List[int]) -> Optional[int]:
    """Finds the second largest unique number from a list of integers without using

    built-in sort(), sorted(), max(), or set().

    Args:
        numbers (List[int]): List of integer values.

    Returns:
        Optional[int]: The second largest unique integer, or None if fewer
        than 2 unique numbers exist.
    """
    if not numbers or len(numbers) < 2:
        return None

    first_max: Optional[int] = None
    second_max: Optional[int] = None

    for num in numbers:
        # Case 1: First number encountered, or found a strictly larger number
        if first_max is None or num > first_max:
            second_max = first_max
            first_max = num
        # Case 2: Number is strictly less than first_max, but greater than current second_max
        elif num < first_max:
            if second_max is None or num > second_max:
                second_max = num
        # Case 3: num == first_max is ignored automatically (handles duplicates)

    return second_max


def display_second_largest(numbers: List[int]) -> None:
    """Helper function to format and print the result."""
    result = find_second_largest_unique(numbers)
    if result is None:
        print(f"Input: {numbers}")
        print("Output: Second Largest does not exist (requires at least 2 unique numbers)\n")
    else:
        print(f"Input: {numbers}")
        print(f"Output: Second Largest = {result}\n")


def main() -> None:
    """Interactively takes a list of integers from the user and displays the second largest unique number."""
    print("=" * 60)
    print("     SECOND LARGEST UNIQUE NUMBER FINDER")
    print("=" * 60)
    print("Enter a list of integers separated by spaces or commas.")
    print("Examples: '10, 5, 20, 8, 20, 15, 10' or '5 5 5 3 3 1'\n")

    user_input = input("Enter numbers: ").strip()
    if not user_input:
        print("Error: No numbers provided.")
        return

    # Replace commas, brackets if entered by user (e.g. [10, 5, 20])
    cleaned_input = user_input.replace("[", " ").replace("]", " ").replace(",", " ")
    tokens = cleaned_input.split()

    numbers: List[int] = []
    for token in tokens:
        try:
            numbers.append(int(token))
        except ValueError:
            print(f"Error: '{token}' is not a valid integer. Please enter integers only.")
            return

    print()
    display_second_largest(numbers)


if __name__ == "__main__":
    main()
