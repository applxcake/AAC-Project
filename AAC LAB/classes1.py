class Student:
    def __init__(self,name,roll,batch,marks1,marks2,marks3,marks4,marks5):
        self.name=name
        self.roll=roll
        self.batch=batch
        self.marks1=marks1
        self.marks2=marks2
        self.marks3=marks3
        self.marks4=marks4
        self.marks5=marks5

    def student_details(self):
        print("Name: ",self.name)
        print("Roll: ",self.roll)
        print("Total Marks: ",self.marks1 + self.marks2 + self.marks3 + self.marks4 + self.marks5)
        print("Batch: ",self.batch)
    def getgrade(self):
        marks_sum= self.marks1 + self.marks2 + self.marks3 + self.marks4 + self.marks5
        if marks_sum>=18*5 and marks_sum<=20*5:
            return "A"
        elif marks_sum>=16*5 and marks_sum<18*5:
            return "B"
        elif marks_sum>=14*5 and marks_sum<16*5:
            return "C"
        elif marks_sum>=12*5 and marks_sum<14*5:
            return "D"
        else:
            return "F"
    def calculate_percentage(self):
        return (((self.marks1 + self.marks2 + self.marks3 + self.marks4 + self.marks5)/500) * 100)

student1=Student("Saketh",101,19,20,21,22,23,24)
student1.student_details()
print("Grade: ",student1.getgrade())
print("Percentage: ",student1.calculate_percentage())
