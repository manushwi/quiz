// questions.js - All 30 exam questions

const questions = [
  // ===== SECTION A: C Language =====
  // MCQ (10 questions)
  {
    id: "c_mcq_1",
    section: "C",
    type: "mcq",
    number: 1,
    question: "What is the correct syntax to declare an integer variable 'x' in C?",
    options: ["int x;", "integer x;", "x int;", "declare int x;"],
    answer: 0,
    marks: 1
  },
  {
    id: "c_mcq_2",
    section: "C",
    type: "mcq",
    number: 2,
    question: "Which header file is needed to use printf() and scanf() in C?",
    options: ["<stdlib.h>", "<string.h>", "<stdio.h>", "<math.h>"],
    answer: 2,
    marks: 1
  },
  {
    id: "c_mcq_3",
    section: "C",
    type: "mcq",
    number: 3,
    question: "What will be the output of: printf(\"%d\", 5 % 2);",
    options: ["2", "1", "2.5", "0"],
    answer: 1,
    marks: 1
  },
  {
    id: "c_mcq_4",
    section: "C",
    type: "mcq",
    number: 4,
    question: "Which loop is guaranteed to execute at least once?",
    options: ["for loop", "while loop", "do-while loop", "None of these"],
    answer: 2,
    marks: 1
  },
  {
    id: "c_mcq_5",
    section: "C",
    type: "mcq",
    number: 5,
    question: "What does the 'return 0;' statement in main() indicate?",
    options: ["Program failed", "Program executed successfully", "Infinite loop", "Nothing"],
    answer: 1,
    marks: 1
  },
  {
    id: "c_mcq_6",
    section: "C",
    type: "mcq",
    number: 6,
    question: "Which operator is used to access members of a structure through a pointer?",
    options: [".", "->", "::", "&"],
    answer: 1,
    marks: 1
  },
  {
    id: "c_mcq_7",
    section: "C",
    type: "mcq",
    number: 7,
    question: "What is the size of int data type in C (on most 64-bit systems)?",
    options: ["2 bytes", "4 bytes", "8 bytes", "1 byte"],
    answer: 1,
    marks: 1
  },
  {
    id: "c_mcq_8",
    section: "C",
    type: "mcq",
    number: 8,
    question: "What is the output of: int a=10; printf(\"%d\", a++);",
    options: ["11", "10", "9", "Error"],
    answer: 1,
    marks: 1
  },
  {
    id: "c_mcq_9",
    section: "C",
    type: "mcq",
    number: 9,
    question: "Which function is used to dynamically allocate memory in C?",
    options: ["new()", "alloc()", "malloc()", "memalloc()"],
    answer: 2,
    marks: 1
  },
  {
    id: "c_mcq_10",
    section: "C",
    type: "mcq",
    number: 10,
    question: "In C, arrays are indexed starting from:",
    options: ["1", "0", "-1", "Depends on compiler"],
    answer: 1,
    marks: 1
  },

  // Coding (5 questions)
  {
    id: "c_code_1",
    section: "C",
    type: "coding",
    number: 11,
    language: "c",
    question: "Write a C program to calculate the factorial of a number N.\nInput: A single integer N (0 ≤ N ≤ 12)\nOutput: The factorial of N",
    sampleInput: "5",
    sampleOutput: "120",
    testCases: [
      { input: "0", expected: "1" },
      { input: "5", expected: "120" },
      { input: "10", expected: "3628800" }
    ],
    marks: 2,
    starterCode: `#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    // Write your code here\n    \n    return 0;\n}`
  },
  {
    id: "c_code_2",
    section: "C",
    type: "coding",
    number: 12,
    language: "c",
    question: "Write a C program to check if a number is Prime.\nInput: A single integer N (N > 1)\nOutput: Print 'Prime' if prime, else print 'Not Prime'",
    sampleInput: "7",
    sampleOutput: "Prime",
    testCases: [
      { input: "7", expected: "Prime" },
      { input: "4", expected: "Not Prime" },
      { input: "13", expected: "Prime" }
    ],
    marks: 2,
    starterCode: `#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    // Write your code here\n    \n    return 0;\n}`
  },
  {
    id: "c_code_3",
    section: "C",
    type: "coding",
    number: 13,
    language: "c",
    question: "Write a C program to check if a number is a Palindrome.\nInput: A single integer N\nOutput: Print 'Palindrome' if palindrome, else print 'Not Palindrome'",
    sampleInput: "121",
    sampleOutput: "Palindrome",
    testCases: [
      { input: "121", expected: "Palindrome" },
      { input: "123", expected: "Not Palindrome" },
      { input: "1221", expected: "Palindrome" }
    ],
    marks: 2,
    starterCode: `#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    // Write your code here\n    \n    return 0;\n}`
  },
  {
    id: "c_code_4",
    section: "C",
    type: "coding",
    number: 14,
    language: "c",
    question: "Write a C program to reverse a number.\nInput: A single integer N\nOutput: The reversed number",
    sampleInput: "1234",
    sampleOutput: "4321",
    testCases: [
      { input: "1234", expected: "4321" },
      { input: "100", expected: "1" },
      { input: "9", expected: "9" }
    ],
    marks: 2,
    starterCode: `#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    // Write your code here\n    \n    return 0;\n}`
  },
  {
    id: "c_code_5",
    section: "C",
    type: "coding",
    number: 15,
    language: "c",
    question: "Write a C program to find the sum of N numbers.\nInput: First line is N, second line has N space-separated integers\nOutput: Sum of all N integers",
    sampleInput: "4\n1 2 3 4",
    sampleOutput: "10",
    testCases: [
      { input: "4\n1 2 3 4", expected: "10" },
      { input: "3\n10 20 30", expected: "60" },
      { input: "5\n1 1 1 1 1", expected: "5" }
    ],
    marks: 2,
    starterCode: `#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    // Write your code here\n    \n    return 0;\n}`
  },

  // ===== SECTION B: Python =====
  // MCQ (10 questions)
  {
    id: "py_mcq_1",
    section: "Python",
    type: "mcq",
    number: 16,
    question: "What is the correct way to take integer input in Python 3?",
    options: ["input()", "int(input())", "scanf()", "cin >> x"],
    answer: 1,
    marks: 1
  },
  {
    id: "py_mcq_2",
    section: "Python",
    type: "mcq",
    number: 17,
    question: "Which of the following is a valid Python list?",
    options: ["{1, 2, 3}", "(1, 2, 3)", "[1, 2, 3]", "<1, 2, 3>"],
    answer: 2,
    marks: 1
  },
  {
    id: "py_mcq_3",
    section: "Python",
    type: "mcq",
    number: 18,
    question: "What is the output of: print(type(3.14))?",
    options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'number'>"],
    answer: 1,
    marks: 1
  },
  {
    id: "py_mcq_4",
    section: "Python",
    type: "mcq",
    number: 19,
    question: "Which keyword is used to define a function in Python?",
    options: ["function", "func", "def", "define"],
    answer: 2,
    marks: 1
  },
  {
    id: "py_mcq_5",
    section: "Python",
    type: "mcq",
    number: 20,
    question: "What does len([1, 2, 3, 4, 5]) return?",
    options: ["4", "5", "6", "Error"],
    answer: 1,
    marks: 1
  },
  {
    id: "py_mcq_6",
    section: "Python",
    type: "mcq",
    number: 21,
    question: "What is the output of: print(10 // 3)?",
    options: ["3.33", "3", "4", "3.0"],
    answer: 1,
    marks: 1
  },
  {
    id: "py_mcq_7",
    section: "Python",
    type: "mcq",
    number: 22,
    question: "Which method adds an element to the end of a list?",
    options: ["add()", "insert()", "append()", "push()"],
    answer: 2,
    marks: 1
  },
  {
    id: "py_mcq_8",
    section: "Python",
    type: "mcq",
    number: 23,
    question: "What is a correct way to create a dictionary in Python?",
    options: ["d = [1:2, 3:4]", "d = {1:2, 3:4}", "d = (1:2, 3:4)", "d = <1:2, 3:4>"],
    answer: 1,
    marks: 1
  },
  {
    id: "py_mcq_9",
    section: "Python",
    type: "mcq",
    number: 24,
    question: "What does 'range(1, 6)' produce?",
    options: ["1, 2, 3, 4, 5, 6", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4, 5", "1, 2, 3, 4"],
    answer: 1,
    marks: 1
  },
  {
    id: "py_mcq_10",
    section: "Python",
    type: "mcq",
    number: 25,
    question: "What is the output of: print('Hello'[1])?",
    options: ["H", "e", "He", "Error"],
    answer: 1,
    marks: 1
  },

  // Coding (5 questions)
  {
    id: "py_code_1",
    section: "Python",
    type: "coding",
    number: 26,
    language: "python",
    question: "Write a Python program to calculate the factorial of a number N.\nInput: A single integer N (0 ≤ N ≤ 12)\nOutput: The factorial of N",
    sampleInput: "5",
    sampleOutput: "120",
    testCases: [
      { input: "0", expected: "1" },
      { input: "5", expected: "120" },
      { input: "10", expected: "3628800" }
    ],
    marks: 2,
    starterCode: `n = int(input())\n# Write your code here\n`
  },
  {
    id: "py_code_2",
    section: "Python",
    type: "coding",
    number: 27,
    language: "python",
    question: "Write a Python program to check if a number is Prime.\nInput: A single integer N (N > 1)\nOutput: Print 'Prime' if prime, else print 'Not Prime'",
    sampleInput: "7",
    sampleOutput: "Prime",
    testCases: [
      { input: "7", expected: "Prime" },
      { input: "4", expected: "Not Prime" },
      { input: "13", expected: "Prime" }
    ],
    marks: 2,
    starterCode: `n = int(input())\n# Write your code here\n`
  },
  {
    id: "py_code_3",
    section: "Python",
    type: "coding",
    number: 28,
    language: "python",
    question: "Write a Python program to check if a number is a Palindrome.\nInput: A single integer N\nOutput: Print 'Palindrome' if palindrome, else print 'Not Palindrome'",
    sampleInput: "121",
    sampleOutput: "Palindrome",
    testCases: [
      { input: "121", expected: "Palindrome" },
      { input: "123", expected: "Not Palindrome" },
      { input: "1221", expected: "Palindrome" }
    ],
    marks: 2,
    starterCode: `n = int(input())\n# Write your code here\n`
  },
  {
    id: "py_code_4",
    section: "Python",
    type: "coding",
    number: 29,
    language: "python",
    question: "Write a Python program to reverse a number.\nInput: A single integer N\nOutput: The reversed number",
    sampleInput: "1234",
    sampleOutput: "4321",
    testCases: [
      { input: "1234", expected: "4321" },
      { input: "100", expected: "1" },
      { input: "9", expected: "9" }
    ],
    marks: 2,
    starterCode: `n = int(input())\n# Write your code here\n`
  },
  {
    id: "py_code_5",
    section: "Python",
    type: "coding",
    number: 30,
    language: "python",
    question: "Write a Python program to find the sum of N numbers.\nInput: First line is N, second line has N space-separated integers\nOutput: Sum of all N integers",
    sampleInput: "4\n1 2 3 4",
    sampleOutput: "10",
    testCases: [
      { input: "4\n1 2 3 4", expected: "10" },
      { input: "3\n10 20 30", expected: "60" },
      { input: "5\n1 1 1 1 1", expected: "5" }
    ],
    marks: 2,
    starterCode: `n = int(input())\n# Write your code here\n`
  }
];

module.exports = questions;
