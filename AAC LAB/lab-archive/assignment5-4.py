def calculate_result(name, marks):
    if not marks:
        print("No marks provided.")
        return

    total = sum(marks)
    average = total / len(marks)

    if average >= 90:
        grade = "A+"
    elif average >= 75:
        grade = "A"
    elif average >= 60:
        grade = "B"
    elif average >= 50:
        grade = "C"
    else:
        grade = "F"

    if min(marks) >= 40:
        status = "Pass"
    else:
        status = "Fail"

    print("Student:", name)
    print("Total:", total)
    print("Average:", round(average, 2))
    print("Grade:", grade)
    print("Status:", status)

name = input("Enter name: ")
marks = []

for i in range(3):
    while True:
        raw_input = input(f"Enter mark {i + 1}: ")
        try:
            mark = float(raw_input)
            if 0 <= mark <= 100:
                marks.append(mark)
                break
            else:
                print("Invalid mark! Please enter a value between 0 and 100.")
        except ValueError:
            print("Invalid input! Please enter a valid numeric value.")

calculate_result(name, marks)