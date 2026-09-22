// Converts a Pakistani local number (03xx...) into a wa.me link.
export function waLink(phone: string, text: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "92" + d.slice(1);
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
