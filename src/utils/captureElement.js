import html2canvas from "html2canvas";

export default async function captureElement(element) {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: Math.min(2, window.devicePixelRatio || 1),
    useCORS: true
  });

  return canvas.toDataURL("image/png");
}
