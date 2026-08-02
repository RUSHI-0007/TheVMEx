import QRCode from "qrcode";

export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 280,
    margin: 2,
    color: {
      dark: "#0B0B0D",
      light: "#EDE6DA",
    },
  });
}

export function buildTicketQrPayload(
  ticketId: string,
  orderId: string,
  attendeeName: string
): string {
  return JSON.stringify({
    ticketId,
    orderId,
    attendee: attendeeName,
    event: "Masquerade Night 2026",
  });
}
