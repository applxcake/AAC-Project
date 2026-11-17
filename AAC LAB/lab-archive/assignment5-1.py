name = input("Enter student name: ")
mark1 = float(input("Enter Mark 1: "))
mark2 = float(input("Enter Mark 2: "))
mark3 = float(input("Enter Mark 3: "))

if not (0 <= mark1 <= 100 and 0 <= mark2 <= 100 and 0 <= mark3 <= 100):
    print("Invalid marks! Marks must be between 0 and 100.")
else:
    average = (mark1 + mark2 + mark3) / 3

    if average >= 50:
        print(name, "Pass")
    else:
        print(name, "Fail")