import QRCode from "qrcode";

export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
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
