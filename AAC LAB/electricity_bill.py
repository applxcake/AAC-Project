"""Problem 1: Electricity Bill Calculation

Billing Rules:
    - First 100 units  -> Rs 2 per unit
    - Next 100 units   -> Rs 3 per unit (101 - 200)
    - Next 200 units   -> Rs 5 per unit (201 - 400)
    - Above 400 units  -> Rs 7 per unit (> 400)
    - Fixed charge     -> Rs 50 added to every bill

Constraints & Edge Cases:
    - Consumer name cannot be blank.
    - Units consumed must be a non-negative number.
    - Supports integers and fractional units.
"""


def calculate_electricity_bill(units: float) -> float:
    """Calculates the total electricity bill using if-elif-else.

    Args:
        units (float): Number of electricity units consumed.

    Returns:
        float: Total electricity bill including fixed charge.

    Raises:
        ValueError: If units consumed is negative.
    """
    if units < 0:
        raise ValueError("Units consumed cannot be negative.")

    fixed_charge = 50.0

    if units <= 100:
        energy_charge = units * 2.0
    elif units <= 200:
        energy_charge = (100.0 * 2.0) + (units - 100.0) * 3.0
    elif units <= 400:
        energy_charge = (100.0 * 2.0) + (100.0 * 3.0) + (units - 200.0) * 5.0
    else:
        energy_charge = (100.0 * 2.0) + (100.0 * 3.0) + (200.0 * 5.0) + (units - 400.0) * 7.0

    return energy_charge + fixed_charge


def display_bill(consumer_name: str, units: float) -> None:
    """Displays the consumer name followed by the total electricity bill."""
    trimmed_name = consumer_name.strip()
    if not trimmed_name:
        print("Error: Consumer name cannot be blank.")
        return

    try:
        total_bill = calculate_electricity_bill(units)
    except ValueError as err:
        print(f"Error: {err}")
        return

    print("=" * 40)
    print(f"Consumer Name         : {trimmed_name}")
    print(f"Units Consumed        : {units:.2f}")
    print(f"Total Electricity Bill: Rs {total_bill:.2f}")
    print("=" * 40)


def main() -> None:
    """Interactively prompts the user for consumer name and units consumed."""
    print("=" * 40)
    print("      ELECTRICITY BILL CALCULATOR")
    print("=" * 40)

    # Prompt and validate consumer name
    consumer_name = input("Enter Consumer Name: ").strip()
    while not consumer_name:
        print("Error: Consumer name cannot be blank. Please try again.")
        consumer_name = input("Enter Consumer Name: ").strip()

    # Prompt and validate units consumed
    while True:
        units_input = input("Enter Units Consumed: ").strip()
        try:
            units = float(units_input)
            if units < 0:
                print("Error: Units cannot be negative. Please enter a valid positive number.")
                continue
            break
        except ValueError:
            print("Error: Invalid number. Please enter numeric digits only (e.g. 150 or 245.5).")

    print()
    display_bill(consumer_name, units)


if __name__ == "__main__":
    main()
