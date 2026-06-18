# Verité OS

A zero-trust cryptographic and forensic image verification engine. 

Verité verifies media authenticity through a three-tier waterfall architecture, falling back from cryptographic ledger validation to binary-level entropy analysis when metadata is stripped.

## Architecture

**Tier 1: Cryptographic Ledger**
- Calculates a local SHA-256 hash of the raw `ArrayBuffer` on the client.
- Queries a local SQLite ledger (`verite_ledger.sqlite`).
- If matched, media is mathematically verified.

**Tier 2: Deep Forensics**
- Extracts XMP, EXIF, and IPTC metadata using `exifr`.
- Validates native camera hardware signatures (Make/Model).
- Cross-references a dictionary of 40+ known software manipulation tags (e.g., Photoshop, SynthID, C2PA, Midjourney).

**Tier 3: Binary Synthesis & Heuristics**
- Reads hexadecimal Magic Numbers to ascertain absolute file format, bypassing falsified extensions.
- Calculates Shannon Entropy (Information Density) to analyze compression floors.
- Synthesizes structural math with CDN filename footprints to identify stripped media origins (e.g., Reddit, X, Generative AI).

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/verite.git
   cd verite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

*Note: The SQLite ledger (`verite_ledger.sqlite`) is automatically initialized upon the first POST request to `/api/register`.*

## API Reference

### POST `/api/register`
Writes a SHA-256 hash to the SQLite ledger.
- **Payload:** `{ "hash": "string" }`
- **Response:** `{ "success": boolean, "hash": "string" }`

### POST `/api/verify`
Queries the SQLite ledger for a specific hash.
- **Payload:** `{ "hash": "string" }`
- **Response:** `{ "verified": boolean }`

### POST `/api/deep-scan`
Executes Tier 3 binary analysis on an unverified file.
- **Payload:** `multipart/form-data` (Key: `file`)
- **Response:**
  ```json
  {
    "success": true,
    "isAI": false,
    "confidence": 0,
    "detectedSource": "HIGH-EFFICIENCY COMPRESSED WEBP | SOURCE: REDDIT",
    "apiStatus": "Offline Engine (Local)",
    "debug": {
      "entropy": "7.9981",
      "fileSizeMB": "0.45",
      "density": "17.77"
    }
  }
  ```

## License
MIT License
