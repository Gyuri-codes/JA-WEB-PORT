import jsPDF from 'jspdf';
import { PERSONAL_INFO, EXPERIENCES, CERTIFICATIONS, SKILLS_DATA } from '../data/portfolioData';

async function getBase64Image(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image/')) {
    return url;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 400;
        canvas.height = img.naturalHeight || img.height || 500;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch {
        // Fallback
      }
      resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates an official, print-ready, professional A4 PDF Resume (210 x 297 mm)
 * with a crisp white background, selectable dark text, and exact layout fidelity.
 */
export async function generateResumePdf(profilePhotoUrl: string): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 12;
  const contentWidth = pageWidth - marginX * 2; // 186mm
  const rightX = marginX + contentWidth; // 198mm

  // 1. Pure White Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Colors
  const COLOR_PRIMARY = [17, 24, 39]; // #111827 Dark Charcoal / Black
  const COLOR_SECONDARY = [75, 85, 99]; // #4B5563 Slate Gray
  const COLOR_MUTED = [107, 114, 128]; // #6B7280 Muted Gray
  const COLOR_GOLD = [161, 122, 40]; // #A17A28 Elegant Rich Gold
  const COLOR_BORDER = [229, 231, 235]; // #E5E7EB Light Gray Border
  const COLOR_CARD_BG = [249, 250, 251]; // #F9FAFB Off-White Card Fill
  const COLOR_TAG_BG = [243, 244, 246]; // #F3F4F6 Badge Fill

  // ==========================================
  // HEADER SECTION (y: 11 to 41)
  // ==========================================
  const photoW = 23;
  const photoH = 28;
  const photoX = marginX;
  const photoY = 11;

  // Draw Photo Frame
  doc.setFillColor(...(COLOR_CARD_BG as [number, number, number]));
  doc.setDrawColor(...(COLOR_GOLD as [number, number, number]));
  doc.setLineWidth(0.35);
  doc.roundedRect(photoX, photoY, photoW, photoH, 0.5, 0.5, 'FD');

  // Insert Photo or Monogram
  try {
    const base64Photo = await getBase64Image(profilePhotoUrl);
    if (base64Photo) {
      doc.addImage(base64Photo, 'PNG', photoX + 0.3, photoY + 0.3, photoW - 0.6, photoH - 0.6, undefined, 'FAST');
    } else {
      doc.setFont('times', 'italic');
      doc.setFontSize(16);
      doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
      doc.text('JA', photoX + photoW / 2, photoY + photoH / 2 + 2, { align: 'center' });
    }
  } catch {
    doc.setFont('times', 'italic');
    doc.setFontSize(16);
    doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
    doc.text('JA', photoX + photoW / 2, photoY + photoH / 2 + 2, { align: 'center' });
  }

  // Name & Title next to photo
  const textLeftX = photoX + photoW + 4; // 39mm

  doc.setFont('times', 'italic');
  doc.setFontSize(22);
  doc.setTextColor(...(COLOR_PRIMARY as [number, number, number]));
  doc.text(PERSONAL_INFO.name, textLeftX, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('Hospitality Management · 4th Year Student · Digital Experience Creator', textLeftX, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...(COLOR_MUTED as [number, number, number]));
  doc.text('Purok Tugas, Cadawinon, Dumaguete City, Negros Oriental', textLeftX, 31);

  // Quick Contacts on Right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...(COLOR_PRIMARY as [number, number, number]));
  doc.text(PERSONAL_INFO.email, rightX, 18, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(...(COLOR_PRIMARY as [number, number, number]));
  doc.text(PERSONAL_INFO.phone, rightX, 24, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...(COLOR_MUTED as [number, number, number]));
  doc.text('Birthplace: Parañaque City', rightX, 30, { align: 'right' });

  // Divider Line
  doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
  doc.setLineWidth(0.3);
  doc.line(marginX, 42, rightX, 42);

  // ==========================================
  // CAREER OBJECTIVE (y: 45 to 60)
  // ==========================================
  let curY = 46.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('CAREER OBJECTIVE', marginX, curY);

  curY += 2;
  doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
  doc.setLineWidth(0.2);
  doc.line(marginX, curY, rightX, curY);

  curY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...(COLOR_SECONDARY as [number, number, number]));
  const objectiveLines = doc.splitTextToSize(PERSONAL_INFO.careerObjective, contentWidth);
  doc.text(objectiveLines, marginX, curY);

  curY += objectiveLines.length * 3.8 + 3.5;

  // ==========================================
  // WORK EXPERIENCE (y: ~61 to 132)
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('WORK EXPERIENCE (SUPERVISED INDUSTRY LEARNING - SIL)', marginX, curY);

  curY += 2;
  doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
  doc.setLineWidth(0.2);
  doc.line(marginX, curY, rightX, curY);

  curY += 3.5;

  EXPERIENCES.forEach((exp) => {
    const blockStartY = curY;

    // Company Title
    doc.setFont('times', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(...(COLOR_PRIMARY as [number, number, number]));
    doc.text(exp.company, marginX + 4, curY + 2.5);

    // Period Badge on Right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
    const periodWidth = doc.getTextWidth(exp.period) + 4;
    doc.setFillColor(...(COLOR_CARD_BG as [number, number, number]));
    doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
    doc.setLineWidth(0.25);
    doc.roundedRect(rightX - periodWidth, curY - 0.5, periodWidth, 4.5, 0.4, 0.4, 'FD');
    doc.text(exp.period, rightX - periodWidth / 2, curY + 2.6, { align: 'center' });

    // Role & Location
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...(COLOR_MUTED as [number, number, number]));
    doc.text(`${exp.role} · ${exp.location}`, marginX + 4, curY + 6.5);

    // Bullets
    let bulletY = curY + 10.2;
    exp.responsibilities.forEach((resp) => {
      doc.setFillColor(...(COLOR_GOLD as [number, number, number]));
      doc.circle(marginX + 5, bulletY - 0.9, 0.55, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...(COLOR_SECONDARY as [number, number, number]));
      const lines = doc.splitTextToSize(resp, contentWidth - 10);
      doc.text(lines, marginX + 7.5, bulletY);
      bulletY += lines.length * 3.4;
    });

    const blockEndY = bulletY + 1;

    // Vertical Gold Guide Bar
    doc.setDrawColor(...(COLOR_GOLD as [number, number, number]));
    doc.setLineWidth(0.65);
    doc.line(marginX + 1, blockStartY + 0.5, marginX + 1, blockEndY - 2);

    curY = blockEndY + 2;
  });

  // ==========================================
  // EDUCATION (y: ~135 to 154)
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('EDUCATION', marginX, curY);

  curY += 2;
  doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
  doc.setLineWidth(0.2);
  doc.line(marginX, curY, rightX, curY);

  curY += 4.5;
  const eduStartY = curY;

  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(...(COLOR_PRIMARY as [number, number, number]));
  doc.text(PERSONAL_INFO.education.institution, marginX + 4, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text(`${PERSONAL_INFO.education.degree} (${PERSONAL_INFO.education.status})`, marginX + 4, curY + 4.2);

  doc.setFontSize(7.5);
  doc.setTextColor(...(COLOR_MUTED as [number, number, number]));
  doc.text(PERSONAL_INFO.education.location, marginX + 4, curY + 8);

  // Left vertical line
  doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
  doc.setLineWidth(0.65);
  doc.line(marginX + 1, eduStartY - 2, marginX + 1, curY + 9);

  curY += 12.5;

  // ==========================================
  // NATIONAL CERTIFICATIONS (y: ~156 to 216)
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('NATIONAL CERTIFICATIONS', marginX, curY);

  curY += 2;
  doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
  doc.setLineWidth(0.2);
  doc.line(marginX, curY, rightX, curY);

  curY += 3.5;

  const cardGap = 3.5;
  const colWidth = (contentWidth - cardGap) / 2; // ~91.25mm
  const cardHeight = 15;

  CERTIFICATIONS.forEach((cert, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cardX = marginX + col * (colWidth + cardGap);
    const cardY = curY + row * (cardHeight + 2.5);

    // Card background & subtle border
    doc.setFillColor(...(COLOR_CARD_BG as [number, number, number]));
    doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
    doc.setLineWidth(0.25);
    doc.roundedRect(cardX, cardY, colWidth, cardHeight, 0.4, 0.4, 'FD');

    // Title
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...(COLOR_PRIMARY as [number, number, number]));
    doc.text(cert.title, cardX + 3.5, cardY + 4.5);

    // Issuer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
    doc.text(cert.issuer.toUpperCase(), cardX + 3.5, cardY + 8.5);

    // Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...(COLOR_MUTED as [number, number, number]));
    doc.text(cert.date, cardX + 3.5, cardY + 12.2);
  });

  curY += Math.ceil(CERTIFICATIONS.length / 2) * (cardHeight + 2.5) + 3;

  // ==========================================
  // SKILLS & DIGITAL EXPLORATION (y: ~220 to 264)
  // ==========================================
  const skillsColWidth = colWidth;
  const col1X = marginX;
  const col2X = marginX + colWidth + cardGap;
  const skillsStartY = curY;

  // Column 1 Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('CORE HOSPITALITY SKILLS', col1X, skillsStartY);

  // Column 2 Title
  doc.text('DIGITAL & CREATIVE EXPLORATION', col2X, skillsStartY);

  curY += 2;
  doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
  doc.setLineWidth(0.2);
  doc.line(col1X, curY, col1X + skillsColWidth, curY);
  doc.line(col2X, curY, rightX, curY);

  curY += 3.5;

  // Helper function to render skill pills
  const renderSkillPills = (skills: { name: string }[], startX: number, startY: number, maxW: number, isGoldAccent = false) => {
    let px = startX;
    let py = startY;
    const tagH = 5.2;

    skills.forEach((s) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      const tw = doc.getTextWidth(s.name);
      const tagW = tw + 5;

      if (px + tagW > startX + maxW) {
        px = startX;
        py += tagH + 2;
      }

      doc.setFillColor(...(COLOR_TAG_BG as [number, number, number]));
      doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
      doc.setLineWidth(0.2);
      doc.roundedRect(px, py, tagW, tagH, 0.4, 0.4, 'FD');

      if (isGoldAccent) {
        doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
      } else {
        doc.setTextColor(...(COLOR_PRIMARY as [number, number, number]));
      }
      doc.text(s.name, px + tagW / 2, py + 3.6, { align: 'center' });

      px += tagW + 2;
    });

    return py + tagH;
  };

  const endCol1Y = renderSkillPills(SKILLS_DATA.humanCentered, col1X, curY, skillsColWidth, false);
  const endCol2Y = renderSkillPills(SKILLS_DATA.digitalCuriosity, col2X, curY, skillsColWidth, true);

  curY = Math.max(endCol1Y, endCol2Y) + 5;

  // ==========================================
  // FOOTER SUMMARY (y: ~270)
  // ==========================================
  doc.setDrawColor(...(COLOR_BORDER as [number, number, number]));
  doc.setLineWidth(0.3);
  doc.line(marginX, curY, rightX, curY);

  curY += 4.5;

  // 1. Languages
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('LANGUAGES:', marginX, curY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...(COLOR_SECONDARY as [number, number, number]));
  doc.text(PERSONAL_INFO.languages.join(', '), marginX + 18, curY);

  // 2. Status
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('STATUS:', marginX + 75, curY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...(COLOR_SECONDARY as [number, number, number]));
  doc.text('Single · Filipino', marginX + 88, curY);

  // 3. Featured Game
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(COLOR_GOLD as [number, number, number]));
  doc.text('FEATURED GAME:', rightX - 42, curY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...(COLOR_SECONDARY as [number, number, number]));
  doc.text('Mind Meld', rightX, curY, { align: 'right' });

  // Save PDF Directly to Downloads
  doc.save('Jeric_Abestano_Official_Resume.pdf');
}
