def main():
    print("=== Dynamic Marks Average Calculator ===")
    print("Enter marks one by one (0 - 100). Type 'done' or press Enter on an empty line to finish.\n")

    marks = []

    while True:
        user_input = input("Enter mark: ").strip()

        if user_input.lower() in ("done", "exit", "q", ""):
            break

        try:
            mark = float(user_input)
            if 0 <= mark <= 100:
                marks.append(mark)
            else:
                print("Rejected: Mark must be between 0 and 100. Please try again.")
        except ValueError:
            print("Invalid input: Please enter a valid number between 0 and 100, or 'done' to finish.")

    if not marks:
        print("\nNo marks entered.")
    else:
        average = sum(marks) / len(marks)
        print("\n--- Results ---")
        print(f"Total subjects/marks entered: {len(marks)}")
        print(f"Total Marks: {sum(marks):.2f}")
        print(f"Average Marks: {average:.2f}")


if __name__ == "__main__":
    main()
