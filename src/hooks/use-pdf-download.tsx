"use client";

import { useCallback, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const jspdf: any;

export function usePdfDownload() {
  const [generating, setGenerating] = useState(false);

  const generatePdf = useCallback(async (elementId: string, filename: string = 'relatorio') => {
    setGenerating(true);
    
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      // Dynamically load scripts if not already loaded
      if (!window.html2canvas) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Falha ao carregar html2canvas'));
          document.head.appendChild(script);
        });
      }

      if (!window.jspdf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Falha ao carregar jsPDF'));
          document.head.appendChild(script);
        });
      }

      const html2canvasFn = window.html2canvas;
      const { jsPDF } = window.jspdf;

      const canvas = await html2canvasFn(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0A0B0D',
        windowWidth: 1400,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      let heightLeft = imgHeight;

      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      pdf.save(`${filename}-${date}.pdf`);
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generatePdf, generating };
}