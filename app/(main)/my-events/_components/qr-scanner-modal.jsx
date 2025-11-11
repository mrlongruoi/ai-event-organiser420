// app/my-events/[eventId]/_components/qr-scanner-modal.jsx
"use client";

import { useState, useEffect } from "react";
import { QrCode, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Html5QrcodeScanner } from "html5-qrcode";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QRScannerModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("scan");
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanner, setScanner] = useState(null);

  const { mutate: checkInAttendee, isLoading } = useConvexMutation(
    api.registrations.checkInAttendee
  );

  const handleCheckIn = async (qrCode) => {
    try {
      const result = await checkInAttendee({ qrCode });
      setScanResult(result);

      if (result.success) {
        toast.success("Check-in successful! ✅");
      } else {
        toast.error(result.message);
      }

      // Auto-close after 2 seconds on success
      if (result.success) {
        setTimeout(() => {
          setScanResult(null);
          onClose();
        }, 2000);
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: error.message || "Invalid QR code",
      });
      toast.error(error.message || "Check-in failed");
    }
  };

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Please enter a QR code");
      return;
    }
    handleCheckIn(manualCode.trim());
  };

  const handleReset = () => {
    setScanResult(null);
    setManualCode("");
    if (activeTab === "scan" && scanner) {
      scanner.clear().then(() => {
        const newScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        newScanner.render(onScanSuccess, onScanError);
        setScanner(newScanner);
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-purple-500" />
            Check-In Attendee
          </DialogTitle>
          <DialogDescription>
            Scan QR code or enter ticket ID manually
          </DialogDescription>
        </DialogHeader>

        {/* Result Display */}
        {scanResult ? (
          <div className="py-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  scanResult.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {scanResult.success
                    ? "Check-in Successful!"
                    : "Check-in Failed"}
                </h3>
                <p className="text-muted-foreground">{scanResult.message}</p>
              </div>
              {!scanResult.success && (
                <Button onClick={handleReset} className="mt-4">
                  Try Again
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scan QR</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            {/* QR Scanner Tab */}
            <TabsContent value="scan" className="space-y-4">
              <div id="qr-reader" className="w-full"></div>
              <p className="text-sm text-muted-foreground text-center">
                Position the QR code within the frame to scan
              </p>
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual">
              <form onSubmit={handleManualCheckIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qrCode">Ticket ID / QR Code</Label>
                  <Input
                    id="qrCode"
                    placeholder="EVT-1234567890-ABC"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the ticket ID shown on the attendee&apos;s ticket
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading || !manualCode.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Check In Attendee
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
