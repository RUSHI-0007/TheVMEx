"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface ScanResult {
  ticketId: string;
  orderId: string;
  attendeeName: string;
  tierName: string;
  quantity: number;
  status: string;
  college: string;
  phone: string;
  email: string;
}

interface ScanState {
  status: "idle" | "scanning" | "found" | "invalid" | "error";
  result: ScanResult | null;
  message: string;
}

export function TicketScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<boolean>(false);

  const [scan, setScan] = useState<ScanState>({
    status: "idle",
    result: null,
    message: "",
  });
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScan({ status: "scanning", result: null, message: "Point camera at ticket QR code" });
      scanFrame();
    } catch {
      setScan({ status: "error", result: null, message: "Camera access denied. Allow camera in browser settings." });
    }
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScan({ status: "idle", result: null, message: "" });
    lastScannedRef.current = "";
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data && code.data !== lastScannedRef.current && !cooldownRef.current) {
      lastScannedRef.current = code.data;
      cooldownRef.current = true;
      handleQrData(code.data);
      // 3-second cooldown before next scan
      setTimeout(() => { cooldownRef.current = false; }, 3000);
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQrData = async (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const { ticketId, orderId } = parsed;

      if (!ticketId || !orderId) {
        setScan({ status: "invalid", result: null, message: "Not a valid TheVMEx ticket QR." });
        return;
      }

      setScan({ status: "scanning", result: null, message: "Verifying ticket..." });

      const res = await fetch(`/api/orders/lookup?q=${encodeURIComponent(ticketId)}`);
      const data = await res.json();

      if (!res.ok || !data.orders?.length) {
        setScan({ status: "invalid", result: null, message: "Ticket not found in system." });
        return;
      }

      const order = data.orders[0];

      if (order.status !== "approved") {
        setScan({
          status: "invalid",
          result: null,
          message: `Ticket status: ${order.status}. Entry not permitted.`,
        });
        return;
      }

      setScan({
        status: "found",
        result: {
          ticketId: order.ticketId,
          orderId: order.orderId,
          attendeeName: order.attendeeName,
          tierName: order.tierName,
          quantity: order.quantity,
          status: order.status,
          college: order.college,
          phone: order.phone,
          email: order.email,
        },
        message: "VALID TICKET ✓",
      });
    } catch {
      setScan({ status: "invalid", result: null, message: "QR code not recognised. Not a TheVMEx ticket." });
    }
  };

  const reset = () => {
    lastScannedRef.current = "";
    cooldownRef.current = false;
    setScan({ status: "scanning", result: null, message: "Point camera at ticket QR code" });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto p-4 md:p-8">
      <h2 className="font-display text-2xl text-gold mb-2">Ticket Scanner</h2>
      <p className="text-text-muted text-sm mb-6">
        Scan attendee QR codes at the entry gate. Valid tickets show green; invalid show red.
      </p>

      {/* Camera viewport */}
      <div className="relative bg-black border border-gold/20 aspect-square overflow-hidden mb-4">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan overlay */}
        {cameraActive && scan.status === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 border-2 border-gold opacity-70">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gold" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gold" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gold" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gold" />
            </div>
          </div>
        )}

        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary">
            <p className="text-text-muted text-sm">Camera off</p>
          </div>
        )}
      </div>

      {/* Status message */}
      {scan.message && (
        <div
          className={`p-3 text-center text-sm mb-4 border ${
            scan.status === "found"
              ? "border-emerald-500/50 bg-emerald-900/20 text-emerald-400"
              : scan.status === "invalid" || scan.status === "error"
              ? "border-red-500/50 bg-red-900/20 text-red-400"
              : "border-gold/20 text-text-muted"
          }`}
        >
          {scan.message}
        </div>
      )}

      {/* Scan result */}
      {scan.status === "found" && scan.result && (
        <div className="border-2 border-emerald-500/50 bg-emerald-900/10 p-5 mb-4">
          <p className="text-emerald-400 font-display text-xl mb-3">✓ ENTRY PERMITTED</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-widest mb-0.5">Name</p>
              <p className="text-text-primary font-medium">{scan.result.attendeeName}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-widest mb-0.5">Ticket ID</p>
              <p className="text-gold font-display">{scan.result.ticketId}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-widest mb-0.5">Tier</p>
              <p className="text-text-primary">{scan.result.tierName} × {scan.result.quantity}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-widest mb-0.5">College</p>
              <p className="text-text-primary">{scan.result.college}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-widest mb-0.5">Phone</p>
              <p className="text-text-primary">{scan.result.phone}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-widest mb-0.5">Order</p>
              <p className="text-text-muted text-xs">{scan.result.orderId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!cameraActive ? (
          <button
            type="button"
            onClick={startCamera}
            className="flex-1 py-3 border border-gold text-gold hover:bg-gold/10 transition-colors text-sm uppercase tracking-widest"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-3 border border-gold text-gold hover:bg-gold/10 transition-colors text-sm uppercase tracking-widest"
            >
              Scan Next
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="py-3 px-4 border border-gold/20 text-text-muted hover:border-gold/40 transition-colors text-sm"
            >
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
}
