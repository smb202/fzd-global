/* FZD Global — shared site behavior:
   - Mobile menu toggle
   - Scroll reveal observer
   - Animated number counters
   - Year stamp
*/
(function() {
  'use strict';

  // Mobile nav
  document.addEventListener('click', function(e) {
    const t = e.target.closest('[data-menu-toggle]');
    if (t) {
      const open = document.body.classList.toggle('menu-open');
      t.setAttribute('aria-expanded', open);
      return;
    }
    // Close menu when a nav link is clicked
    if (e.target.closest('.nav a') && document.body.classList.contains('menu-open')) {
      document.body.classList.remove('menu-open');
      const toggle = document.querySelector('[data-menu-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  function bindReveals() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (!el.classList.contains('in') && !el.dataset.observed) {
        el.dataset.observed = '1';
        io.observe(el);
      }
    });
  }
  bindReveals();
  // re-bind after lang swap (in case content changed)
  window.addEventListener('fzd:langchange', bindReveals);

  // Animated counters
  function animateCounter(el) {
    const raw = (el.textContent || '').trim();
    const match = raw.match(/^(\D*)([\d.,]+)(\D*)$/);
    if (!match) return;
    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];
    const target = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(target)) return;
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      const display = target >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '');
      el.textContent = prefix + display + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    }
    requestAnimationFrame(tick);
  }
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach(el => counterIO.observe(el));

  // Lang switch buttons
  document.addEventListener('click', function(e) {
    const b = e.target.closest('[data-lang-btn]');
    if (!b) return;
    window.FZD_setLang(b.getAttribute('data-lang-btn'));
  });

  // Year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Back-to-top button
  const btt = document.createElement('button');
  btt.className = 'back-to-top';
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btt);

  btt.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var bttVisible = false;
  function onBttScroll() {
    var show = window.scrollY > 400;
    if (show !== bttVisible) {
      bttVisible = show;
      btt.classList.toggle('is-visible', show);
    }
  }
  window.addEventListener('scroll', onBttScroll, { passive: true });
})();

