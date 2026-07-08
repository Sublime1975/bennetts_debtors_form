// Normalizes a phone/cell number to a single consistent E.164-style format
// (e.g. +27821234567) so values stored in the database are uniform.
export function formatPhoneNumber(raw: string, isLocal: boolean): string {
  if (!raw) return "";
  let digits = raw.trim().replace(/[^\d+]/g, "");
  const hadPlus = digits.startsWith("+");
  digits = digits.replace(/\+/g, "");
  if (!digits) return "";
  if (isLocal) {
    if (digits.startsWith("0")) digits = "27" + digits.slice(1);
    else if (!digits.startsWith("27")) digits = "27" + digits;
    return "+" + digits;
  }
  return (hadPlus ? "+" : "") + digits;
}
