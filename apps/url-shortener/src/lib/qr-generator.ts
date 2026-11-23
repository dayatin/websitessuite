import QRCode from "qrcode";

export interface QRCodeOptions {
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  darkColor?: string; // hex color e.g. "#000000" or "#00f0ff"
  lightColor?: string; // hex color e.g. "#ffffff" or "transparent"
  margin?: number;
  width?: number;
}

/**
 * Generates clean, scalable SVG markup for a QR code.
 */
export async function generateQRCodeSVG(text: string, options?: QRCodeOptions): Promise<string> {
  const opt: QRCode.QRCodeToStringOptions = {
    type: "svg",
    errorCorrectionLevel: options?.errorCorrectionLevel || "M",
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor || "#000000",
      light: options?.lightColor || "#ffffff",
    },
    width: options?.width || 256,
  };

  return QRCode.toString(text, opt);
}

/**
 * Generates Base64 Data URL for a PNG QR code.
 */
export async function generateQRCodeDataURL(
  text: string,
  options?: QRCodeOptions,
): Promise<string> {
  const opt: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: options?.errorCorrectionLevel || "M",
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor || "#000000",
      light: options?.lightColor || "#ffffff",
    },
    width: options?.width || 256,
  };

  return QRCode.toDataURL(text, opt);
}
