/**
 * Mapping of language names and file extensions.
 *
 * Extracted from:
 *
 * - <https://atcoder.jp/contests/code-festival-2018-qualb/rule>
 * - <https://atcoder.jp/contests/judge-update-202004/rules>
 */
export const exts = [
  // 2020
  {
    lang: "C (GCC 9.2.1)",
    ext: ".c",
  },
  {
    lang: "C (Clang 10.0.0)",
    ext: ".c",
  },
  {
    lang: "C++ (GCC 9.2.1)",
    ext: ".cpp",
  },
  {
    lang: "C++ (Clang 10.0.0)",
    ext: ".cpp",
  },
  {
    lang: "Java (OpenJDK 11.0.6)",
    ext: ".java",
  },
  {
    lang: "Python (3.8.2)",
    ext: ".py",
  },
  {
    lang: "Bash (5.0.11)",
    ext: ".sh",
  },
  {
    lang: "bc (1.07.1)",
    ext: ".bc",
  },
  {
    lang: "Awk (GNU Awk 4.1.4)",
    ext: "",
  },
  {
    lang: "C# (.NET Core 3.1.201)",
    ext: ".cs",
  },
  {
    lang: "C# (Mono-mcs 6.8.0.105)",
    ext: ".cs",
  },
  {
    lang: "C# (Mono-csc 3.5.0)",
    ext: ".cs",
  },
  {
    lang: "Clojure (1.10.1.536)",
    ext: ".clj",
  },
  {
    lang: "Crystal (0.33.0)",
    ext: ".cr",
  },
  {
    lang: "D (DMD 2.091.0)",
    ext: ".d",
  },
  {
    lang: "D (GDC 9.2.1)",
    ext: ".d",
  },
  {
    lang: "D (LDC 1.20.1)",
    ext: ".d",
  },
  {
    lang: "Dart (2.7.2)",
    ext: ".dart",
  },
  {
    lang: "dc (1.4.1)",
    ext: ".dc",
  },
  {
    lang: "Erlang (22.3)",
    ext: ".erl",
  },
  {
    lang: "Elixir (1.10.2)",
    ext: ".ex",
  },
  {
    lang: "F# (.NET Core 3.1.201)",
    ext: ".fs",
  },
  {
    lang: "F# (Mono 10.2.3)",
    ext: ".fs",
  },
  {
    lang: "Forth (gforth 0.7.3)",
    ext: ".fs",
  },
  {
    lang: "Fortran(GNU Fortran 9.2.1)",
    ext: ".f08",
  },
  {
    lang: "Go (1.14.1)",
    ext: ".go",
  },
  {
    lang: "Haskell (GHC 8.8.3)",
    ext: ".hs",
  },
  {
    lang: "Haxe (4.0.3); js",
    ext: ".js",
  },
  {
    lang: "Haxe (4.0.3); Java",
    ext: "",
  },
  {
    lang: "JavaScript (Node.js 12.16.1)",
    ext: ".js",
  },
  {
    lang: "Julia (1.4.0)",
    ext: ".jl",
  },
  {
    lang: "Kotlin (1.3.71)",
    ext: ".kt",
  },
  {
    lang: "Lua (Lua 5.3.5)",
    ext: ".lua",
  },
  {
    lang: "Lua (LuaJIT 2.1.0)",
    ext: ".lua",
  },
  {
    lang: "Dash (0.5.8)",
    ext: ".sh",
  },
  {
    lang: "Nim (1.0.6)",
    ext: ".nim",
  },
  {
    lang: "Objective-C (Clang 10.0.0)",
    ext: ".m",
  },
  {
    lang: "Common Lisp (SBCL 2.0.3)",
    ext: "",
  },
  {
    lang: "OCaml (4.10.0)",
    ext: ".ml",
  },
  {
    lang: "Octave (5.2.0)",
    ext: ".m",
  },
  {
    lang: "Pascal (FPC 3.0.4)",
    ext: ".pas",
  },
  {
    lang: "Perl (5.26.1)",
    ext: ".pl",
  },
  {
    lang: "Raku (Rakudo 2020.02.1)",
    ext: ".p6",
  },
  {
    lang: "PHP (7.4.4)",
    ext: ".php",
  },
  {
    lang: "Prolog (SWI-Prolog 8.0.3)",
    ext: ".pl",
  },
  {
    lang: "PyPy2 (7.3.0)",
    ext: ".py",
  },
  {
    lang: "PyPy3 (7.3.0)",
    ext: ".py",
  },
  {
    lang: "Racket (7.6)",
    ext: ".rkt",
  },
  {
    lang: "Ruby (2.7.1)",
    ext: ".rb",
  },
  {
    lang: "Rust (1.42.0)",
    ext: ".rs",
  },
  {
    lang: "Scala (2.13.1)",
    ext: ".scala",
  },
  {
    lang: "Java (OpenJDK 1.8.0)",
    ext: ".java",
  },
  {
    lang: "Scheme (Gauche 0.9.9)",
    ext: ".scm",
  },
  {
    lang: "Standard ML (MLton 20130715)",
    ext: ".sml",
  },
  {
    lang: "Swift (5.2.1)",
    ext: ".swift",
  },
  {
    lang: "Text (cat 8.28)",
    ext: ".txt",
  },
  {
    lang: "TypeScript (3.8)",
    ext: ".ts",
  },
  {
    lang: "Visual Basic (.NET Core 3.1.101)",
    ext: ".vb",
  },
  {
    lang: "Zsh (5.4.2)",
    ext: ".sh",
  },
  {
    lang: "COBOL - Fixed (OpenCOBOL 1.1.0)",
    ext: ".cob",
  },
  {
    lang: "COBOL - Free (OpenCOBOL 1.1.0)",
    ext: ".cob",
  },
  {
    lang: "Brainfuck (bf 20041219)",
    ext: ".bf",
  },
  {
    lang: "Ada2012 (GNAT 9.2.1)",
    ext: ".adb",
  },
  {
    lang: "Unlambda (2.0.0)",
    ext: ".unl",
  },
  {
    lang: "Cython (0.29.16)",
    ext: ".pyx",
  },
  {
    lang: "Sed (4.4)",
    ext: ".sed",
  },
  {
    lang: "Vim (8.2.0460)",
    ext: ".vim",
  },

  // Before 2020
  {
    lang: "C++14 (GCC 5.4.1)",
    ext: ".cpp",
  },
  {
    lang: "Bash (GNU bash v4.3.11)",
    ext: ".sh",
  },
  {
    lang: "C (GCC 5.4.1)",
    ext: ".c",
  },
  {
    lang: "C (Clang 3.8.0)",
    ext: ".c",
  },
  {
    lang: "C++14 (Clang 3.8.0)",
    ext: ".cpp",
  },
  {
    lang: "C# (Mono 4.6.2.0)",
    ext: ".cs",
  },
  {
    lang: "Clojure (1.8.0)",
    ext: ".clj",
  },
  {
    lang: "Common Lisp (SBCL 1.1.14)",
    ext: ".lisp",
  },
  {
    lang: "D (DMD64 v2.070.1)",
    ext: ".d",
  },
  {
    lang: "D (LDC 0.17.0)",
    ext: ".d",
  },
  {
    lang: "D (GDC 4.9.4)",
    ext: ".d",
  },
  {
    lang: "Fortran (gfortran v4.8.4)",
    ext: ".f08",
  },
  {
    lang: "Go (1.6)",
    ext: ".go",
  },
  {
    lang: "Haskell (GHC 7.10.3)",
    ext: ".hs",
  },
  {
    lang: "Java7 (OpenJDK 1.7.0)",
    ext: ".java",
  },
  {
    lang: "Java8 (OpenJDK 1.8.0)",
    ext: ".java",
  },
  {
    lang: "JavaScript (node.js v5.12)",
    ext: ".js",
  },
  {
    lang: "OCaml (4.02.3)",
    ext: ".ml",
  },
  {
    lang: "Pascal (FPC 2.6.2)",
    ext: ".pas",
  },
  {
    lang: "Perl (v5.18.2)",
    ext: ".pl",
  },
  {
    lang: "PHP (5.6.30)",
    ext: ".php",
  },
  {
    lang: "Python2 (2.7.6)",
    ext: ".py",
  },
  {
    lang: "Python3 (3.4.3)",
    ext: ".py",
  },
  {
    lang: "Ruby (2.3.3)",
    ext: ".rb",
  },
  {
    lang: "Scala (2.11.7)",
    ext: ".scala",
  },
  {
    lang: "Scheme (Gauche 0.9.3.3)",
    ext: ".scm",
  },
  {
    lang: "Text (cat)",
    ext: ".txt",
  },
  {
    lang: "Visual Basic (Mono 4.0.1)",
    ext: ".vb",
  },
  {
    lang: "C++ (GCC 5.4.1)",
    ext: ".cpp",
  },
  {
    lang: "C++ (Clang 3.8.0)",
    ext: ".cpp",
  },
  {
    lang: "Objective-C (GCC 5.3.0)",
    ext: ".m",
  },
  {
    lang: "Objective-C (Clang3.8.0)",
    ext: ".m",
  },
  {
    lang: "Swift (swift-2.2-RELEASE)",
    ext: ".swift",
  },
  {
    lang: "Rust (1.15.1)",
    ext: ".rs",
  },
  {
    lang: "Sed (GNU sed 4.2.2)",
    ext: ".sed",
  },
  {
    lang: "Awk (mawk 1.3.3)",
    ext: ".awk",
  },
  {
    lang: "Brainfuck (bf 20041219)",
    ext: ".bf",
  },
  {
    lang: "Standard ML (MLton 20100608)",
    ext: ".sml",
  },
  {
    lang: "PyPy2 (5.6.0)",
    ext: ".py",
  },
  {
    lang: "PyPy3 (2.4.0)",
    ext: ".py",
  },
  {
    lang: "Crystal (0.20.5)",
    ext: ".cr",
  },
  {
    lang: "F# (Mono 4.0)",
    ext: ".fs",
  },
  {
    lang: "Unlambda (0.1.3)",
    ext: ".unl",
  },
  {
    lang: "Lua (5.3.2)",
    ext: ".lua",
  },
  {
    lang: "LuaJIT (2.0.4)",
    ext: ".lua",
  },
  {
    lang: "MoonScript (0.5.0)",
    ext: ".moon",
  },
  {
    lang: "Ceylon (1.2.1)",
    ext: ".ceylon",
  },
  {
    lang: "Julia (0.5.0)",
    ext: ".jl",
  },
  {
    lang: "Octave (4.0.2)",
    ext: ".m",
  },
  {
    lang: "Nim (0.13.0)",
    ext: ".nim",
  },
  {
    lang: "TypeScript (2.1.6)",
    ext: ".ts",
  },
  {
    lang: "Perl6 (rakudo-star 2016.01)",
    ext: ".p6",
  },
  {
    lang: "Kotlin (1.0.0)",
    ext: ".kt",
  },
  {
    lang: "PHP7 (7.0.15)",
    ext: ".php",
  },
  {
    lang: "COBOL - Fixed (OpenCOBOL 1.1.0)",
    ext: ".cob",
  },
  {
    lang: "COBOL - Free (OpenCOBOL 1.1.0)",
    ext: ".cob",
  },
]
