interface Window {
  html2canvas: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  jspdf: {
    jsPDF: new (options: { orientation?: string; unit?: string; format?: string }) => {
      addImage: (imgData: string, format: string, x: number, y: number, width: number, height: number) => void;
      addPage: () => void;
      save: (filename: string) => void;
    };
  };
}