// ——— Privacy Modal ————————————————————————————————
(function () {
  var CONTENT = {
    en: {
      eyebrow: 'FZD Global GmbH',
      title:   'Privacy Policy',
      date:    'English Version · Effective date: May 2026',
      body: [
        '<h3>1. Introduction</h3>',
        '<p>Welcome to FZD Global GmbH. We are a Heidelberg-based data and technology consulting firm providing cloud data platforms, business intelligence, AI systems, and process automation to enterprises across the DACH region and beyond. Protecting the privacy of the individuals whose data we process is a core responsibility, and we take it seriously.</p>',
        '<p>This Privacy Policy explains what personal data we collect when you visit our website fzd-global.de, how we use it, on what legal basis, and what rights you have under the EU General Data Protection Regulation (GDPR) and applicable German law.</p>',
        '<p>If you do not agree with this Privacy Policy, please do not use the website or submit any data through our contact form.</p>',

        '<h3>2. Data Controller</h3>',
        '<p>The controller responsible for processing personal data in connection with this website is:</p>',
        '<address>FZD Global GmbH<br>Neuenheimer Landstr. 5<br>69120 Heidelberg, Germany<br>E-Mail: <a href="mailto:info@fzd-global.de">info@fzd-global.de</a><br>Phone: +49 6221 6736786<br>Website: <a href="https://fzd-global.de">https://fzd-global.de</a></address>',

        '<h3>3. Personal Data We Collect</h3>',
        '<h4>3.1 Contact Form</h4>',
        '<p>When you submit an inquiry through our website, we collect the information you provide, which may include:</p>',
        '<ul><li>First name and last name</li><li>Work email address</li><li>Company name and role</li><li>Industry sector</li><li>The capability or service area you are enquiring about</li><li>A free-text description of your data challenge or project</li></ul>',
        '<p class="fzd-pm-legal">Legal basis: Art. 6(1)(b) GDPR (performance of pre-contractual measures at your request) and Art. 6(1)(f) GDPR (our legitimate interest in responding to business enquiries).</p>',

        '<h4>3.2 Server Log Files</h4>',
        '<p>Each time you access our website, our hosting provider automatically records technical information including:</p>',
        '<ul><li>IP address (anonymised after 7 days)</li><li>Date and time of the request</li><li>URL and referring URL</li><li>Browser type and version, operating system</li><li>HTTP status code and data volume transferred</li></ul>',
        '<p class="fzd-pm-legal">Legal basis: Art. 6(1)(f) GDPR — our legitimate interest in operating a stable, secure website. Log data is deleted after 30 days unless required for the investigation of a security incident.</p>',

        '<h4>3.3 Cookies and Tracking Technologies</h4>',
        '<p>Our website uses technically necessary cookies to ensure basic functionality (e.g. session management, language preferences). We do not use advertising or cross-site tracking cookies without your explicit consent.</p>',
        '<p>If we deploy optional analytics tools in the future, we will obtain your prior consent via a cookie consent banner in accordance with Art. 6(1)(a) GDPR and the German Telecommunications Digital Services Data Protection Act (TDDDG). You can withdraw consent at any time through your browser settings or the consent management interface.</p>',

        '<h3>4. How We Use Your Data</h3>',
        '<p>We use the personal data we collect for the following purposes:</p>',
        '<ul><li>Responding to your enquiries and qualifying project opportunities</li><li>Providing and operating our website</li><li>Ensuring website security and detecting or investigating misuse</li><li>Complying with legal obligations</li></ul>',
        '<p>We do not use your contact data for unsolicited direct marketing unless you have separately opted in to receive communications from us. Where opt-in marketing communications are offered, they will be clearly identified as such, and you may withdraw consent at any time.</p>',

        '<h3>5. Disclosure of Personal Data</h3>',
        '<p>We do not sell personal data to third parties. We may share data in the following limited circumstances:</p>',
        '<h4>5.1 Service Providers (Data Processors)</h4>',
        '<p>We work with third-party service providers who process data on our behalf under binding data processing agreements (Art. 28 GDPR), including:</p>',
        '<ul><li>Website hosting and infrastructure providers</li><li>Email communication services</li><li>CRM and project management tools</li></ul>',
        '<p>All processors are contractually required to process data only on our documented instructions and to implement appropriate technical and organisational security measures.</p>',
        '<h4>5.2 Legal Disclosure</h4>',
        '<p>We may disclose personal data where required to do so by law, court order, or at the request of a competent authority (e.g. law enforcement), or where necessary to protect our legal rights or enforce our contractual obligations.</p>',
        '<h4>5.3 Business Transfers</h4>',
        '<p>In the event of a merger, acquisition, or sale of all or part of our business assets, personal data held by us may be transferred to the acquiring entity. Affected individuals will be informed in advance where required by law.</p>',

        '<h3>6. International Data Transfers</h3>',
        '<p>Our primary operations and hosting infrastructure are located in the European Economic Area (EEA). Where service providers process data outside the EEA (e.g. on cloud platforms such as Microsoft Azure), we ensure adequate safeguards are in place, such as the EU Standard Contractual Clauses (SCCs) adopted by the European Commission under Art. 46(2)(c) GDPR.</p>',

        '<h3>7. Data Retention</h3>',
        '<p>We retain personal data only for as long as necessary for the purpose for which it was collected, or as required by applicable law:</p>',
        '<ul><li>Contact form data: retained for up to 3 years from the last interaction, or for the duration of a business relationship plus applicable statutory limitation periods (generally 3 years under § 195 BGB)</li><li>Server log files: deleted after 30 days unless an extended retention is required for security investigations</li><li>Tax and invoicing records: retained for 10 years in accordance with § 147 AO (German Fiscal Code)</li></ul>',
        '<p>When data is no longer required, it is securely deleted or anonymised.</p>',

        '<h3>8. Data Security</h3>',
        '<p>We implement appropriate technical and organisational measures to protect personal data against unauthorised access, accidental loss, destruction, or alteration, in accordance with Art. 32 GDPR. These include encrypted data transmission (TLS/HTTPS), access controls, and regular security reviews.</p>',
        '<p>No method of transmission over the internet is completely secure. While we take all reasonable precautions, we cannot guarantee absolute security.</p>',

        '<h3>9. Your Rights</h3>',
        '<p>Under the GDPR, you have the following rights with respect to your personal data:</p>',
        '<ul><li>Right of access (Art. 15 GDPR): obtain confirmation of whether we process your data and a copy of it</li><li>Right to rectification (Art. 16 GDPR): request correction of inaccurate data</li><li>Right to erasure (Art. 17 GDPR): request deletion of your data, subject to legal retention obligations</li><li>Right to restriction (Art. 18 GDPR): request that we restrict processing in certain circumstances</li><li>Right to data portability (Art. 20 GDPR): receive your data in a structured, machine-readable format</li><li>Right to object (Art. 21 GDPR): object at any time to processing based on our legitimate interests; we will cease processing unless we can demonstrate compelling legitimate grounds</li><li>Right to withdraw consent (Art. 7(3) GDPR): where processing is based on consent, withdraw it at any time without affecting the lawfulness of processing before withdrawal</li></ul>',
        '<p>To exercise any of these rights, please contact us at <a href="mailto:info@fzd-global.de">info@fzd-global.de</a> or write to us at the address above. We will respond within one month. In complex or high-volume cases, this period may be extended by a further two months; we will notify you accordingly.</p>',
        '<p>You will not be charged for exercising your rights. If requests are manifestly unfounded or excessive, we may charge a reasonable fee or refuse to act.</p>',

        '<h3>10. Right to Lodge a Complaint</h3>',
        '<p>You have the right to lodge a complaint with the competent data protection supervisory authority at any time (Art. 77 GDPR). The supervisory authority for FZD Global GmbH is:</p>',
        '<address>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI BW)<br>Königstraße 10a, 70173 Stuttgart, Germany<br>Website: <a href="https://www.baden-wuerttemberg.datenschutz.de">www.baden-wuerttemberg.datenschutz.de</a></address>',

        '<h3>11. Third-Party Links</h3>',
        '<p>Our website contains links to third-party websites (e.g. LinkedIn, technology partner sites). We have no control over, and are not responsible for, the privacy practices of those sites. We encourage you to review their privacy policies before providing any personal information.</p>',

        '<h3>12. Changes to This Privacy Policy</h3>',
        '<p>We may update this Privacy Policy from time to time to reflect changes in our services, legal obligations, or regulatory guidance. The current version is always available at <a href="https://fzd-global.de">https://fzd-global.de</a>. For material changes, we will provide appropriate notice.</p>',

        '<h3>13. Contact</h3>',
        '<p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>',
        '<address>FZD Global GmbH<br>Neuenheimer Landstr. 5, 69120 Heidelberg, Germany<br>E-Mail: <a href="mailto:info@fzd-global.de">info@fzd-global.de</a><br>Phone: +49 6221 6736786<br>Office hours: Monday–Friday, 09:00–18:00 CET</address>',
        '<div class="fzd-pm-doc-footer">© 2026 FZD Global GmbH — All rights reserved.</div>'
      ].join('')
    },

    de: {
      eyebrow: 'FZD Global GmbH',
      title:   'Datenschutzerklärung',
      date:    'Deutsche Version · Gültig ab: Mai 2026',
      body: [
        '<h3>1. Einleitung</h3>',
        '<p>Willkommen bei FZD Global GmbH. Wir sind ein in Heidelberg ansässiges Beratungsunternehmen für Daten- und Technologietransformation und bieten Cloud-Datenplattformen, Business Intelligence, KI-Systeme sowie Prozessautomatisierung für Unternehmen im DACH-Raum und darüber hinaus an. Der Schutz der personenbezogenen Daten der Personen, deren Daten wir verarbeiten, ist für uns eine zentrale Verantwortung.</p>',
        '<p>Diese Datenschutzerklärung erläutert, welche personenbezogenen Daten wir beim Besuch unserer Website fzd-global.de erheben, wie wir diese verwenden, auf welcher Rechtsgrundlage sowie welche Rechte Ihnen gemäß der Datenschutz-Grundverordnung (DSGVO) und dem anwendbaren deutschen Recht zustehen.</p>',
        '<p>Wenn Sie dieser Datenschutzerklärung nicht zustimmen, nutzen Sie bitte unsere Website nicht und übermitteln Sie keine Daten über unser Kontaktformular.</p>',

        '<h3>2. Verantwortlicher</h3>',
        '<p>Der Verantwortliche für die Verarbeitung personenbezogener Daten im Zusammenhang mit dieser Website ist:</p>',
        '<address>FZD Global GmbH<br>Neuenheimer Landstr. 5<br>69120 Heidelberg, Deutschland<br>E-Mail: <a href="mailto:info@fzd-global.de">info@fzd-global.de</a><br>Telefon: +49 6221 6736786<br>Website: <a href="https://fzd-global.de">https://fzd-global.de</a></address>',

        '<h3>3. Personenbezogene Daten, die wir erheben</h3>',
        '<h4>3.1 Kontaktformular</h4>',
        '<p>Wenn Sie über unser Kontaktformular eine Anfrage senden, erheben wir die von Ihnen bereitgestellten Informationen, darunter:</p>',
        '<ul><li>Vor- und Nachname</li><li>Geschäftliche E-Mail-Adresse</li><li>Unternehmen und Position</li><li>Branche</li><li>Gewünschter Leistungsbereich</li><li>Freitext zur Beschreibung Ihres Datenproblems oder Projekts</li></ul>',
        '<p class="fzd-pm-legal">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen auf Ihre Anfrage hin) sowie Art. 6 Abs. 1 lit. f DSGVO (unser berechtigtes Interesse an der Beantwortung geschäftlicher Anfragen).</p>',

        '<h4>3.2 Server-Logfiles</h4>',
        '<p>Bei jedem Zugriff auf unsere Website erfasst unser Hosting-Anbieter automatisch technische Informationen, u. a.:</p>',
        '<ul><li>IP-Adresse (nach 7 Tagen anonymisiert)</li><li>Datum und Uhrzeit des Zugriffs</li><li>Aufgerufene URL und Referrer-URL</li><li>Browsertyp und -version, Betriebssystem</li><li>HTTP-Statuscode und übertragenes Datenvolumen</li></ul>',
        '<p class="fzd-pm-legal">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO – unser berechtigtes Interesse am stabilen und sicheren Betrieb der Website. Logdaten werden nach 30 Tagen gelöscht, sofern sie nicht zur Untersuchung eines Sicherheitsvorfalls benötigt werden.</p>',

        '<h4>3.3 Cookies und Tracking-Technologien</h4>',
        '<p>Unsere Website verwendet technisch notwendige Cookies zur Sicherstellung der Grundfunktionalität (z. B. Session-Management, Spracheinstellungen). Werbe- oder Cross-Site-Tracking-Cookies werden ohne Ihre ausdrückliche Einwilligung nicht eingesetzt.</p>',
        '<p>Sollten zukünftig optionale Analyse-Tools eingesetzt werden, holen wir Ihre Einwilligung vorab über ein Cookie-Consent-Banner gemäß Art. 6 Abs. 1 lit. a DSGVO und dem Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG) ein. Eine erteilte Einwilligung kann jederzeit über die Browsereinstellungen oder die Consent-Verwaltung widerrufen werden.</p>',

        '<h3>4. Zwecke der Datenverarbeitung</h3>',
        '<p>Wir verwenden die erhobenen personenbezogenen Daten zu folgenden Zwecken:</p>',
        '<ul><li>Beantwortung von Anfragen und Qualifizierung von Projektmöglichkeiten</li><li>Bereitstellung und Betrieb unserer Website</li><li>Gewährleistung der Websitesicherheit sowie Erkennung und Untersuchung von Missbrauch</li><li>Erfüllung gesetzlicher Pflichten</li></ul>',
        '<p>Wir verwenden Ihre Kontaktdaten nicht für unerwünschte Direktwerbung, sofern Sie hierzu nicht gesondert eingewilligt haben. Sofern Marketing-Kommunikationen angeboten werden, werden diese als solche gekennzeichnet und können jederzeit widerrufen werden.</p>',

        '<h3>5. Weitergabe personenbezogener Daten</h3>',
        '<p>Wir verkaufen keine personenbezogenen Daten. Eine Weitergabe erfolgt ausschließlich in folgenden Fällen:</p>',
        '<h4>5.1 Auftragsverarbeiter</h4>',
        '<p>Wir setzen Drittanbieter ein, die Daten in unserem Auftrag auf Grundlage von Auftragsverarbeitungsverträgen gemäß Art. 28 DSGVO verarbeiten, darunter:</p>',
        '<ul><li>Anbieter von Website-Hosting und Infrastruktur</li><li>E-Mail-Kommunikationsdienste</li><li>CRM- und Projektmanagement-Tools</li></ul>',
        '<p>Alle Auftragsverarbeiter sind vertraglich verpflichtet, Daten ausschließlich gemäß unseren dokumentierten Weisungen zu verarbeiten und angemessene technische und organisatorische Sicherheitsmaßnahmen zu implementieren.</p>',
        '<h4>5.2 Gesetzliche Offenlegung</h4>',
        '<p>Wir können personenbezogene Daten offenlegen, wenn wir gesetzlich, durch Gerichtsbeschluss oder auf Anfrage einer zuständigen Behörde (z. B. Strafverfolgungsbehörden) dazu verpflichtet sind oder wenn dies zum Schutz unserer rechtlichen Interessen oder zur Durchsetzung unserer vertraglichen Pflichten erforderlich ist.</p>',
        '<h4>5.3 Unternehmensübertragungen</h4>',
        '<p>Im Falle einer Fusion, Übernahme oder eines Vermögenstransfers können bei uns gespeicherte personenbezogene Daten auf das übernehmende Unternehmen übertragen werden. Betroffene Personen werden vorab informiert, sofern dies gesetzlich vorgeschrieben ist.</p>',

        '<h3>6. Internationale Datenübermittlungen</h3>',
        '<p>Unsere primäre Infrastruktur befindet sich im Europäischen Wirtschaftsraum (EWR). Soweit Auftragsverarbeiter Daten außerhalb des EWR verarbeiten (z. B. auf Cloud-Plattformen wie Microsoft Azure), stellen wir geeignete Garantien sicher, insbesondere durch die von der Europäischen Kommission verabschiedeten Standardvertragsklauseln (SCC) gemäß Art. 46 Abs. 2 lit. c DSGVO.</p>',

        '<h3>7. Speicherfristen</h3>',
        '<p>Wir speichern personenbezogene Daten nur so lange, wie es für den Zweck der Erhebung erforderlich ist oder wie es gesetzlich vorgeschrieben ist:</p>',
        '<ul><li>Kontaktformulardaten: bis zu 3 Jahre ab dem letzten Kontakt bzw. für die Dauer einer Geschäftsbeziehung zzgl. gesetzlicher Verjährungsfristen (regelmäßig 3 Jahre gemäß § 195 BGB)</li><li>Server-Logfiles: Löschung nach 30 Tagen, sofern keine erweiterte Aufbewahrung für Sicherheitsuntersuchungen erforderlich ist</li><li>Steuer- und Rechnungsunterlagen: 10 Jahre gemäß § 147 AO</li></ul>',
        '<p>Nach Ablauf der Aufbewahrungsfristen werden die Daten sicher gelöscht oder anonymisiert.</p>',

        '<h3>8. Datensicherheit</h3>',
        '<p>Wir setzen geeignete technische und organisatorische Maßnahmen zum Schutz personenbezogener Daten vor unbefugtem Zugriff, versehentlichem Verlust, Zerstörung oder Veränderung gemäß Art. 32 DSGVO um. Hierzu gehören verschlüsselte Datenübertragung (TLS/HTTPS), Zugriffskontrollen und regelmäßige Sicherheitsüberprüfungen.</p>',
        '<p>Keine Übertragungsmethode über das Internet ist vollständig sicher. Trotz aller zumutbaren Vorsichtsmaßnahmen können wir keine absolute Sicherheit gewährleisten.</p>',

        '<h3>9. Ihre Rechte als betroffene Person</h3>',
        '<p>Gemäß DSGVO stehen Ihnen in Bezug auf Ihre personenbezogenen Daten folgende Rechte zu:</p>',
        '<ul><li>Auskunftsrecht (Art. 15 DSGVO): Bestätigung, ob wir Ihre Daten verarbeiten, und Erhalt einer Kopie</li><li>Recht auf Berichtigung (Art. 16 DSGVO): Korrektur unrichtiger Daten</li><li>Recht auf Löschung (Art. 17 DSGVO): Löschung Ihrer Daten, vorbehaltlich gesetzlicher Aufbewahrungspflichten</li><li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO): Einschränkung der Verarbeitung unter bestimmten Voraussetzungen</li><li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO): Erhalt Ihrer Daten in einem strukturierten, maschinenlesbaren Format</li><li>Widerspruchsrecht (Art. 21 DSGVO): jederzeitiger Widerspruch gegen die auf unser berechtigtes Interesse gestützte Verarbeitung; wir stellen die Verarbeitung ein, sofern wir keine zwingenden schutzwürdigen Gründe nachweisen können</li><li>Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO): jederzeitiger Widerruf einer erteilten Einwilligung, ohne dass die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung berührt wird</li></ul>',
        '<p>Zur Ausübung Ihrer Rechte wenden Sie sich bitte an <a href="mailto:info@fzd-global.de">info@fzd-global.de</a> oder schreiben Sie uns an die oben genannte Adresse. Wir antworten innerhalb eines Monats. Bei komplexen oder umfangreichen Anfragen kann diese Frist um weitere zwei Monate verlängert werden; wir informieren Sie entsprechend.</p>',
        '<p>Für die Ausübung Ihrer Rechte werden keine Gebühren erhoben. Bei offensichtlich unbegründeten oder exzessiven Anfragen behalten wir uns vor, eine angemessene Gebühr zu erheben oder die Bearbeitung abzulehnen.</p>',

        '<h3>10. Beschwerderecht bei der Aufsichtsbehörde</h3>',
        '<p>Sie haben das Recht, jederzeit eine Beschwerde bei der zuständigen Datenschutzaufsichtsbehörde einzulegen (Art. 77 DSGVO). Die für FZD Global GmbH zuständige Aufsichtsbehörde ist:</p>',
        '<address>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI BW)<br>Königstraße 10a, 70173 Stuttgart, Deutschland<br>Website: <a href="https://www.baden-wuerttemberg.datenschutz.de">www.baden-wuerttemberg.datenschutz.de</a></address>',

        '<h3>11. Links zu Drittanbieter-Websites</h3>',
        '<p>Unsere Website enthält Links zu Drittanbieter-Websites (z. B. LinkedIn, Technologiepartner-Seiten). Wir haben keinen Einfluss auf deren Datenschutzpraktiken und übernehmen dafür keine Verantwortung. Wir empfehlen, die jeweiligen Datenschutzerklärungen zu prüfen, bevor Sie personenbezogene Daten übermitteln.</p>',

        '<h3>12. Änderungen dieser Datenschutzerklärung</h3>',
        '<p>Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren, um Änderungen in unserem Leistungsangebot, gesetzlichen Anforderungen oder behördlichen Vorgaben Rechnung zu tragen. Die jeweils aktuelle Version ist stets unter <a href="https://fzd-global.de">https://fzd-global.de</a> verfügbar. Bei wesentlichen Änderungen werden wir in geeigneter Weise informieren.</p>',

        '<h3>13. Kontakt</h3>',
        '<p>Bei Fragen oder Bedenken zu dieser Datenschutzerklärung oder unseren Datenschutzpraktiken wenden Sie sich bitte an uns:</p>',
        '<address>FZD Global GmbH<br>Neuenheimer Landstr. 5, 69120 Heidelberg, Deutschland<br>E-Mail: <a href="mailto:info@fzd-global.de">info@fzd-global.de</a><br>Telefon: +49 6221 6736786<br>Bürozeiten: Montag–Freitag, 09:00–18:00 Uhr MEZ</address>',
        '<div class="fzd-pm-doc-footer">© 2026 FZD Global GmbH — Alle Rechte vorbehalten.</div>'
      ].join('')
    }
  };

  function getLang() {
    return (typeof window.FZD_getLang === 'function') ? window.FZD_getLang() : 'en';
  }

  function buildModal() {
    var overlay = document.createElement('div');
    overlay.id = 'fzd-privacy-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Privacy Policy');
    overlay.innerHTML =
      '<div id="fzd-privacy-panel">' +
        '<div id="fzd-privacy-header">' +
          '<div class="fzd-pm-htext">' +
            '<div class="fzd-pm-eyebrow" id="fzd-pm-eyebrow"></div>' +
            '<div class="fzd-pm-title"  id="fzd-pm-title"></div>' +
            '<div class="fzd-pm-date"   id="fzd-pm-date"></div>' +
          '</div>' +
          '<button id="fzd-privacy-close" aria-label="Close">×</button>' +
        '</div>' +
        '<div id="fzd-privacy-body"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('fzd-privacy-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });
    window.addEventListener('fzd:langchange', function(e) {
      if (overlay.classList.contains('is-open')) updateContent(e.detail.lang);
    });
  }

  function updateContent(lang) {
    var c = CONTENT[lang] || CONTENT.en;
    document.getElementById('fzd-pm-eyebrow').textContent = c.eyebrow;
    document.getElementById('fzd-pm-title').textContent   = c.title;
    document.getElementById('fzd-pm-date').textContent    = c.date;
    document.getElementById('fzd-privacy-body').innerHTML = c.body;
  }

  function openModal() {
    updateContent(getLang());
    var overlay = document.getElementById('fzd-privacy-overlay');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('fzd-privacy-close').focus();
  }

  function closeModal() {
    var overlay = document.getElementById('fzd-privacy-overlay');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  window.FZD_openPrivacy = function(e) {
    if (e) { e.preventDefault(); }
    openModal();
  };

  document.addEventListener('DOMContentLoaded', buildModal);
}());
