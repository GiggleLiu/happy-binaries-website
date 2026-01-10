+++
title = "Vibe Coding Done Right"
tags = ["blog", "ai", "testing", "software-engineering"]
+++

# Vibe Coding Done Right

## What is Vibe Coding?

**Vibe coding** is a development style where you describe what you want in natural language and let AI assistants (Claude, Cursor, Copilot, etc.) generate the implementation. Instead of wrestling with syntax, you guide with intent.

There's been much debate about vibe coding: Can it produce software with real value? Should we understand every line of AI-generated code? Through my own experience, I've discovered something counterintuitive—**even if you can't read the code, it can still be valuable**.

I've released two Rust packages, [omeco](https://github.com/GiggleLiu/omeco) and [tropical-gemm](https://github.com/TensorBFS/tropical-gemm), without fully understanding Rust grammar. By properly defining their behavior through tests, I'm confident these packages are already useful for researchers. This taught me a fundamental lesson: we should focus on **software behavior** and **tests**, not on reading implementation details.

## The Test-driven Vibe Coding

Vibe coding is a double-edged sword. Unchecked, it produces plausible-looking garbage. Done right, it's a superpower. The productivity of vibe coding follows this hierarchy:

$$\text{Vibe coding freely} < \text{Human coding} < \text{Vibe coding + Tests}$$

Without validation, AI-generated code quickly becomes garbage—no guarantee of correctness, no one understands it, no clear path to improvement. A growing number of researchers raise concerns about this trust crisis. This post introduces a systematic approach to vibe coding that avoids these pitfalls.

From a quantum scientist's perspective, vibe coding mirrors quantum error correction:

> *I cannot directly touch the quantum information (or code), but I can still ensure its correctness.*

Quantum error correction works by measuring syndromes and correcting errors. When all syndromes match expectations, the quantum state is very likely to be correct.

Vibe coding works the same way. Tests act as syndromes, revealing whether the code behaves as expected.
In software engineering, a **test** is a statement that is asserted to be true. It defines an expected property or behavior of the code. For example:

```python
def test_ground_state_energy():
    # Two-site Heisenberg chain has known ground state energy
    H = heisenberg_hamiltonian(n_sites=2)
    E0 = find_ground_state_energy(H)
    assert abs(E0 - (-0.75)) < 1e-10  # This statement must be true
```

This test asserts that the ground state energy of a two-site Heisenberg chain must equal -0.75 (within numerical precision). When all tests pass (all assertions hold true), the code is very likely to be correct. When they fail, the test output tells the AI exactly how to fix the code.

Tests come in two main types: **unit tests** verify individual functions in isolation (like testing a single matrix operation), while **integration tests** verify that multiple components work together correctly (like checking that your Hamiltonian constructor properly interfaces with the eigenvalue solver).

![](/assets/images/qec.svg)

How do you get tests right in practice? I recommend a three-stage approach:
1. Let AI prove itself correct.
2. Use your domain expertise.
3. Fall back to literature.

## Stage 1: Let AI Prove Itself Correct

With minimal effort, you can ask AI to generate tests that prove its own code correct. More importantly, automate this pipeline with GitHub Actions to ensure consistency over time.

```
Setup test cases.
Setup GitHub Actions to automate this test pipeline.
Improve test coverage to >95%.
```

Modern software engineering uses test coverage to quantify how much of your code is tested. Well-written software should exceed 95% coverage. Most of these tests will be unit tests—AI excels at generating them automatically for individual functions.

You can also ask AI to search the web for widely-used test cases rather than relying solely on auto-generated tests. These often include integration tests that verify how components work together in realistic scenarios:

```
Search the web (or existing code base) for widely-used test cases and add them to the test suite.
```

## Stage 2: Use Your Domain Expertise

If you have domain expertise, leverage it by asking AI to generate tests that validate domain-specific behavior:

```
Generate a simple example, print intermediate outputs, generate a report in LaTeX format.
```

Or more specifically, if you are working on a quantum ground state finding software:
```
Write an example of finding the ground state of a Heisenberg model.
Compare the result with ITensor.
Summarize into a LaTeX report showing how you constructed the MPS and MPO.
```


For performance-critical software, add benchmarks:
```
Setup a benchmark comparing performance against ITensor.
Setup a Makefile to automate project initialization, tests, and benchmarks.
```

These test cases and benchmarks also benefit your users by addressing reliability concerns. Generate documentation to showcase them:
```
Generate documentation including test cases and benchmarks with a step-by-step user guide.
Setup GitHub Pages to deploy the documentation.
```

Now your code is tested, correct, explainable, and useful. You can present it to others, prove its correctness, and gather feedback.

## Stage 3: Fall Back to Literature

When you lack domain knowledge and aren't sure how to verify correctness, use literature. While not infallible, published research is the most reliable source of knowledge. Ask AI to find relevant papers and compare its implementation against them:

```
Do a literature survey on the Heisenberg model and list existing simulation results for validation.
Add them as test cases.
Generate a LaTeX report explaining your tests, including literature references.
```

Using literature as ground truth lets you validate your software and bootstrap yourself into new fields (e.g., a physicist learning machine learning).

## Summary

The key to successful vibe coding is designing tests. Tests are the dual space of software—instead of defining the implementation, we quantify its properties. If a software works in senario A, B, C, then we expect it to work in senario D, E, F, etc.

Richard Feynman said: "If I cannot create it, I do not understand it." In the era of vibe coding, **if I cannot test it, I do not understand it.**
