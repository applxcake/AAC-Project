"""Module to calculate the total value of bills."""


def total(bill_list):
    """Calculate the total value of all bills."""
    total_val = 0
    for bill in bill_list:
        total_val += bill
    return total_val


BILLS = [1, 2, 3, 4, 5]
TOTAL_AMOUNT = total(BILLS)
print(TOTAL_AMOUNT)
