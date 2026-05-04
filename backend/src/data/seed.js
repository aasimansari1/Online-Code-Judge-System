// Seed data: each problem ships with sample tests (visible) and hidden tests
// (used by /submit). Test inputs are stdin strings; outputs are stdout strings.

const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    description:
      'Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    inputFormat:
      'Line 1: integer n (size of array)\nLine 2: n space-separated integers\nLine 3: integer target',
    outputFormat: 'Two indices (0-indexed), space-separated, in ascending order.',
    constraints: ['2 <= n <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists.'],
    timeLimit: 2,
    memoryLimit: 256000,
    samples: [
      { input: '4\n2 7 11 15\n9\n', output: '0 1\n', explanation: 'nums[0] + nums[1] == 9' },
      { input: '3\n3 2 4\n6\n', output: '1 2\n' },
    ],
    hiddenTests: [
      { input: '2\n3 3\n6\n', output: '0 1\n' },
      { input: '5\n1 5 3 7 9\n12\n', output: '2 4\n' },
      { input: '6\n-3 4 3 90 -1 5\n0\n', output: '0 2\n' },
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse a String',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    description: 'Read a single line of text and print it reversed.',
    inputFormat: 'A single line containing the string s.',
    outputFormat: 'The reversed string on a single line.',
    constraints: ['1 <= |s| <= 10^5', 's consists of printable ASCII characters.'],
    timeLimit: 2,
    memoryLimit: 256000,
    samples: [
      { input: 'hello\n', output: 'olleh\n' },
      { input: 'Code Judge\n', output: 'egduJ edoC\n' },
    ],
    hiddenTests: [
      { input: 'a\n', output: 'a\n' },
      { input: 'racecar\n', output: 'racecar\n' },
      { input: 'The quick brown fox\n', output: 'xof nworb kciuq ehT\n' },
    ],
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    tags: ['Math', 'Simulation'],
    description:
      'For every integer from 1 to n, print:\n- `Fizz` if it is divisible by 3,\n- `Buzz` if it is divisible by 5,\n- `FizzBuzz` if it is divisible by both,\n- otherwise the integer itself.\n\nPrint each result on its own line.',
    inputFormat: 'A single integer n.',
    outputFormat: 'n lines as described.',
    constraints: ['1 <= n <= 10^5'],
    timeLimit: 2,
    memoryLimit: 256000,
    samples: [
      { input: '5\n', output: '1\n2\nFizz\n4\nBuzz\n' },
      { input: '15\n', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n' },
    ],
    hiddenTests: [
      { input: '1\n', output: '1\n' },
      { input: '3\n', output: '1\n2\nFizz\n' },
      { input: '30\n', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n' },
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    tags: ['String', 'Stack'],
    description:
      'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is **valid**.\n\nA string is valid if open brackets are closed by the same type of brackets and in the correct order.',
    inputFormat: 'A single line containing the string s.',
    outputFormat: 'Print `true` or `false`.',
    constraints: ['1 <= |s| <= 10^4', 's consists of bracket characters only.'],
    timeLimit: 2,
    memoryLimit: 256000,
    samples: [
      { input: '()\n', output: 'true\n' },
      { input: '([)]\n', output: 'false\n' },
      { input: '{[]}\n', output: 'true\n' },
    ],
    hiddenTests: [
      { input: '()[]{}\n', output: 'true\n' },
      { input: '(\n', output: 'false\n' },
      { input: ']\n', output: 'false\n' },
      { input: '((()))\n', output: 'true\n' },
      { input: '({[()]})\n', output: 'true\n' },
    ],
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Hard',
    tags: ['String', 'Sliding Window', 'Hash Map'],
    description:
      'Given a string `s`, find the length of the longest substring without repeating characters.',
    inputFormat: 'A single line containing the string s (may be empty).',
    outputFormat: 'A single integer: the length of the longest substring without repeats.',
    constraints: ['0 <= |s| <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    timeLimit: 2,
    memoryLimit: 256000,
    samples: [
      { input: 'abcabcbb\n', output: '3\n' },
      { input: 'bbbbb\n', output: '1\n' },
      { input: 'pwwkew\n', output: '3\n' },
    ],
    hiddenTests: [
      { input: '\n', output: '0\n' },
      { input: ' \n', output: '1\n' },
      { input: 'au\n', output: '2\n' },
      { input: 'dvdf\n', output: '3\n' },
      { input: 'abcdefghij\n', output: '10\n' },
    ],
  },
];

module.exports = { PROBLEMS };
