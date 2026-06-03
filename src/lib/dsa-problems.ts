// Built-in DSA problem bank. Auto-graded in-browser via Pyodide.
// Each problem: function signature, test cases. User submits Python code; we exec and compare.

export type DSAProblem = {
  slug: string;
  title: string;
  pattern: string;          // "Two Pointers" | "Sliding Window" | "Hashing" | ...
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;            // markdown allowed
  signature: string;         // e.g. "def two_sum(nums, target) -> list[int]"
  starter: string;
  tests: { input: string; expected: string }[]; // Python expressions
  hint: string;
};

export const DSA_PATTERNS = [
  "Arrays & Strings",
  "Two Pointers",
  "Sliding Window",
  "Hash Map",
  "Stack / Queue",
  "Binary Search",
  "Linked List",
  "Trees / BFS / DFS",
  "Heap / Priority Queue",
  "Greedy",
  "Dynamic Programming",
  "Backtracking",
  "Graph",
  "Bit Manipulation",
] as const;

export const DSA_PROBLEMS: DSAProblem[] = [
  // ──────── Arrays & Strings ────────
  {
    slug: "two-sum",
    title: "Two Sum",
    pattern: "Hash Map",
    difficulty: "Easy",
    prompt: "Given an array `nums` and `target`, return indices of the two numbers that add up to target. Exactly one valid answer; cannot use same element twice.",
    signature: "def two_sum(nums: list[int], target: int) -> list[int]",
    starter: "def two_sum(nums, target):\n    # your code\n    pass\n",
    tests: [
      { input: "two_sum([2,7,11,15], 9)", expected: "[0, 1]" },
      { input: "two_sum([3,2,4], 6)",     expected: "[1, 2]" },
      { input: "two_sum([3,3], 6)",       expected: "[0, 1]" },
    ],
    hint: "Use a hash map: as you iterate, check if `target - num` was seen before.",
  },
  {
    slug: "reverse-string",
    title: "Reverse String In-Place",
    pattern: "Two Pointers",
    difficulty: "Easy",
    prompt: "Reverse a list of characters in-place using O(1) extra memory.",
    signature: "def reverse_string(s: list[str]) -> list[str]  # returns same list, mutated",
    starter: "def reverse_string(s):\n    # your code\n    return s\n",
    tests: [
      { input: "reverse_string(['h','e','l','l','o'])", expected: "['o', 'l', 'l', 'e', 'h']" },
      { input: "reverse_string(['a'])", expected: "['a']" },
      { input: "reverse_string([])", expected: "[]" },
    ],
    hint: "Two pointers: swap s[i] and s[j], move toward middle.",
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    pattern: "Hash Map",
    difficulty: "Easy",
    prompt: "Given two strings, return True if they are anagrams of each other.",
    signature: "def is_anagram(s: str, t: str) -> bool",
    starter: "def is_anagram(s, t):\n    pass\n",
    tests: [
      { input: "is_anagram('anagram','nagaram')", expected: "True" },
      { input: "is_anagram('rat','car')", expected: "False" },
      { input: "is_anagram('a','ab')", expected: "False" },
    ],
    hint: "Count characters with collections.Counter; compare counts.",
  },
  {
    slug: "max-subarray",
    title: "Maximum Subarray (Kadane's)",
    pattern: "Dynamic Programming",
    difficulty: "Medium",
    prompt: "Find the contiguous subarray (≥1 element) with the largest sum, return that sum.",
    signature: "def max_subarray(nums: list[int]) -> int",
    starter: "def max_subarray(nums):\n    pass\n",
    tests: [
      { input: "max_subarray([-2,1,-3,4,-1,2,1,-5,4])", expected: "6" },
      { input: "max_subarray([1])", expected: "1" },
      { input: "max_subarray([5,4,-1,7,8])", expected: "23" },
    ],
    hint: "Kadane: at each index, `cur = max(num, cur + num)`, track global max.",
  },
  {
    slug: "best-time-stock",
    title: "Best Time to Buy/Sell Stock",
    pattern: "Sliding Window",
    difficulty: "Easy",
    prompt: "Given an array of prices, find the max profit from one buy/sell.",
    signature: "def max_profit(prices: list[int]) -> int",
    starter: "def max_profit(prices):\n    pass\n",
    tests: [
      { input: "max_profit([7,1,5,3,6,4])", expected: "5" },
      { input: "max_profit([7,6,4,3,1])", expected: "0" },
    ],
    hint: "Track min price so far and best profit while iterating once.",
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    pattern: "Hash Map",
    difficulty: "Easy",
    prompt: "Return True if any value appears at least twice in the array.",
    signature: "def contains_duplicate(nums: list[int]) -> bool",
    starter: "def contains_duplicate(nums):\n    pass\n",
    tests: [
      { input: "contains_duplicate([1,2,3,1])", expected: "True" },
      { input: "contains_duplicate([1,2,3,4])", expected: "False" },
    ],
    hint: "One-liner: `len(set(nums)) != len(nums)`.",
  },
  {
    slug: "longest-substring-no-repeat",
    title: "Longest Substring Without Repeating Characters",
    pattern: "Sliding Window",
    difficulty: "Medium",
    prompt: "Return the length of the longest substring without repeating characters.",
    signature: "def length_of_longest_substring(s: str) -> int",
    starter: "def length_of_longest_substring(s):\n    pass\n",
    tests: [
      { input: "length_of_longest_substring('abcabcbb')", expected: "3" },
      { input: "length_of_longest_substring('bbbbb')", expected: "1" },
      { input: "length_of_longest_substring('pwwkew')", expected: "3" },
      { input: "length_of_longest_substring('')", expected: "0" },
    ],
    hint: "Sliding window with a set: expand right; on duplicate, shrink left.",
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    pattern: "Stack / Queue",
    difficulty: "Easy",
    prompt: "Given a string of brackets `()[]{}`, return True if valid.",
    signature: "def is_valid(s: str) -> bool",
    starter: "def is_valid(s):\n    pass\n",
    tests: [
      { input: "is_valid('()')", expected: "True" },
      { input: "is_valid('()[]{}')", expected: "True" },
      { input: "is_valid('(]')", expected: "False" },
      { input: "is_valid('([)]')", expected: "False" },
    ],
    hint: "Push opens onto a stack; on close, check top matches; final stack must be empty.",
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    pattern: "Binary Search",
    difficulty: "Easy",
    prompt: "Search for `target` in a sorted array, return index or -1.",
    signature: "def search(nums: list[int], target: int) -> int",
    starter: "def search(nums, target):\n    pass\n",
    tests: [
      { input: "search([-1,0,3,5,9,12], 9)", expected: "4" },
      { input: "search([-1,0,3,5,9,12], 2)", expected: "-1" },
      { input: "search([], 5)", expected: "-1" },
    ],
    hint: "Classic binary search; careful with the `mid = lo + (hi-lo)//2`.",
  },
  {
    slug: "reverse-linked-list",
    title: "Reverse a Linked List",
    pattern: "Linked List",
    difficulty: "Easy",
    prompt: "Given head of a singly linked list (represented as Python list), return the reversed list.",
    signature: "def reverse_list(nums: list) -> list",
    starter: "def reverse_list(nums):\n    pass\n",
    tests: [
      { input: "reverse_list([1,2,3,4,5])", expected: "[5, 4, 3, 2, 1]" },
      { input: "reverse_list([])", expected: "[]" },
      { input: "reverse_list([7])", expected: "[7]" },
    ],
    hint: "In-place: 3 pointers (prev, cur, next). Or just `return nums[::-1]` (for the warm-up).",
  },
  {
    slug: "fibonacci-memo",
    title: "Fibonacci with Memoization",
    pattern: "Dynamic Programming",
    difficulty: "Easy",
    prompt: "Compute the n-th Fibonacci. Must be efficient for n=50.",
    signature: "def fib(n: int) -> int",
    starter: "def fib(n):\n    pass\n",
    tests: [
      { input: "fib(0)", expected: "0" },
      { input: "fib(10)", expected: "55" },
      { input: "fib(30)", expected: "832040" },
      { input: "fib(50)", expected: "12586269025" },
    ],
    hint: "Bottom-up DP with two variables. Don't use raw recursion — too slow for n=50.",
  },
  {
    slug: "climb-stairs",
    title: "Climbing Stairs",
    pattern: "Dynamic Programming",
    difficulty: "Easy",
    prompt: "You can climb 1 or 2 stairs at a time. How many distinct ways to climb n stairs?",
    signature: "def climb_stairs(n: int) -> int",
    starter: "def climb_stairs(n):\n    pass\n",
    tests: [
      { input: "climb_stairs(1)", expected: "1" },
      { input: "climb_stairs(2)", expected: "2" },
      { input: "climb_stairs(5)", expected: "8" },
      { input: "climb_stairs(45)", expected: "1836311903" },
    ],
    hint: "Same as Fibonacci.",
  },
  {
    slug: "merge-two-sorted",
    title: "Merge Two Sorted Lists",
    pattern: "Two Pointers",
    difficulty: "Easy",
    prompt: "Merge two sorted lists into one sorted list.",
    signature: "def merge_lists(a: list[int], b: list[int]) -> list[int]",
    starter: "def merge_lists(a, b):\n    pass\n",
    tests: [
      { input: "merge_lists([1,2,4],[1,3,4])", expected: "[1, 1, 2, 3, 4, 4]" },
      { input: "merge_lists([],[])", expected: "[]" },
      { input: "merge_lists([],[0])", expected: "[0]" },
    ],
    hint: "Two pointers, append smaller to result, then flush remainder.",
  },
  {
    slug: "k-largest",
    title: "K Largest Elements",
    pattern: "Heap / Priority Queue",
    difficulty: "Medium",
    prompt: "Return the k largest elements in any order.",
    signature: "def k_largest(nums: list[int], k: int) -> list[int]",
    starter: "import heapq\ndef k_largest(nums, k):\n    pass\n",
    tests: [
      { input: "sorted(k_largest([3,2,1,5,6,4], 2))", expected: "[5, 6]" },
      { input: "sorted(k_largest([3,2,3,1,2,4,5,5,6], 4))", expected: "[4, 5, 5, 6]" },
    ],
    hint: "`heapq.nlargest(k, nums)` — or maintain a min-heap of size k.",
  },
  {
    slug: "anagram-groups",
    title: "Group Anagrams",
    pattern: "Hash Map",
    difficulty: "Medium",
    prompt: "Given a list of strings, group anagrams together. Return list of groups (any order within each group).",
    signature: "def group_anagrams(strs: list[str]) -> list[list[str]]",
    starter: "def group_anagrams(strs):\n    pass\n",
    tests: [
      { input: "sorted([sorted(g) for g in group_anagrams(['eat','tea','tan','ate','nat','bat'])])", expected: "[['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']]" },
      { input: "group_anagrams([''])", expected: "[['']]" },
    ],
    hint: "Key each word by sorted(word) or character count tuple.",
  },
  {
    slug: "rotate-array",
    title: "Rotate Array by k",
    pattern: "Arrays & Strings",
    difficulty: "Medium",
    prompt: "Rotate the array to the right by k steps; return the rotated list.",
    signature: "def rotate(nums: list[int], k: int) -> list[int]",
    starter: "def rotate(nums, k):\n    pass\n",
    tests: [
      { input: "rotate([1,2,3,4,5,6,7], 3)", expected: "[5, 6, 7, 1, 2, 3, 4]" },
      { input: "rotate([-1,-100,3,99], 2)", expected: "[3, 99, -1, -100]" },
    ],
    hint: "k %= len(nums); return nums[-k:] + nums[:-k].",
  },
  {
    slug: "level-order",
    title: "Binary Tree Level-Order Traversal",
    pattern: "Trees / BFS / DFS",
    difficulty: "Medium",
    prompt: "Tree given as nested list `[val, left, right]` (None for null). Return level-order traversal as list of lists.",
    signature: "def level_order(root) -> list[list[int]]",
    starter: "from collections import deque\ndef level_order(root):\n    pass\n",
    tests: [
      { input: "level_order([3, [9,None,None], [20,[15,None,None],[7,None,None]]])", expected: "[[3], [9, 20], [15, 7]]" },
      { input: "level_order(None)", expected: "[]" },
    ],
    hint: "BFS with a deque, popping level-size each iteration.",
  },
  {
    slug: "num-islands",
    title: "Number of Islands",
    pattern: "Graph",
    difficulty: "Medium",
    prompt: "Given grid of '1' (land) and '0' (water), count number of connected islands (4-directional).",
    signature: "def num_islands(grid: list[list[str]]) -> int",
    starter: "def num_islands(grid):\n    pass\n",
    tests: [
      { input: "num_islands([['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']])", expected: "3" },
      { input: "num_islands([['0']])", expected: "0" },
    ],
    hint: "DFS or BFS from each unvisited '1', flood-fill to '0'.",
  },
  {
    slug: "single-number",
    title: "Single Number",
    pattern: "Bit Manipulation",
    difficulty: "Easy",
    prompt: "Every element appears twice except one. Find that one. O(1) extra memory.",
    signature: "def single_number(nums: list[int]) -> int",
    starter: "def single_number(nums):\n    pass\n",
    tests: [
      { input: "single_number([2,2,1])", expected: "1" },
      { input: "single_number([4,1,2,1,2])", expected: "4" },
    ],
    hint: "XOR all elements — duplicates cancel, single remains.",
  },
  {
    slug: "house-robber",
    title: "House Robber",
    pattern: "Dynamic Programming",
    difficulty: "Medium",
    prompt: "Cannot rob two adjacent houses. Return max amount you can rob.",
    signature: "def rob(nums: list[int]) -> int",
    starter: "def rob(nums):\n    pass\n",
    tests: [
      { input: "rob([1,2,3,1])", expected: "4" },
      { input: "rob([2,7,9,3,1])", expected: "12" },
      { input: "rob([])", expected: "0" },
    ],
    hint: "DP: f(i) = max(f(i-1), f(i-2) + nums[i]). Two-variable rolling.",
  },
  {
    slug: "lc-coin-change",
    title: "Coin Change (Min Coins)",
    pattern: "Dynamic Programming",
    difficulty: "Medium",
    prompt: "Given coin denominations and amount, return fewest coins needed (or -1).",
    signature: "def coin_change(coins: list[int], amount: int) -> int",
    starter: "def coin_change(coins, amount):\n    pass\n",
    tests: [
      { input: "coin_change([1,2,5], 11)", expected: "3" },
      { input: "coin_change([2], 3)", expected: "-1" },
      { input: "coin_change([1], 0)", expected: "0" },
    ],
    hint: "DP table of size amount+1; dp[x] = min over coins of dp[x-c]+1.",
  },
  {
    slug: "permutations",
    title: "Generate Permutations",
    pattern: "Backtracking",
    difficulty: "Medium",
    prompt: "Return all permutations of a distinct-integer list (any order).",
    signature: "def permute(nums: list[int]) -> list[list[int]]",
    starter: "def permute(nums):\n    pass\n",
    tests: [
      { input: "sorted(permute([1,2,3]))", expected: "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]" },
      { input: "permute([1])", expected: "[[1]]" },
    ],
    hint: "Use itertools.permutations or backtrack swap.",
  },
  {
    slug: "trap-rain-water",
    title: "Trapping Rain Water",
    pattern: "Two Pointers",
    difficulty: "Hard",
    prompt: "Given height map, compute total water trapped after raining.",
    signature: "def trap(height: list[int]) -> int",
    starter: "def trap(height):\n    pass\n",
    tests: [
      { input: "trap([0,1,0,2,1,0,1,3,2,1,2,1])", expected: "6" },
      { input: "trap([4,2,0,3,2,5])", expected: "9" },
    ],
    hint: "Two pointers from both ends, track left_max and right_max.",
  },
  {
    slug: "median-two-sorted",
    title: "Median of Two Sorted Arrays",
    pattern: "Binary Search",
    difficulty: "Hard",
    prompt: "Find the median of the union of two sorted arrays. O(log(m+n)) preferred.",
    signature: "def find_median(a: list[int], b: list[int]) -> float",
    starter: "def find_median(a, b):\n    pass\n",
    tests: [
      { input: "find_median([1,3],[2])", expected: "2.0" },
      { input: "find_median([1,2],[3,4])", expected: "2.5" },
    ],
    hint: "Merge gives O(m+n) — fine for warm-up. Real binary-search solution is partition-based.",
  },
];

export function problemsByPattern() {
  const m = new Map<string, DSAProblem[]>();
  for (const p of DSA_PROBLEMS) {
    if (!m.has(p.pattern)) m.set(p.pattern, []);
    m.get(p.pattern)!.push(p);
  }
  return m;
}

export function findProblem(slug: string) {
  return DSA_PROBLEMS.find((p) => p.slug === slug);
}
