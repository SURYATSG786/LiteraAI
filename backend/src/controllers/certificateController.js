import { findUserById } from '../services/db.js';
import { generateCertificatePdf, generateLeagueCertificatePdf } from '../services/certificate.js';

export async function getCertificate(req, res) {
  try {
    const user = findUserById(req.user.id);
    if (!user.certificate?.issued) {
      return res.status(400).json({ error: 'Certificate not yet earned' });
    }

    const format = req.query.format || 'json';
    const payload = {
      name: user.name,
      courseTitle: user.certificate.course_title,
      score: user.certificate.score,
      credentialId: user.certificate.credential_id,
      issuedDate: new Date(user.certificate.issued_date).toLocaleDateString(),
      language: user.preferred_language,
    };

    if (format === 'pdf') {
      const pdf = await generateCertificatePdf(payload);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="literaai-certificate.pdf"`);
      return res.send(pdf);
    }

    res.json({ certificate: { ...user.certificate, learner_name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getLeagueCertificate(req, res) {
  try {
    const user = findUserById(req.user.id);
    const leagueQuery = (req.query.league || '').toLowerCase();
    const certs = user.league_certificates || [];
    const cert = leagueQuery ? certs.find((c) => c.league.toLowerCase() === leagueQuery) : certs[certs.length - 1];

    if (!cert) {
      return res.status(400).json({ error: 'League certificate not earned yet' });
    }

    const payload = {
      name: user.name,
      league: cert.league,
      score: cert.score,
      credentialId: cert.credential_id,
      issuedDate: new Date(cert.issued_date).toLocaleDateString(),
    };

    const pdf = await generateLeagueCertificatePdf(payload);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="literaai-${cert.league}-certificate.pdf"`);
    return res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
