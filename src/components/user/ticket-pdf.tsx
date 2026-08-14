import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { BookingDetail } from "./e-ticket-dialog"

const COLORS = {
  navy: "#0f172a",
  navyMid: "#1e293b",
  red: "#e31837",
  canvas: "#f8fafc",
  surface: "#ffffff",
  ink: "#334155",
  inkMuted: "#64748b",
  hairline: "#e2e8f0",
  success: "#16a34a"
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.canvas,
    fontFamily: "Helvetica",
    padding: 30,
  },
  ticketContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    overflow: "hidden",
    marginBottom: 20,
  },
  mainTicket: {
    flex: 3,
    borderRightWidth: 1,
    borderRightColor: COLORS.hairline,
    borderRightStyle: "dashed",
    position: "relative",
  },
  stubTicket: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  boardingPassText: {
    color: "#ffffff",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    opacity: 0.8,
  },
  stubHeader: {
    backgroundColor: COLORS.navy,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  flightRouteBox: {
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  airportCode: {
    fontSize: 42,
    fontWeight: "bold",
    color: COLORS.navy,
    marginBottom: 4,
  },
  cityText: {
    fontSize: 12,
    color: COLORS.inkMuted,
    textTransform: "uppercase",
  },
  flightIconWrapper: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  flightIconLine: {
    width: "100%",
    height: 2,
    backgroundColor: COLORS.red,
    position: "relative",
  },
  detailsGrid: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
  },
  detailBox: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: COLORS.inkMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.navy,
  },
  valueRed: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.red,
  },
  paxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
    backgroundColor: COLORS.canvas,
  },
  paxName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.navy,
  },
  cabinClass: {
    fontSize: 10,
    backgroundColor: COLORS.navy,
    color: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: "uppercase",
  },
  stubBody: {
    padding: 16,
    gap: 16,
  },
  stubAirport: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.navy,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 10,
    color: COLORS.inkMuted,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  }
})

const getCabinClassLabel = (cabin: string) => {
  switch (cabin?.toLowerCase()) {
    case "premium_economy": return "Premium Economy"
    case "first":           return "First Class"
    case "business":        return "Business Class"
    default:                return "Economy"
  }
}

export const TicketPDF = ({ booking }: { booking: BookingDetail }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      
      <View style={[
        styles.statusBadge, 
        { 
          backgroundColor: booking.status === "confirmed" ? "#dcfce7" : "#fee2e2",
          color: booking.status === "confirmed" ? "#166534" : "#991b1b"
        }
      ]}>
        <Text>{booking.status === "confirmed" ? "✓ Booking Confirmed" : "✕ Booking Cancelled"}</Text>
      </View>

      {(booking.passengers || []).map((p, i) => {
        const ticket = p.tickets?.[0]
        const flightNum = ticket?.flight_number || "TBA"
        const seatNum = ticket?.seat_designator || "TBA"

        return (
          <View style={styles.ticketContainer} wrap={false} key={p.id || i}>
            {/* Main Ticket Section */}
            <View style={styles.mainTicket}>
              
              <View style={styles.header}>
                <Text style={styles.brandText}>SkyLedger</Text>
                <Text style={styles.boardingPassText}>Electronic Ticket</Text>
              </View>

              <View style={styles.flightRouteBox}>
                <View>
                  <Text style={styles.airportCode}>{booking.origin_code}</Text>
                  <Text style={styles.cityText}>Origin</Text>
                </View>
                <View style={styles.flightIconWrapper}>
                  <Text style={{ fontSize: 10, color: COLORS.red, marginBottom: 4, fontWeight: "bold" }}>
                    {booking.departure_date}
                  </Text>
                  <View style={styles.flightIconLine} />
                  <Text style={{ fontSize: 10, color: COLORS.inkMuted, marginTop: 4 }}>
                    {flightNum}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.airportCode}>{booking.destination_code}</Text>
                  <Text style={styles.cityText}>Destination</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailBox}>
                  <Text style={styles.label}>Passenger</Text>
                  <Text style={styles.value}>{p.first_name} {p.last_name}</Text>
                </View>
                <View style={styles.detailBox}>
                  <Text style={styles.label}>Booking Ref</Text>
                  <Text style={styles.valueRed}>{booking.booking_reference}</Text>
                </View>
                <View style={styles.detailBox}>
                  <Text style={styles.label}>Seat</Text>
                  <Text style={styles.value}>{seatNum}</Text>
                </View>
              </View>

              <View style={styles.paxRow}>
                <Text style={styles.label}>Ticket No: {ticket?.ticket_number || "PENDING"}</Text>
                <Text style={styles.cabinClass}>{getCabinClassLabel(booking.cabin_class)}</Text>
              </View>

            </View>

            {/* Stub Section */}
            <View style={styles.stubTicket}>
              <View style={styles.stubHeader}>
                <Text style={styles.brandText}>SL</Text>
              </View>
              <View style={styles.stubBody}>
                <View>
                  <Text style={styles.label}>Passenger</Text>
                  <Text style={styles.value}>{p.first_name} {p.last_name}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Route</Text>
                  <Text style={styles.stubAirport}>{booking.origin_code} - {booking.destination_code}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Flight</Text>
                  <Text style={styles.valueRed}>{flightNum}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Seat</Text>
                  <Text style={styles.value}>{seatNum}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>{booking.departure_date}</Text>
                </View>
              </View>
            </View>

          </View>
        )
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Issued Date: {new Date(booking.created_at).toLocaleDateString()}</Text>
        <Text style={styles.footerText}>Total Amount Paid: ৳{Number(booking.total_amount).toFixed(2)}</Text>
      </View>

    </Page>
  </Document>
)
