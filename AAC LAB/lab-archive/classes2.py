class Product:
    def __init__(self,name,product_id,price, quantity):
        self.name=name
        self.product_id=product_id
        self.price=price
        self.quantity=quantity
    def product_details(self):
        print("Product Name: ",self.name)
        print("Product ID: ",self.product_id)
        print("Price: ",self.price)
        print("Quantity: ",self.quantity)
    def calculate_total(self):
        return self.price * self.quantity
    def calculate_discount(self):
        if self.price >= 5000:
            self.discount = 0.2
        elif self.price >=3000 and self.price <= 4999:
            self.discount = 0.1
        else:
            self.discount = 0
        
    def calculate_final_price(self):
        self.calculate_discount()
        if self.discount >0:
            return self.calculate_total() * (1-self.discount)
        else:
            return self.calculate_total()

#Products
product1 = Product("Laptop",1,50000,1)
product2 = Product("Camera",2,40000,2)
product3 = Product("Pen",3,50,3)
product4 = Product("Mouse",4,4000,1)
            
#Prints
product1.product_details()
print("Total Price: ",product1.calculate_total())
print("Discount: ",product1.calculate_discount())
print("Final Price: ",product1.calculate_final_price())
print("-"*30)
print("-"*30)
product2.product_details()
print("Total Price: ",product2.calculate_total())
print("Discount: ",product2.calculate_discount())
print("Final Price: ",product2.calculate_final_price())
print("-"*30)
print("-"*30)
product3.product_details()
print("Total Price: ",product3.calculate_total())
print("Discount: ",product3.calculate_discount())
print("Final Price: ",product3.calculate_final_price())
print("-"*30)
print("-"*30)
product4.product_details()
print("Total Price: ",product4.calculate_total())
print("Discount: ",product4.calculate_discount())
print("Final Price: ",product4.calculate_final_price())
print("-"*30)
print("-"*30)