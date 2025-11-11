/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Ticket,
  Calendar,
  MapPin,
  QrCode,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import Link from "next/link";

export default function MyTicketsPage() {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelTicketId, setCancelTicketId] = useState(null);

  const { data: registrations, isLoading } = useConvexQuery(
    api.registrations.getMyRegistrations
  );
  const { mutate: cancelRegistration, isLoading: isCancelling } =
    useConvexMutation(api.registrations.cancelRegistration);

  const handleCancelRegistration = async () => {
    if (!cancelTicketId) return;

    try {
      await cancelRegistration({ registrationId: cancelTicketId });
      toast.success("Registration cancelled");
      setCancelTicketId(null);
    } catch (error) {
      toast.error(error.message || "Failed to cancel registration");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Separate upcoming and past tickets
  const now = Date.now();

  const upcomingTickets = registrations?.filter(
    (reg) =>
      reg.event && reg.event.startDate >= now && reg.status === "confirmed"
  );
  const pastTickets = registrations?.filter(
    (reg) =>
      reg.event && (reg.event.startDate < now || reg.status === "cancelled")
  );

  return (
    <div className="min-h-screen py-20 px-4 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            View and manage your event registrations
          </p>
        </div>

        {/* Upcoming Tickets */}
        {upcomingTickets && upcomingTickets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingTickets.map((registration) => (
                <Card key={registration._id} className="overflow-hidden py-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="outline" className="gap-1">
                        {getCategoryIcon(registration.event.category)}{" "}
                        {getCategoryLabel(registration.event.category)}
                      </Badge>
                      {registration.checkedIn && (
                        <Badge className="gap-1 bg-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Checked In
                        </Badge>
                      )}
                    </div>

                    <h3
                      className="text-xl font-bold mb-3 cursor-pointer hover:text-purple-400 transition-colors"
                      onClick={() =>
                        router.push(`/events/${registration.event.slug}`)
                      }
                    >
                      {registration.event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(registration.event.startDate, "PPP, h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {registration.event.locationType === "online"
                            ? "Online Event"
                            : `${registration.event.city}, ${registration.event.state || registration.event.country}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        <span className="font-mono text-xs">
                          {registration.qrCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => setSelectedTicket(registration)}
                      >
                        <QrCode className="w-4 h-4" />
                        Show QR Code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelTicketId(registration._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Tickets */}
        {pastTickets && pastTickets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Past Events</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pastTickets.map((registration) => (
                <Card
                  key={registration._id}
                  className="overflow-hidden opacity-60"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="outline" className="gap-1">
                        {getCategoryIcon(registration.event.category)}{" "}
                        {getCategoryLabel(registration.event.category)}
                      </Badge>
                      {registration.status === "cancelled" ? (
                        <Badge variant="destructive">Cancelled</Badge>
                      ) : registration.checkedIn ? (
                        <Badge className="gap-1 bg-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Attended
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Past Event</Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-3">
                      {registration.event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(registration.event.startDate, "PPP, h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {registration.event.locationType === "online"
                            ? "Online Event"
                            : `${registration.event.city}, ${registration.event.state || registration.event.country}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!upcomingTickets || upcomingTickets.length === 0) &&
          (!pastTickets || pastTickets.length === 0) && (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl mb-4">🎟️</div>
                <h2 className="text-2xl font-bold">No tickets yet</h2>
                <p className="text-muted-foreground">
                  Register for events to see your tickets here
                </p>
                <Button asChild className="gap-2">
                  <Link href="/explore">
                    <Ticket className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}
      </div>

      {/* QR Code Modal */}
      {selectedTicket && (
        <Dialog
          open={!!selectedTicket}
          onOpenChange={() => setSelectedTicket(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Your Ticket</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center">
                <p className="font-semibold mb-1">
                  {selectedTicket.attendeeName}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedTicket.event.title}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-6 bg-white rounded-lg">
                <QRCode value={selectedTicket.qrCode} size={200} level="H" />
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Ticket ID</p>
                <p className="font-mono text-sm">{selectedTicket.qrCode}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(selectedTicket.event.startDate, "PPP, h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {selectedTicket.event.locationType === "online"
                      ? "Online Event"
                      : `${selectedTicket.event.city}, ${selectedTicket.event.state || selectedTicket.event.country}`}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Show this QR code at the event entrance for check-in
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={!!cancelTicketId}
        onOpenChange={() => setCancelTicketId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this registration? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep Registration
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRegistration}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Registration"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
