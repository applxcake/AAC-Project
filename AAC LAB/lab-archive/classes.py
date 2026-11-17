class Student:
    def __init__(self,name,age,gender):
        self.name=name
        self.age=age
        self.gender=gender

student1=Student("saketh",67,"Rather not say")
print(student1.name)
print(student1.age)
print(student1.gender)

#create a student class with attributes name, roll, gender and a method named display that displays the data of student object

class StudentDetails:
    def __init__(self, name, roll, gender):
        self.name = name
        self.roll = roll
        self.gender = gender

    def display(self):
        print(f"Name: {self.name}")
        print(f"Roll: {self.roll}")
        print(f"Gender: {self.gender}")


student2 = StudentDetails("Saketh", 101, "Rather not say")
