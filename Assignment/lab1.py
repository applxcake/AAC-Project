from abc import ABC, abstractmethod
from typing import Dict, Union
Number = Union[int, float]
class CalculatorError(Exception):
    """Base exception for calculator errors."""
    pass
class DivisionByZeroError(CalculatorError, ZeroDivisionError):
    """Raised when an operation attempts division by zero."""
    pass
class UnsupportedOperationError(CalculatorError, ValueError):
    """Raised when an unsupported operation is requested."""
    pass
class OperationStrategy(ABC):
    """Abstract base class representing an arithmetic operation strategy."""
    @abstractmethod
    def execute(self, a: Number, b: Number) -> Number:
        """
        Execute the arithmetic operation on two operands.

        Args:
            a: First operand.
            b: Second operand.

        Returns:
            The numeric result of the operation.
        """
        pass
class AdditionStrategy(OperationStrategy):
    """Strategy for addition (+) operation."""
    def execute(self, a: Number, b: Number) -> Number:
        """Return the sum of a and b."""
        return a + b
class SubtractionStrategy(OperationStrategy):
    """Strategy for subtraction (-) operation."""
    def execute(self, a: Number, b: Number) -> Number:
        """Return the difference of a and b."""
        return a - b
class MultiplicationStrategy(OperationStrategy):
    """Strategy for multiplication (*) operation."""
    def execute(self, a: Number, b: Number) -> Number:
        """Return the product of a and b."""
        return a * b
class DivisionStrategy(OperationStrategy):
    """Strategy for division (/) operation."""
    def execute(self, a: Number, b: Number) -> float:
        """
        Return the quotient of a and b.

        Raises:
            DivisionByZeroError: If b is zero.
        """
        if b == 0:
            raise DivisionByZeroError("Cannot divide by zero.")
        return a / b
class ExponentiationStrategy(OperationStrategy):
    """Strategy for exponentiation (^ or **) operation."""
    def execute(self, a: Number, b: Number) -> Number:
        """
        Return a raised to the power of b.

        Raises:
            DivisionByZeroError: If zero is raised to a negative power.
        """
        if a == 0 and b < 0:
            raise DivisionByZeroError("Cannot raise zero to a negative power.")
        return a ** b
class Calculator:
    """
    Modular calculator using the Strategy Pattern to execute arithmetic operations.
    """
    def __init__(self) -> None:
        self._strategies: Dict[str, OperationStrategy] = {}
        self._register_default_strategies()
    def _register_default_strategies(self) -> None:
        """Register the built-in arithmetic strategies."""
        self.register_strategy("+", AdditionStrategy())
        self.register_strategy("-", SubtractionStrategy())
        self.register_strategy("*", MultiplicationStrategy())
        self.register_strategy("/", DivisionStrategy())
        self.register_strategy("^", ExponentiationStrategy())
        self.register_strategy("**", ExponentiationStrategy())
    def register_strategy(self, symbol: str, strategy: OperationStrategy) -> None:
        """
        Register a new operation strategy or override an existing one.

        Args:
            symbol: String operator symbol (e.g. '+', '-', '**').
            strategy: An instance conforming to OperationStrategy.
        """
        self._strategies[symbol.strip()] = strategy
    def execute(self, a: Number, b: Number, operation: str) -> Number:
        """
        Execute an arithmetic operation on two numbers.

        Args:
            a: First operand.
            b: Second operand.
            operation: Operator symbol ('+', '-', '*', '/', '^', '**').

        Returns:
            The calculated result as an int or float.

        Raises:
            UnsupportedOperationError: If operation symbol is not registered.
            DivisionByZeroError: If division by zero is attempted.
        """
        op = operation.strip()
        strategy = self._strategies.get(op)
        if strategy is None:
            supported = ", ".join(sorted(self._strategies.keys()))
            raise UnsupportedOperationError(
                f"Operation '{operation}' is not supported. Available: {supported}"
            )
        return strategy.execute(a, b)