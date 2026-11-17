class Node:
    def __init__(self,data):
    self.data=data
    self.next=None
    def display(head):
    while head.next != None:
        print(head.data)
            head=head.next