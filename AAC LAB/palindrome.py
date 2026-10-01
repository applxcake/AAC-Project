def is_palindrome(num: int) -> bool:
    """Checks whether a given integer is a palindrome.
    
    Args:
        num (int): The integer to check.
        
    Returns:
        bool: True if the number reads the same forward and backward, False otherwise.
    """
    # Negative numbers are not palindromes (e.g., -121 -> 121-)
    if num < 0:
        return False

    # Single-digit numbers (0-9) are always palindromes
    if 0 <= num < 10:
        return True

    # Numbers ending in 0 (other than 0 itself) cannot be palindromes
    if num % 10 == 0:
        return False

    # Reversing the second half of the number
    reversed_half = 0
    while num > reversed_half:
        reversed_half = reversed_half * 10 + num % 10
        num //= 10

    # For even length numbers: num == reversed_half
    # For odd length numbers: num == reversed_half // 10 (discards middle digit)
    return num == reversed_half or num == reversed_half // 10


if __name__ == "__main__":
    test_cases = [
        (12321, True),
        (1221, True),
        (12345, False),
        (-121, False),
        (0, True),
        (7, True),
        (10, False),
        (1000000001, True),
    ]

    print("Running Palindrome Test Cases:")
    print("-" * 35)
    for value, expected in test_cases:
        result = is_palindrome(value)
        status = "PASS" if result == expected else "FAIL"
        print(f"Input: {value:<12} | Result: {str(result):<5} | Status: {status}")
