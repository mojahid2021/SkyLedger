export function generateSeatMapForFlight(
  flightId: number,
  aircraftModel: string,
  aircraftIata: string,
  aircraftIcao: string,
  segmentId: number,
  sliceId: number,
  bookedSeats: Set<string>
) {
  const modelUpper = (aircraftModel || "").toUpperCase();
  const icaoUpper = (aircraftIcao || "").toUpperCase();
  
  let type: "widebody" | "narrowbody" | "regional" | "private" = "narrowbody";
  
  if (
    /A33|A34|A35|A38|B77|B78|B74/i.test(icaoUpper) || 
    modelUpper.includes("330") || modelUpper.includes("340") || modelUpper.includes("350") || modelUpper.includes("380") || modelUpper.includes("777") || modelUpper.includes("787") || modelUpper.includes("747")
  ) {
    type = "widebody";
  } else if (
    /CRJ|ERJ|E145|E120|E170|E175|E190|E195|CRA|CR2|B712/i.test(icaoUpper) ||
    modelUpper.includes("CRJ") || modelUpper.includes("EMBRAER") || modelUpper.includes("BRASILIA") || modelUpper.includes("BOMBARDIER") || modelUpper.includes("717")
  ) {
    type = "regional";
  } else if (
    /BE20|C208|C680|B190|B350|GLEX|PA44|PC12|LJ60|E55P/i.test(icaoUpper) ||
    modelUpper.includes("KING AIR") || modelUpper.includes("CARAVAN") || modelUpper.includes("SOVEREIGN") || modelUpper.includes("GLOBAL EXPRESS") || modelUpper.includes("PILATUS") || modelUpper.includes("LEARJET") || modelUpper.includes("PHENOM")
  ) {
    type = "private";
  }

  // Seat occupancy checker based on local bookings database
  const isOccupied = (designator: string) => {
    return bookedSeats.has(designator.trim().toUpperCase());
  };

  const buildSeat = (designator: string, name: string, disclosures: string[], amount: string) => {
    const occupied = isOccupied(designator);
    return {
      type: "seat" as const,
      designator,
      name,
      disclosures,
      available_services: occupied
        ? []
        : [
            {
              id: flightId * 1000 + parseInt(designator) * 10 + (designator.charCodeAt(designator.length - 1) - 64),
              passenger_id: 1,
              total_amount: amount,
              total_currency: "BDT",
            },
          ],
    };
  };

  const cabins: any[] = [];

  if (type === "widebody") {
    // WIDEBODY: 2 aisles, 3 sections (Left, Middle, Right)
    
    // Business Class Cabin
    const businessRows: any[] = [];
    for (let r = 1; r <= 6; r++) {
      businessRows.push({
        sections: [
          {
            elements: [buildSeat(`${r}A`, "Business Window", [], "150.00")]
          },
          {
            elements: [
              buildSeat(`${r}D`, "Business Aisle", [], "125.00"),
              buildSeat(`${r}G`, "Business Aisle", [], "125.00")
            ]
          },
          {
            elements: [buildSeat(`${r}K`, "Business Window", [], "150.00")]
          }
        ]
      });
    }
    cabins.push({
      aisles: 2,
      cabin_class: "business",
      deck: 0,
      wings: null,
      rows: businessRows,
    });

    // Premium Economy Cabin
    const premiumRows: any[] = [];
    for (let r = 7; r <= 12; r++) {
      premiumRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, "Premium Window", [], "50.00"),
              buildSeat(`${r}C`, "Premium Aisle", [], "45.00")
            ]
          },
          {
            elements: [
              buildSeat(`${r}D`, "Premium Middle", [], "40.00"),
              { type: "empty" },
              buildSeat(`${r}G`, "Premium Middle", [], "40.00")
            ]
          },
          {
            elements: [
              buildSeat(`${r}H`, "Premium Aisle", [], "45.00"),
              buildSeat(`${r}K`, "Premium Window", [], "50.00")
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 2,
      cabin_class: "premium_economy",
      deck: 0,
      wings: null,
      rows: premiumRows,
    });

    // Economy Cabin (3-3-3)
    const economyRows: any[] = [];
    const wingStart = 15;
    const wingEnd = 30;
    for (let r = 14; r <= 45; r++) {
      const isExit = r === 14;
      const price = isExit ? "60.00" : "20.00";
      const name = isExit ? "Exit Row Seat" : "Economy Standard";
      const disclosures = isExit
        ? ["Do not seat children in exit row seats", "Do not seat passengers with special needs in exit row seats"]
        : [];

      economyRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, name, disclosures, price),
              buildSeat(`${r}B`, name, disclosures, price),
              buildSeat(`${r}C`, name, disclosures, price)
            ]
          },
          {
            elements: [
              buildSeat(`${r}D`, name, disclosures, price),
              buildSeat(`${r}E`, name, disclosures, price),
              buildSeat(`${r}F`, name, disclosures, price)
            ]
          },
          {
            elements: [
              buildSeat(`${r}G`, name, disclosures, price),
              buildSeat(`${r}H`, name, disclosures, price),
              buildSeat(`${r}K`, name, disclosures, price)
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 2,
      cabin_class: "economy",
      deck: 0,
      wings: { first_row_index: wingStart, last_row_index: wingEnd },
      rows: economyRows,
    });

  } else if (type === "regional") {
    // REGIONAL: 1 aisle, 2 sections (2-2 configuration)
    // Business Class (2-2) Rows 1-3
    const businessRows: any[] = [];
    for (let r = 1; r <= 3; r++) {
      businessRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, "Business Window", [], "40.00"),
              buildSeat(`${r}B`, "Business Aisle", [], "35.00")
            ]
          },
          {
            elements: [
              buildSeat(`${r}C`, "Business Aisle", [], "35.00"),
              buildSeat(`${r}D`, "Business Window", [], "40.00")
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "business",
      deck: 0,
      wings: null,
      rows: businessRows,
    });

    // Economy Class (2-2) Rows 4-20
    const economyRows: any[] = [];
    const wingStart = 8;
    const wingEnd = 14;
    for (let r = 4; r <= 20; r++) {
      const isExit = r === 10;
      const price = isExit ? "25.00" : "10.00";
      const name = isExit ? "Exit Row Seat" : "Economy Standard";
      const disclosures = isExit ? ["Do not seat children in exit row seats"] : [];

      economyRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, name, disclosures, price),
              buildSeat(`${r}B`, name, disclosures, price)
            ]
          },
          {
            elements: [
              buildSeat(`${r}C`, name, disclosures, price),
              buildSeat(`${r}D`, name, disclosures, price)
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "economy",
      deck: 0,
      wings: { first_row_index: wingStart, last_row_index: wingEnd },
      rows: economyRows,
    });

  } else if (type === "private") {
    // PRIVATE: 1 aisle, 2 sections (1-1 configuration)
    const rows: any[] = [];
    for (let r = 1; r <= 6; r++) {
      rows.push({
        sections: [
          {
            elements: [buildSeat(`${r}A`, "VIP Executive", [], "250.00")]
          },
          {
            elements: [buildSeat(`${r}C`, "VIP Executive", [], "250.00")]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "business",
      deck: 0,
      wings: null,
      rows,
    });

  } else {
    // NARROWBODY (Standard): 1 aisle, 2 sections (3-3 configuration)
    const businessRows: any[] = [];
    for (let r = 1; r <= 4; r++) {
      businessRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, "First Window", [], "75.00"),
              buildSeat(`${r}C`, "First Aisle", [], "70.00")
            ]
          },
          {
            elements: [
              buildSeat(`${r}D`, "First Aisle", [], "70.00"),
              buildSeat(`${r}F`, "First Window", [], "75.00")
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "business",
      deck: 0,
      wings: null,
      rows: businessRows,
    });

    // Economy Cabin (3-3) Rows 5-30
    const economyRows: any[] = [];
    const wingStart = 11;
    const wingEnd = 20;
    for (let r = 5; r <= 30; r++) {
      const isExit = r === 12;
      const isPreferred = r >= 5 && r <= 10;
      const price = isExit ? "35.00" : isPreferred ? "25.00" : "15.00";
      const name = isExit ? "Exit Row Seat" : isPreferred ? "Preferred Seat" : "Economy Standard";
      const disclosures = isExit ? ["Do not seat children in exit row seats", "Do not seat passengers with special needs in exit row seats"] : [];

      economyRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, name, disclosures, price),
              buildSeat(`${r}B`, name, disclosures, price),
              buildSeat(`${r}C`, name, disclosures, price)
            ]
          },
          {
            elements: [
              buildSeat(`${r}D`, name, disclosures, price),
              buildSeat(`${r}E`, name, disclosures, price),
              buildSeat(`${r}F`, name, disclosures, price)
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "economy",
      deck: 0,
      wings: { first_row_index: wingStart, last_row_index: wingEnd },
      rows: economyRows,
    });
  }

  return {
    id: flightId,
    segment_id: segmentId,
    slice_id: sliceId,
    cabins,
  };
}
export function countTotalSeats(seatMap: any): number {
  let count = 0;
  for (const cabin of seatMap.cabins) {
    for (const row of cabin.rows) {
      for (const section of row.sections) {
        for (const element of section.elements) {
          if (element.type === 'seat') {
            count++;
          }
        }
      }
    }
  }
  return count;
}
