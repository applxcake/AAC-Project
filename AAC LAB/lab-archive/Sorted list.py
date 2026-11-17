# Zero Shot
# Given a sorted list of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.
def search_insert(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return left


if __name__ == "__main__":
    try:
        nums = [int(x) for x in input("Enter sorted numbers separated by space: ").replace(',', ' ').split()]
        target = int(input("Enter target value: "))
        print(f"Index: {search_insert(nums, target)}")
    except ValueError:
        print("Please enter valid integers.")

# One Shot
# input: nums = [1, 3, 5, 6], target = 5
# output: 2
# Given a sorted list of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.
def search_insert(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return left


if __name__ == "__main__":
    try:
        nums = [int(x) for x in input("Enter sorted numbers separated by space: ").replace(',', ' ').split()]
        target = int(input("Enter target value: "))
        print(f"Index: {search_insert(nums, target)}")
    except ValueError:
        print("Please enter valid integers.")


# few shot
# input: nums = [1, 3, 5, 6], target = 5
# output: 2
# input: nums = [1, 3, 5, 6], target = 2
# output: 1
# input: nums = [1, 3, 5, 6], target = 7
# output: 4
# Generate code for the given input and output
def search_insert(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return left


if __name__ == "__main__":
    try:
        nums = [int(x) for x in input("Enter sorted numbers separated by space: ").replace(',', ' ').split()]
        target = int(input("Enter target value: "))
        print(f"Index: {search_insert(nums, target)}")
    except ValueError:
        print("Please enter valid integers.")
