def calculate_grade(average):
    if average >= 90:
        return "A+"
    elif average >= 80:
        return "A"
    elif average >= 70:
        return "B"
    elif average >= 60:
        return "C"
    elif average >= 50:
        return "D"
    else:
        return "F (Fail)"


def main():
    print("=== Average Marks Calculator ===")
    try:
        num_subjects = int(input("Enter the number of subjects: "))
        if num_subjects <= 0:
            print("Number of subjects must be greater than 0.")
            return

        marks = []
        for i in range(1, num_subjects + 1):
            mark = float(input(f"Enter marks for subject {i} (out of 100): "))
            if mark < 0 or mark > 100:
                print("Invalid mark! Please enter a value between 0 and 100.")
                return
            marks.append(mark)

        total_marks = sum(marks)
        average_marks = total_marks / num_subjects
        grade = calculate_grade(average_marks)

        print("\n--- Results ---")
        print(f"Total Marks: {total_marks:.2f} / {num_subjects * 100}")
        print(f"Average Marks: {average_marks:.2f}")
        print(f"Grade: {grade}")

    except ValueError:
        print("Invalid input! Please enter numeric values only.")


if __name__ == "__main__":
    main()