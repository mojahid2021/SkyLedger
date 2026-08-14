import React from "react"
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"
import { BookingDetail } from "./e-ticket-dialog"

// Note: React-PDF doesn't support web fonts out of the box without loading them.
// We will use standard fonts for robustness.

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    padding: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    paddingBottom: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
  },
  pnrBox: {
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pnrLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  pnrValue: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Courier",
    color: "#e31837",
  },
  flightInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  airportBlock: {
    flex: 1,
  },
  airportBlockRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  airportCode: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
  },
  airportLabel: {
    fontSize: 10,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  flightMiddle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
    marginBottom: 12,
  },
  passengerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
    marginBottom: 12,
  },
  paxName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  paxType: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },
  ticketBlock: {
    alignItems: "flex-end",
  },
  ticketLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
  },
  ticketValue: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Courier",
    color: "#0f172a",
    marginTop: 2,
  },
  footer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 9,
    color: "#94a3b8",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e31837",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  statusBadgeCancelled: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  }
})

const getCabinClassLabel = (cabin: string) => {
  switch (cabin?.toLowerCase()) {
    case "premium_economy": return "Premium Economy"
    case "first":           return "First Class"
    case "business":        return "Business Class"
    default:                return "Economy Class"
  }
}

export const TicketPDF = ({ booking }: { booking: BookingDetail }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>SkyLedger</Text>
          <Text style={styles.subtitle}>Electronic Boarding Pass</Text>
        </View>
        <View style={styles.pnrBox}>
          <Text style={styles.pnrLabel}>Booking Reference</Text>
          <Text style={styles.pnrValue}>{booking.booking_reference}</Text>
        </View>
      </View>

      <Text style={[styles.statusBadge, booking.status === "cancelled" ? styles.statusBadgeCancelled : {}]}>
        {booking.status === "confirmed" ? "✓ Confirmed" : "✕ Cancelled"}
      </Text>

      {/* Flight Route */}
      <View style={styles.flightInfoRow}>
        <View style={styles.airportBlock}>
          <Text style={styles.airportLabel}>Origin</Text>
          <Text style={styles.airportCode}>{booking.origin_code}</Text>
        </View>
        <View style={styles.flightMiddle}>
          <Text style={styles.dateText}>{booking.departure_date}</Text>
        </View>
        <View style={styles.airportBlockRight}>
          <Text style={styles.airportLabel}>Destination</Text>
          <Text style={styles.airportCode}>{booking.destination_code}</Text>
        </View>
      </View>

      {/* Passengers */}
      <Text style={styles.sectionTitle}>Passenger Manifest</Text>
      <View>
        {(booking.passengers || []).map((p, i) => (
          <View style={styles.passengerRow} key={p.id || i}>
            <View>
              <Text style={styles.paxName}>{p.first_name} {p.last_name}</Text>
              <Text style={styles.paxType}>
                {p.passenger_type.toUpperCase()} • {getCabinClassLabel(booking.cabin_class)}
              </Text>
            </View>
            {p.tickets && p.tickets.length > 0 && (
              <View style={styles.ticketBlock}>
                <Text style={styles.ticketLabel}>Flight / Seat</Text>
                <Text style={styles.ticketValue}>
                  {p.tickets[0].flight_number} / {p.tickets[0].seat_designator || "TBA"}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerText}>Issued Date: {new Date(booking.created_at).toLocaleDateString()}</Text>
          <Text style={styles.footerText}>This is an electronically generated ticket.</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.pnrLabel}>Total Amount Settled</Text>
          <Text style={styles.totalPrice}>৳{Number(booking.total_amount).toFixed(2)}</Text>
        </View>
      </View>

    </Page>
  </Document>
)
