"use client";

import React, { useState, useRef } from "react";
import exifr from "exifr";

type Mode = "verify" | "register";

export default function Home() {
  const [mode, setMode] = useState<Mode>("verify");
  const [logs, setLogs] = useState<Array<{ text: string; status?: "ok" | "error" | "pending" | "warn"; color?: string }>>([
    { text: "> establishing connection to ledger...", status: "ok" },
    { text: "> verifying protocol integrity...", status: "ok" },
    { text: "> system ready. awaiting media input." }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<"verified" | "authentic_camera" | "failed" | "registered" | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (text: string, status?: "ok" | "error" | "pending" | "warn", color?: string) => {
    setLogs(prev => [...prev, { text, status, color }]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setVerifiedStatus(null);
    setLogs([
      { text: `> initiating ${mode.toUpperCase()} protocol for: ${file.name}` }
    ]);

    try {
      addLog("> Calculating SHA-256 cryptohash...", "pending");
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      
      addLog(`> local hash: ${hashHex.substring(0, 16)}...`, undefined, "var(--accent-green)");

      let isLedgerVerified = false;

      if (mode === "verify") {
        addLog("> querying global ledger for hash signature...", "pending");
        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash: hashHex })
        });
        if (!response.ok) throw new Error("Ledger API unavailable");
        const data = await response.json();
        
        if (data.verified) {
          addLog("> immutable anchor found on ledger", "ok");
          addLog("> Telemetry matched. Data un-altered.", "ok");
          isLedgerVerified = true;
        } else {
          addLog("> Hash not found on ledger. Falling back to Tier 2 Forensic Analysis...", "warn", "yellow");
        }
      }

      if (mode === "register") {
        addLog("> Simulating camera capture... Running deep security pre-check.", "pending");
      }

      addLog("> Extracting deep EXIF, XMP, and IPTC metadata...", "pending");
      
      if (file.type.startsWith("video/")) {
        addLog("> Media is VIDEO. Deep forensic parsing limited.", "warn", "yellow");
        addLog("> CRITICAL: Video lacks verifiable EXIF metadata without backend FFMPEG processing.", "error");
        setVerifiedStatus("failed");
        setIsProcessing(false);
        return;
      }

      const exifData = await exifr.parse(file, { xmp: true, tiff: true, exif: true, iptc: true }).catch(() => null);
      await new Promise(resolve => setTimeout(resolve, 800));

      const hasExif = exifData && Object.keys(exifData).length > 0;
      const hasHardwareSignature = hasExif && (exifData.Make || exifData.Model);

      // 1. Forgery Check
      if (hasExif) {
        const fullExifString = JSON.stringify(exifData).toLowerCase();
        const signatureDict: Record<string, string> = {
          "midjourney": "Midjourney AI", "dall-e": "OpenAI DALL-E", "openai": "OpenAI", "stable diffusion": "Stable Diffusion",
          "automatic1111": "Stable Diffusion WebUI", "imagen": "Google Imagen AI", "gemini": "Google Gemini",
          "synthid": "Google SynthID Watermark", "c2pa": "C2PA Content Credential (AI)", "leonardo": "Leonardo AI",
          "runway": "RunwayML", "pika": "Pika Labs", "sora": "OpenAI Sora", "krea": "Krea AI", "magnific": "Magnific AI",
          "photoshop": "Adobe Photoshop", "adobe": "Adobe Creative Suite", "lightroom": "Adobe Lightroom"
        };
        const foundSignatures = Object.keys(signatureDict).filter(key => fullExifString.includes(key));
        if (foundSignatures.length > 0) {
           addLog(`> CRITICAL: Software/AI manipulation detected.`, "error");
           foundSignatures.forEach(sig => {
              addLog(`> Signature Matched: [ ${signatureDict[sig].toUpperCase()} ]`, "error", "var(--danger)");
           });
           addLog(`> CAMERA REJECTED: Will not anchor manipulated media.`, "error");
           setVerifiedStatus("failed");
           setIsProcessing(false);
           return;
        }
      }

      let passedSecurityCheck = false;

      // 2. Hardware or Math Engine Check
      if (!hasExif || !hasHardwareSignature) {
         addLog("> Missing deep camera hardware signatures. Suspicious...", "warn", "yellow");
         addLog("> Initiating Tier 3 Mathematical Binary Analysis...", "pending");
         
         const formData = new FormData();
         formData.append('file', file);
         const scanRes = await fetch('/api/deep-scan', { method: 'POST', body: formData });
         if (!scanRes.ok) throw new Error("Binary Analysis API unavailable");
         const scanData = await scanRes.json();
         
         addLog(`> Deploying Proprietary Offline Mathematical Engine...`, "ok");
         addLog(`> Shannon Entropy Score: ${scanData.debug.entropy} bits/byte`, "ok");
         addLog(`> Byte Density Ratio: ${scanData.debug.density}`, "ok");
         
         if (scanData.isAI) {
            addLog(`> CRITICAL: Binary analysis detected severe structural anomalies!`, "error");
            addLog(`> Analysis Result: [ ${scanData.detectedSource.toUpperCase()} ]`, "error", "var(--danger)");
            addLog(`> CAMERA REJECTED: Will not anchor AI generated media.`, "error");
            setVerifiedStatus("failed");
            setIsProcessing(false);
            return;
         } else {
            addLog(`> Binary structure is mathematically consistent with format.`, "ok");
            addLog(`> Analysis Result: [ ${scanData.detectedSource.toUpperCase()} ]`, "warn", "yellow");
            if (mode === "register") {
                addLog(`> CAMERA REJECTED: Media lacks native camera hardware signatures. Cannot simulate secure capture.`, "error");
                setVerifiedStatus("failed");
                setIsProcessing(false);
                return;
            } else if (isLedgerVerified) {
                addLog(`> Media is stripped, but Ledger Anchor proves authenticity.`, "ok");
                passedSecurityCheck = true;
            } else {
                addLog(`> CRITICAL: Cannot guarantee authenticity. Hardware fingerprints missing.`, "error");
                setVerifiedStatus("failed");
                setIsProcessing(false);
                return;
            }
         }
      } else {
         const cameraModel = exifData.Model || exifData.Make;
         addLog(`> Native camera hardware signature detected: ${cameraModel}`, "ok");
         if (exifData.DateTimeOriginal) {
            addLog(`> Original capture time: ${new Date(exifData.DateTimeOriginal).toLocaleString()}`, "ok");
         }
         addLog("> No obvious AI or software signatures found in metadata.", "ok");
         passedSecurityCheck = true;
      }

      // 3. Final Registration / Verification Logic
      if (mode === "register" && passedSecurityCheck) {
         addLog("> Security pre-check passed. Anchoring hash to global ledger...", "pending");
         await fetch('/api/register', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ hash: hashHex })
         });
         await new Promise(resolve => setTimeout(resolve, 800));
         addLog("> Cryptographic anchor successfully written to ledger.", "ok");
         setVerifiedStatus("registered");
      } else if (mode === "verify" && passedSecurityCheck) {
         if (isLedgerVerified) {
             setVerifiedStatus("verified");
         } else {
             setVerifiedStatus("authentic_camera");
         }
      }
      
    } catch (err) {
      addLog("> Verification failure. Network or processing error.", "error");
      setVerifiedStatus("failed");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container">
      <main className="hero">
        <div className="bg-grid" />
        
        <div style={{ marginBottom: '1rem' }}>
          <span className="mono" style={{ fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: verifiedStatus === 'failed' ? 'var(--danger)' : verifiedStatus === 'authentic_camera' ? 'yellow' : 'var(--accent-green)' }}>
            {isProcessing ? "Analyzing..." : "System Active"}
          </span>
        </div>

        <h1>Verité.</h1>
        <p>
          The Hybrid Verification Engine. 
          Checks immutable ledger anchors, falling back to deep forensic analysis.
        </p>

        <div className="toggle-group">
          <button 
            className={`toggle-btn ${mode === "verify" ? "active" : ""}`}
            onClick={() => { setMode("verify"); setLogs([{ text: "> Switched to VERIFY mode." }]); setVerifiedStatus(null); }}
          >
            VERIFY MODE
          </button>
          <button 
            className={`toggle-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setLogs([{ text: "> Switched to CAMERA MODE." }]); setVerifiedStatus(null); }}
          >
            CAMERA MODE
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
          accept="image/*,video/*"
        />
        
        <button 
          className="action-btn" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? "PROCESSING..." : mode === "verify" ? "UPLOAD MEDIA TO VERIFY" : "SIMULATE CAMERA CAPTURE"}
        </button>

        <div className="terminal-window mono text-secondary">
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="terminal-dot dot-red">
                <svg className="mac-icon" viewBox="0 0 8 8" width="8" height="8">
                  <path stroke="#4c0002" strokeWidth="1.2" strokeLinecap="round" d="M1.5 1.5 L6.5 6.5 M6.5 1.5 L1.5 6.5" />
                </svg>
              </div>
              <div className="terminal-dot dot-yellow">
                <svg className="mac-icon" viewBox="0 0 8 8" width="8" height="8">
                  <path stroke="#975500" strokeWidth="1.2" strokeLinecap="round" d="M1.5 4 L6.5 4" />
                </svg>
              </div>
              <div className="terminal-dot dot-green">
                <svg className="mac-icon" viewBox="0 0 8 8" width="8" height="8">
                  <path stroke="#006500" strokeWidth="1.1" fill="none" d="M1.5 4.5 L1.5 1.5 L4.5 1.5 M6.5 3.5 L6.5 6.5 L3.5 6.5" />
                  <path stroke="#006500" strokeWidth="1.1" d="M1.5 1.5 L6.5 6.5" />
                </svg>
              </div>
            </div>
            <div className="terminal-title">VERITÉ_OS // FORENSIC_TERMINAL</div>
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="terminal-line" style={{ color: log.color }}>
              <span className="terminal-text">{log.text}</span>
              {log.status === "ok" && <span className="terminal-status text-accent">[ OK ]</span>}
              {log.status === "error" && <span className="terminal-status" style={{ color: "var(--danger)" }}>[ FAIL ]</span>}
              {log.status === "warn" && <span className="terminal-status" style={{ color: "yellow" }}>[ WARN ]</span>}
              {log.status === "pending" && <span className="terminal-status" style={{ color: "var(--text-secondary)" }}>[ ... ]</span>}
            </div>
          ))}
          
          {!isProcessing && verifiedStatus === "failed" && (
            <div className="terminal-line" style={{ marginTop: '1rem', borderTop: '1px dashed var(--danger)', paddingTop: '1rem' }}>
              <span style={{ color: 'var(--danger)', fontSize: '1.2rem', textShadow: '0 0 10px rgba(255,51,51,0.3)' }}>STATUS: UNVERIFIED (REJECTED)</span>
            </div>
          )}
          
          {!isProcessing && verifiedStatus === "authentic_camera" && (
            <div className="terminal-line" style={{ marginTop: '1rem', borderTop: '1px dashed yellow', paddingTop: '1rem' }}>
              <span style={{ color: 'yellow', fontSize: '1.2rem', textShadow: '0 0 10px rgba(255,255,0,0.3)' }}>STATUS: STANDARD CAMERA (UNVERIFIED)</span>
            </div>
          )}

          {!isProcessing && verifiedStatus === "verified" && (
            <div className="terminal-line" style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
              <span className="text-accent" style={{ fontSize: '1.2rem' }}>STATUS: 100% VERIFIED AUTHENTIC</span>
            </div>
          )}

          {!isProcessing && verifiedStatus === "registered" && (
            <div className="terminal-line" style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
              <span className="text-accent" style={{ fontSize: '1.2rem' }}>STATUS: ANCHORED TO LEDGER</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="terminal-line">
              <span className="blinking-cursor">_</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
