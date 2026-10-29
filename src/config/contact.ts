/**
 * Contact locations.
 *
 * `needsConfirmation` flags locations still awaiting business confirmation.
 * These customer-facing addresses do not configure Shiprocket pickup locations.
 */
export interface ContactLocation {
  label: string;
  addressLines: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  mapsUrl: string;
  active: boolean;
  needsConfirmation: boolean;
}

function mapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const contactLocations: ContactLocation[] = [
  {
    label: "Bengaluru — Magadi Road",
    addressLines: [
      "No 128, Pushpa Nilaya, 5th B Cross",
      "Shantilal Mutta Layout, Seegehalli Gate, Magadi Main Road",
      "Near SG Marriage Hall",
    ],
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "562130",
    country: "India",
    phone: "+919740835597",
    mapsUrl: mapsLink(
      "No 128, Pushpa Nilaya, 5th B Cross, Shantilal Mutta Layout, Seegehalli Gate, Magadi Main Road, Near SG Marriage Hall, Bangalore 562130",
    ),
    active: true,
    needsConfirmation: false,
  },
];

export const primaryContact = contactLocations[0];
