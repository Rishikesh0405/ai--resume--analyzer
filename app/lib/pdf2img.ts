export async function pdfToImage(file: File): Promise<string> {
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) {
    throw new Error("PDF.js library is not loaded. Please refresh the page and try again.");
  }

  // Configure worker src dynamically via Same-Origin Blob URL to bypass cross-origin browser script loading blocks
  const workerBlob = new Blob(
    [`importScripts("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js");`],
    { type: "application/javascript" }
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  // Get first page of the resume PDF
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 }); // Scale 2 for high-quality text resolution
  
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D rendering context for PDF conversion.");
  }

  await page.render({ canvasContext: ctx, viewport }).promise;
  
  // Return the base64 string without prefix
  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.split(",")[1];
}
