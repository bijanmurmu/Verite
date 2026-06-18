# Contributing to Verité OS

We welcome contributions to Verité. Please follow these guidelines to maintain the strict zero-trust security architecture of the project.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The local SQLite ledger (`verite_ledger.sqlite`) will automatically initialize on your first test upload.

## Architectural Rules

- **Zero External APIs:** Do not introduce dependencies on third-party cloud APIs. All forensic analysis and cryptography must execute locally on the server or client to maintain Zero-Trust.
- **Data Privacy:** Do not store the actual image buffers or media files anywhere. Only cryptographic SHA-256 hashes may be written to the SQLite ledger.
- **Strict Heuristics:** If modifying the Tier 3 Math Engine, ensure zero false-positives for high-density organic PNGs. Do not use file extensions to ascertain format; always read the binary hexadecimal magic numbers.

## Pull Request Process

1. Create a new branch for your feature (`git checkout -b feature/your-feature-name`).
2. Ensure your code strictly adheres to the architectural rules above.
3. Verify that `npm run build` completes without TypeScript or linting errors.
4. Submit a Pull Request with a clear, highly technical description of the forensic vectors you are adding or modifying.
