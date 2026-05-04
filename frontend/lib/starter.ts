// Starter snippets shown when a user first opens a problem in a given language.

export const STARTERS: Record<string, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // your code here

    return 0;
}
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();

        // your code here

        System.out.print(sb);
    }
}
`,
  python: `import sys

def main():
    data = sys.stdin.read().split()
    # your code here

if __name__ == "__main__":
    main()
`,
  javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');

// your code here
`,
};

export function starterFor(lang: string): string {
  return STARTERS[lang] ?? '';
}
