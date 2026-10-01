x=input("Enter Grade: ")
def gradecalc(x):
    if x.lower()=="a":
        print("Marks 18-20")
    elif x.lower()=="b":
        print("Marks 16-18")
    elif x.lower()=="c":
        print("Marks 14-16")
    elif x.lower() == "d":
        print("Marks 12-14")
    elif x != str:
        print("Invalid")
    else:
        print("Fail")
        
gradecalc(x)
