#include <iostream>

int addNumbers(int a, int b) {
  return a + b;
}

int main() {
  int result = addNumbers(5, 5);
  std::cout << result << std::endl;
  return 0;
}