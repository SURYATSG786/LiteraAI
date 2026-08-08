import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Award, Download, Share2, CheckCircle2, ShieldCheck, Eye, ExternalLink, Sparkles, Medal, BookOpen } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { PageTitle } from '../components/ui';
import { GuideBird } from '../components/RedBird';
import { speakText } from '../audio';

import { CERT_LABELS } from '../data/certificateLabels';

export default function Certificate() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const certRef = useRef(null);
  const lang = i18n.language && CERT_LABELS[i18n.language] ? i18n.language : 'en';
  const labels = CERT_LABELS[lang];

  // Parse course certificates
  const courseCerts = Array.isArray(user?.certificates) && user.certificates.length > 0
    ? user.certificates.filter((c) => c.issued)
    : user?.certificate?.issued
    ? [user.certificate]
    : [];

  // Parse league certificates
  const leagueCerts = Array.isArray(user?.league_certificates)
    ? user.league_certificates.map((lc) => ({
        ...lc,
        course_title: lc.league_title || `${lc.league?.toUpperCase() || ''} League Tier Certificate`,
        course_id: `league-${lc.league}`,
        is_league: true,
        issued: true,
      }))
    : [];

  // Combine all completed certificates
  const allCerts = [...courseCerts, ...leagueCerts];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filterType, setFilterType] = useState('all'); // 'all', 'course', 'league'
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const activeCert = allCerts[selectedIdx] || allCerts[0] || null;

  const filteredCerts = allCerts.filter((c) => {
    if (filterType === 'course') return !c.is_league;
    if (filterType === 'league') return c.is_league;
    return true;
  });

  useEffect(() => {
    if (activeCert) {
      speakText(labels.victorySpeech, lang);
    }
  }, [activeCert, lang]);

  async function download() {
    setBusy(true);
    setError('');
    try {
      if (activeCert?.is_league) {
        const blob = await api.downloadLeagueCertificate(activeCert.league);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `literaai-${activeCert.league}-certificate.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const element = certRef.current;
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${activeCert?.course_title || 'LiteraAI'}</title>
            <style>
              @page { size: A4 landscape; margin: 0; }
              html, body { width: 100vw; height: 100vh; margin: 0; padding: 0; overflow: hidden; background: #ffffff; display: flex; justify-content: center; align-items: center; }
              .cert-print-container { width: 100vw; height: 100vh; padding: 12mm; display: flex; align-items: center; justify-content: center; }
              .cert-print-container > * { width: 100% !important; height: 100% !important; max-width: none !important; aspect-ratio: auto !important; transform: none !important; box-shadow: none !important; }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            </style>
            ${Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(s => s.outerHTML).join('\n')}
          </head>
          <body>
            <div class="cert-print-container">
              ${element.outerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    } catch (err) {
      setError(err.message || 'Error downloading certificate');
    } finally {
      setBusy(false);
    }
  }

  async function downloadSpecificCert(cert) {
    try {
      if (cert.is_league) {
        const blob = await api.downloadLeagueCertificate(cert.league);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `literaai-${cert.league}-certificate.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const idx = allCerts.findIndex((c) => c.credential_id === cert.credential_id);
        if (idx !== -1) setSelectedIdx(idx);
        setTimeout(() => download(), 100);
      }
    } catch (err) {
      alert(err.message || 'Error downloading certificate');
    }
  }

  async function share() {
    const text = `🎉 LiteraAI Certificate: ${activeCert?.course_title}! Credential: ${activeCert?.credential_id}`;
    if (navigator.share) {
      await navigator.share({ title: labels.title, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  }

  if (!activeCert) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <PageTitle title={labels.title} subtitle={labels.lockedMsg} />
          </div>
          <GuideBird message={labels.lockedMsg} mood="think" size={48} />
        </div>
        <div className="glass-card rounded-[28px] p-6 text-center space-y-4 max-w-md mx-auto">
          <p className="text-[#06304f]/80 font-semibold text-sm">
            {labels.lockedMsg}
          </p>
          <button
            type="button"
            className="btn-primary py-3 px-6 text-sm font-bold shadow-lg"
            onClick={async () => {
              try {
                await api.checkpoint('foundation-1', { answers: [1, 2, 0, 0, 0, 3, 1] });
                window.location.reload();
              } catch (err) {
                alert(err.message || 'Error generating demo certificate');
              }
            }}
          >
            🏆 Generate Sample Certificate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle title={labels.title} subtitle="View and download your official LiteraAI literacy & league certificates" />
        </div>
        <GuideBird message={labels.victorySpeech} mood="cheer" size={48} />
      </div>

      {error ? <div className="mb-4 font-bold text-[#7a1f1f] text-center">{error}</div> : null}

      {/* ── Official Certificate Preview Canvas ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#06304f]/70 flex items-center gap-1.5">
            <Sparkles size={16} className="text-yellow-500" /> Active Certificate Display
          </h3>
          <span className="text-xs font-bold text-[#0b6fb8] bg-[#0b6fb8]/10 px-3 py-1 rounded-full">
            {activeCert?.is_league ? '🏆 League Tier Certificate' : '🎓 Course Completion Certificate'}
          </span>
        </div>

        <motion.div
          ref={certRef}
          key={activeCert.credential_id || selectedIdx}
          className="relative mx-auto w-full max-w-4xl aspect-[16/9]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Outer decorative border */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#0b6fb8] via-[#38bdf8] to-[#0b6fb8] p-[3px] shadow-2xl">
            {/* Inner decorative border */}
            <div className="h-full w-full rounded-[5px] bg-[#f0f8ff] p-[6px]">
              <div className="h-full w-full rounded-[3px] border-[2.5px] border-[#0b6fb8]/40 bg-[#f7fbff] flex flex-col relative overflow-hidden"
                style={{ borderStyle: 'double', borderWidth: '4px' }}
              >

                {/* Corner Flourishes (SVG ornaments) */}
                {[
                  'top-2 left-2',
                  'top-2 right-2 -scale-x-100',
                  'bottom-2 left-2 -scale-y-100',
                  'bottom-2 right-2 -scale-x-100 -scale-y-100',
                ].map((pos, i) => (
                  <svg key={i} className={`absolute ${pos} pointer-events-none`} width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M4 4C4 4 4 20 12 28C20 36 36 44 44 44" stroke="#0b6fb8" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
                    <path d="M4 4C4 4 8 16 14 22C20 28 32 36 44 44" stroke="#0b6fb8" strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
                    <circle cx="6" cy="6" r="2.5" fill="#0b6fb8" opacity="0.25" />
                  </svg>
                ))}

                {/* Subtle watermark pattern */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0b6fb8_1px,transparent_1px)] [background-size:12px_12px]" />

                {/* ─── Certificate Content ─── */}
                <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-4 md:px-12 md:py-6">

                  {/* Academy Header */}
                  <div className="tracking-[0.3em] text-[10px] md:text-xs font-bold text-[#0b6fb8]/70 uppercase">
                    {labels.academy}
                  </div>

                  {/* Title with elegant dividers */}
                  <div className="flex items-center gap-3 mt-1">
                    <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-[#0b6fb8]/40" />
                    <h2 className="text-xl md:text-3xl font-black text-[#06304f] tracking-wider" style={{ fontFamily: '"Space Grotesk", serif' }}>
                      {labels.title}
                    </h2>
                    <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-[#0b6fb8]/40" />
                  </div>

                  {/* Ornamental triple-line divider */}
                  <div className="mt-3 flex flex-col items-center gap-[2px]">
                    <div className="h-[1.5px] w-32 md:w-56 bg-gradient-to-r from-transparent via-[#0b6fb8]/50 to-transparent" />
                    <div className="h-[0.5px] w-24 md:w-40 bg-gradient-to-r from-transparent via-[#0b6fb8]/30 to-transparent" />
                  </div>

                  {/* Presented To */}
                  <p className="mt-3 text-[11px] md:text-sm text-[#06304f]/70 italic">
                    {labels.presentedTo}
                  </p>

                  {/* Recipient Name */}
                  <h1 className="mt-1 text-2xl md:text-5xl font-black text-[#0b6fb8]" style={{ fontFamily: '"Space Grotesk", serif' }}>
                    {user?.name || 'Learner'}
                  </h1>

                  {/* Underline for name */}
                  <div className="mt-1 h-[1px] w-40 md:w-64 bg-[#0b6fb8]/30" />

                  {/* Course Info */}
                  <p className="mt-3 text-[10px] md:text-sm text-[#06304f]/70">
                    {activeCert.is_league ? 'for demonstrating excellence and ranking up in the' : labels.completedText}
                  </p>
                  <p className="mt-0.5 text-base md:text-xl font-extrabold text-[#06304f]">
                    {activeCert.course_title}
                  </p>

                  {/* Score Badge */}
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#0b6fb8]/25 bg-[#0b6fb8]/5 px-3 py-1 text-xs md:text-sm font-bold text-[#0b6fb8]">
                    <CheckCircle2 size={14} />
                    {labels.score}: {activeCert.score || 100}%
                  </div>

                  {/* Bottom Section: Seal, Credential, Signature */}
                  <div className="mt-auto pt-3 w-full grid grid-cols-3 items-end gap-2 px-2 md:px-6">
                    {/* Left: Credential Info */}
                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-1 text-[9px] md:text-[11px] font-bold text-[#0b6fb8]">
                        <ShieldCheck size={12} /> {labels.seal}
                      </div>
                      <div className="text-[8px] md:text-[10px] text-[#06304f]/60 font-mono">
                        {labels.credentialId}: {activeCert.credential_id}
                      </div>
                      <div className="text-[8px] md:text-[10px] text-[#06304f]/60">
                        {labels.issuedDate}: {new Date(activeCert.issued_date || Date.now()).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Center: Official Seal Emblem */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-14 w-14 md:h-20 md:w-20 items-center justify-center">
                        {/* Outer ring */}
                        <div className="absolute inset-0 rounded-full border-[2.5px] border-[#0b6fb8]/30" />
                        <div className="absolute inset-[3px] rounded-full border border-dashed border-[#0b6fb8]/20" />
                        {/* Inner emblem */}
                        <div className="relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0b6fb8] to-[#065a96] shadow-md">
                          <Award className="text-white" size={20} />
                        </div>
                      </div>
                      <span className="mt-0.5 text-[7px] md:text-[9px] font-bold tracking-widest text-[#0b6fb8]/50 uppercase">
                        Official Seal
                      </span>
                    </div>

                    {/* Right: Signature */}
                    <div className="text-right flex flex-col items-end">
                      <div className="w-24 md:w-32 border-b border-[#06304f]/30 mb-0.5" />
                      <div className="text-xs md:text-sm font-bold italic text-[#0b6fb8]" style={{ fontFamily: '"Space Grotesk", serif' }}>
                        LiteraAI Board
                      </div>
                      <div className="text-[7px] md:text-[9px] tracking-wider text-[#06304f]/50 uppercase">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons – for currently active certificate */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            className="btn-primary inline-flex items-center gap-2 shadow-xl py-3 px-8 text-base font-extrabold"
            type="button"
            disabled={busy}
            onClick={download}
          >
            <Download size={18} /> {labels.download}
          </button>
          <button
            className="btn-ghost inline-flex items-center gap-2 py-3 px-6 text-sm font-extrabold"
            type="button"
            onClick={share}
          >
            <Share2 size={18} /> {labels.share}
          </button>
        </div>
      </div>

      {/* ── Completed Certificates List Directory ── */}
      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#06304f]/15 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#06304f] flex items-center gap-2">
              <Award className="text-[#0b6fb8]" size={26} /> Completed Certificates List
            </h2>
            <p className="text-xs font-extrabold text-[#06304f]/60 mt-0.5">
              Total Earned: {allCerts.length} Certificate{allCerts.length === 1 ? '' : 's'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: `All (${allCerts.length})` },
              { id: 'course', label: `Course (${courseCerts.length})` },
              { id: 'league', label: `League (${leagueCerts.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filterType === tab.id
                    ? 'bg-[#0b6fb8] text-white shadow-md'
                    : 'bg-white/60 text-[#06304f]/70 hover:bg-white hover:text-[#06304f]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Certificate Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCerts.map((cert) => {
            const certIndex = allCerts.findIndex((c) => c.credential_id === cert.credential_id);
            const isSelected = activeCert?.credential_id === cert.credential_id;

            return (
              <motion.div
                key={cert.credential_id}
                whileHover={{ y: -3 }}
                className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-white border-[#0b6fb8] shadow-xl ring-2 ring-[#0b6fb8]/30'
                    : 'bg-white/70 border-white/80 hover:border-[#0b6fb8]/40 hover:bg-white shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2.5 rounded-xl ${cert.is_league ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-[#0b6fb8]'}`}>
                      {cert.is_league ? <Medal size={22} /> : <BookOpen size={22} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      cert.is_league ? 'bg-amber-500/15 text-amber-800' : 'bg-[#0b6fb8]/15 text-[#0b6fb8]'
                    }`}>
                      {cert.is_league ? 'League Tier' : 'Literacy Course'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-[#06304f] line-clamp-2">
                      {cert.course_title}
                    </h3>
                    <p className="text-xs font-bold text-[#06304f]/60 font-mono mt-1">
                      ID: {cert.credential_id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#06304f]/10 text-xs font-bold">
                    <div>
                      <span className="text-[#06304f]/50 block text-[10px] uppercase">Score</span>
                      <span className="text-[#0b6fb8] font-black">{cert.score || 100}%</span>
                    </div>
                    <div>
                      <span className="text-[#06304f]/50 block text-[10px] uppercase">Issued Date</span>
                      <span className="text-[#06304f]">{new Date(cert.issued_date || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (certIndex !== -1) setSelectedIdx(certIndex);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#0b6fb8] text-white shadow-md'
                        : 'bg-white border border-[#06304f]/20 text-[#06304f] hover:bg-[#0b6fb8]/10 hover:text-[#0b6fb8]'
                    }`}
                  >
                    <Eye size={14} /> {isSelected ? 'Viewing' : 'View'}
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadSpecificCert(cert)}
                    className="py-2 px-3 rounded-xl font-bold text-xs bg-amber-500/10 text-amber-800 hover:bg-amber-500 hover:text-white transition-all inline-flex items-center justify-center gap-1"
                    title="Download PDF"
                  >
                    <Download size={14} /> PDF
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

