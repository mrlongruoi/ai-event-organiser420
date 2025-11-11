"use client";

import { useState, useEffect, useCallback } from "react";
import { QrCode, Loader2, CheckCircle } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

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
  const [isScanning, setIsScanning] = useState(false);

  const { mutate: checkInAttendee, isLoading } = useConvexMutation(
    api.registrations.checkInAttendee
  );

  const handleCheckIn = useCallback(
    async (qrCode) => {
      try {
        const result = await checkInAttendee({ qrCode });

        if (result.success) {
          toast.success("✅ Check-in successful!");
          onClose();
        } else {
          toast.error(result.message || "Check-in failed");
        }
      } catch (error) {
        toast.error(error.message || "Invalid QR code");
      }
    },
    [checkInAttendee, onClose]
  );

  // Initialize QR Scanner
  useEffect(() => {
    let scanner = null;

    const initScanner = async () => {
      if (isOpen && activeTab === "scan" && !isScanning) {
        try {
          const { Html5QrcodeScanner } = await import("html5-qrcode");
          setIsScanning(true);

          scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              showTorchButtonIfSupported: true,
            },
            false
          );

          scanner.render(
            (decodedText) => {
              scanner.clear().catch(console.error);
              setIsScanning(false);
              handleCheckIn(decodedText);
            },
            (error) => {
              // Ignore common scanning errors
              console.debug("Scan error:", error);
            }
          );
        } catch (error) {
          console.error("Camera error:", error);
          toast.error("Camera failed. Use manual entry.");
          setActiveTab("manual");
          setIsScanning(false);
        }
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
      setIsScanning(false);
    };
  }, [isOpen, activeTab, handleCheckIn, isScanning]);

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Please enter a QR code");
      return;
    }
    handleCheckIn(manualCode.trim());
    setManualCode("");
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">Scan QR</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scan" className="space-y-4">
            <div
              id="qr-reader"
              className="w-full"
              style={{ minHeight: "300px" }}
            ></div>
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
      </DialogContent>
    </Dialog>
  );
}
