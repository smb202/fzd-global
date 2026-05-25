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

// ——— Terms & Conditions Modal ————————————————————
(function () {
  var TERMS = {
    en: {
      eyebrow: 'FZD Global GmbH',
      title:   'General Terms and Conditions',
      date:    'English Version · Effective date: May 2026',
      body: [
        '<p style="font-size:13px;color:var(--text-3);font-family:var(--mono);line-height:1.6;margin-bottom:20px;">These General Terms and Conditions ("GTC") apply exclusively to all consulting, data, technology and related services provided by FZD Global GmbH to business clients. They govern the contractual relationship between the parties unless an individual written agreement expressly derogates from them.</p>',
        '<address>FZD Global GmbH<br>Neuenheimer Landstr. 5, 69120 Heidelberg, Germany<br>E-Mail: <a href="mailto:info@fzd-global.de">info@fzd-global.de</a> &nbsp;|&nbsp; Phone: +49 6221 6736786</address>',

        '<h3>§ 1 &nbsp;Scope of Application</h3>',
        '<p>(1) These GTC apply to all contracts for consulting, data engineering, analytics, business intelligence, AI, automation, governance, and related advisory services ("Services") concluded between FZD Global GmbH ("FZD" or "Contractor") and the Client.</p>',
        '<p>(2) These GTC apply exclusively to entrepreneurs within the meaning of § 14 BGB (German Civil Code). FZD does not contract with consumers (§ 13 BGB). Any purchase or payment on the website requires the Client to confirm it is acting as a business.</p>',
        '<p>(3) Conflicting or deviating general terms and conditions of the Client are hereby rejected and shall not become part of the contract, even if FZD does not object to them again after receiving them.</p>',
        '<p>(4) Individual written agreements ("Statement of Work", "Project Order", "Service Agreement") take precedence over these GTC in the event of any conflict.</p>',

        '<h3>§ 2 &nbsp;Conclusion of Contract</h3>',
        '<p>(1) All descriptions of services on FZD\'s website or in proposals are non-binding invitations to submit an offer (invitatio ad offerendum).</p>',
        '<p>(2) A binding contract is concluded only when FZD sends a written order confirmation, signs a Statement of Work, or commences performance with the Client\'s knowledge and without objection.</p>',
        '<p>(3) The Client\'s acceptance of a proposal or Statement of Work constitutes the offer; FZD\'s written confirmation constitutes acceptance.</p>',

        '<h3>§ 3 &nbsp;Scope of Services</h3>',
        '<p>(1) The precise scope, deliverables, timelines, and acceptance criteria for each engagement are defined in the applicable Statement of Work ("SoW") or Project Order agreed by both parties in writing.</p>',
        '<p>(2) FZD\'s obligations are obligations of means (Dienstvertrag, §§ 611 et seq. BGB) unless the SoW expressly designates a specific result as a guaranteed work product (Werkvertrag, §§ 631 et seq. BGB). Advisory and consulting services are generally classified as service contracts.</p>',
        '<p>(3) Changes to the agreed scope require a written change order signed by both parties. FZD is entitled to adjust timelines and fees accordingly.</p>',
        '<p>(4) FZD is entitled to engage qualified subcontractors for partial performance. FZD remains fully responsible to the Client for all subcontracted work.</p>',
        '<p>(5) The Client shall provide all information, access, data, test environments, and personnel cooperation reasonably necessary for FZD to perform the Services. Delays caused by the Client\'s failure to cooperate will extend agreed timelines and may entitle FZD to invoice for waiting time at the applicable day rate.</p>',

        '<h3>§ 4 &nbsp;Fees, Payment, and Default</h3>',
        '<p>(1) FZD operates two standard pricing models, which are defined in the applicable SoW:</p>',
        '<ul><li><strong>Fixed-Price Projects:</strong> A lump-sum fee for a defined scope and deliverables. Payment is structured in milestones as set out in the SoW (typically 30% on contract signature, intermediate milestone payments, and a final payment on acceptance or go-live).</li><li><strong>Time &amp; Materials (T&amp;M):</strong> Services are invoiced based on actual time spent at the agreed day or hourly rates, plus reimbursable expenses. Invoices are issued monthly in arrears unless agreed otherwise.</li></ul>',
        '<p>(2) All prices are stated net of statutory value-added tax (VAT). VAT is added at the applicable rate on each invoice.</p>',
        '<p>(3) Invoices are payable within 14 days of the invoice date without deduction, unless a different period is specified in the SoW.</p>',
        '<p>(4) If the Client fails to pay within the agreed period, the Client enters into default without the need for a reminder (pursuant to § 286 BGB). From the date of default, FZD is entitled to charge default interest at the statutory B2B rate (§ 288 Abs. 2 BGB: base rate + 9 percentage points p.a.) plus a flat collection fee of EUR 40 pursuant to § 288 Abs. 5 BGB.</p>',
        '<p>(5) FZD reserves the right to suspend performance if the Client is more than 30 days overdue on any undisputed invoice, upon 5 business days\' prior written notice.</p>',
        '<p>(6) The Client may only offset amounts against FZD\'s claims if the counterclaim is undisputed, legally established by a court, or ready for decision.</p>',

        '<h3>§ 5 &nbsp;Intellectual Property and Licence Rights</h3>',
        '<p>(1) Ownership of intellectual property rights in deliverables shall be expressly addressed in each SoW. If the SoW is silent, the default rules in paragraphs (2)–(4) apply.</p>',
        '<p>(2) <strong>Background IP:</strong> All tools, frameworks, methodologies, templates, code libraries, and know-how developed by FZD prior to or independently of a specific engagement remain FZD\'s exclusive property. FZD grants the Client a non-exclusive, non-transferable, perpetual licence to use such background IP solely as embedded in the deliverables and solely for the Client\'s internal business purposes, conditional on full payment.</p>',
        '<p>(3) <strong>Project-specific deliverables:</strong> Where the SoW expressly provides that the Client shall own project-specific deliverables (foreground IP), such ownership vests in the Client upon receipt of full payment. FZD retains the right to use anonymised, aggregated learnings and methodologies for its own practice development.</p>',
        '<p>(4) If the SoW does not specify ownership, FZD retains all intellectual property rights and grants the Client an exclusive, perpetual, royalty-free licence for internal business purposes, conditional on full payment.</p>',
        '<p>(5) Third-party components: FZD will disclose material third-party licences in the SoW or project documentation.</p>',

        '<h3>§ 6 &nbsp;Confidentiality</h3>',
        '<p>(1) Each party shall keep confidential all non-public information disclosed by the other party in connection with the engagement ("Confidential Information") and shall use it exclusively for the purpose of performing or receiving the Services.</p>',
        '<p>(2) Confidential Information does not include information that was already publicly known, lawfully known to the receiving party prior to disclosure, received from a third party without a confidentiality duty, or independently developed.</p>',
        '<p>(3) The confidentiality obligation survives termination of the contract for a period of five (5) years.</p>',

        '<h3>§ 7 &nbsp;Data Protection</h3>',
        '<p>(1) Both parties shall comply with all applicable data protection laws, in particular the GDPR and the Federal Data Protection Act (BDSG).</p>',
        '<p>(2) Where FZD processes personal data on behalf of the Client, the parties shall conclude a Data Processing Agreement (DPA) pursuant to Art. 28 GDPR prior to commencement of such processing.</p>',
        '<p>(3) FZD\'s general data practices are described in the <a href="#" onclick="FZD_openPrivacy(event)">Privacy Policy</a>.</p>',

        '<h3>§ 8 &nbsp;Liability</h3>',
        '<p>(1) FZD is fully liable without limitation for damages caused by intent or gross negligence; injury to life, body, or health; liability under the German Product Liability Act; and fraudulent concealment of a defect.</p>',
        '<p>(2) For damages caused by slight negligence, FZD is only liable if a material contractual obligation (Kardinalpflicht) has been breached. In such cases, liability is limited to the foreseeable, contract-typical damage.</p>',
        '<p>(3) FZD\'s aggregate liability per project engagement is limited to the total fees paid by the Client under the relevant SoW, unless caused by gross negligence or intent.</p>',
        '<p>(4) Claims for defects in Werkvertrag services expire in 12 months from acceptance, unless caused by intent or fraudulent concealment.</p>',

        '<h3>§ 9 &nbsp;Force Majeure</h3>',
        '<p>(1) Neither party shall be liable for failure or delay in performing its obligations caused by circumstances beyond its reasonable control, including acts of God, war, pandemic, governmental restrictions, power outages, or failures of third-party infrastructure.</p>',
        '<p>(2) If a Force Majeure Event continues for more than 60 consecutive calendar days, either party may terminate the affected SoW by written notice without liability, save that the Client shall pay for Services properly performed up to termination.</p>',

        '<h3>§ 10 &nbsp;Non-Solicitation</h3>',
        '<p>During the term of any active engagement and for twelve (12) months thereafter, neither party shall directly solicit or recruit for employment the other party\'s employees or key subcontractors who were personally involved in the engagement, without prior written consent.</p>',

        '<h3>§ 11 &nbsp;Reference and Portfolio</h3>',
        '<p>FZD may, unless the Client expressly objects in writing, name the Client as a reference client and describe the nature of the engagement (without disclosing confidential project details) in FZD\'s marketing materials, website, and pitch decks.</p>',

        '<h3>§ 12 &nbsp;Term and Termination</h3>',
        '<p>(1) Each engagement commences on the date specified in the SoW and continues until completion of the agreed deliverables or the expiry of the agreed term.</p>',
        '<p>(2) Either party may terminate for cause with immediate effect if the other party materially breaches the contract and fails to cure within 14 calendar days of written notice, or if insolvency proceedings are opened.</p>',
        '<p>(3) For T&amp;M engagements without a fixed end date, either party may terminate with 30 days\' written notice to the end of a calendar month.</p>',
        '<p>(4) Upon termination: the Client shall pay for all Services performed up to the effective date; each party shall return or destroy the other party\'s Confidential Information; any licence granted under § 5 is conditional on full payment.</p>',

        '<h3>§ 13 &nbsp;Amendments to These GTC</h3>',
        '<p>(1) FZD reserves the right to amend these GTC. Amendments will be communicated at least 30 days before they take effect.</p>',
        '<p>(2) Amendments are deemed accepted if the Client does not object in writing within 30 days and continues to use FZD\'s services.</p>',

        '<h3>§ 14 &nbsp;Governing Law and Jurisdiction</h3>',
        '<p>(1) These GTC and all contracts concluded under them are governed exclusively by the law of the Federal Republic of Germany, excluding the CISG.</p>',
        '<p>(2) The exclusive place of jurisdiction is Heidelberg, Germany, provided the Client is a merchant, a legal entity under public law, or a public-law special fund.</p>',

        '<h3>§ 15 &nbsp;Miscellaneous</h3>',
        '<p>(1) <strong>Severability:</strong> If any provision is or becomes invalid, the remaining provisions remain in full force.</p>',
        '<p>(2) <strong>Written form:</strong> Amendments and waivers require written form. Electronic text form (e-mail, PDF) satisfies this requirement unless a notarised document is required by law.</p>',
        '<p>(3) <strong>Entire agreement:</strong> These GTC together with the applicable SoW constitute the entire agreement and supersede all prior agreements and understandings.</p>',

        '<div class="fzd-pm-doc-footer">© 2026 FZD Global GmbH — All rights reserved.</div>'
      ].join('')
    },

    de: {
      eyebrow: 'FZD Global GmbH',
      title:   'Allgemeine Geschäftsbedingungen (AGB)',
      date:    'Deutsche Version · Gültig ab: Mai 2026',
      body: [
        '<p style="font-size:13px;color:var(--text-3);font-family:var(--mono);line-height:1.6;margin-bottom:20px;">Diese Allgemeinen Geschäftsbedingungen („AGB") gelten ausschließlich für alle Beratungs-, Daten-, Technologie- und verwandten Dienstleistungen, die von der FZD Global GmbH an Geschäftskunden erbracht werden. Sie regeln das Vertragsverhältnis zwischen den Parteien, sofern keine individuelle schriftliche Vereinbarung ausdrücklich von ihnen abweicht.</p>',
        '<address>FZD Global GmbH<br>Neuenheimer Landstr. 5, 69120 Heidelberg, Deutschland<br>E-Mail: <a href="mailto:info@fzd-global.de">info@fzd-global.de</a> &nbsp;|&nbsp; Telefon: +49 6221 6736786</address>',

        '<h3>§ 1 &nbsp;Geltungsbereich</h3>',
        '<p>(1) Diese AGB gelten für alle Verträge über Beratung, Data Engineering, Analytics, Business Intelligence, KI, Automatisierung, Governance und verwandte Beratungsleistungen („Dienstleistungen"), die zwischen FZD Global GmbH („FZD" oder „Auftragnehmer") und dem Auftraggeber geschlossen werden.</p>',
        '<p>(2) Diese AGB gelten ausschließlich gegenüber Unternehmern im Sinne von § 14 BGB. FZD kontrahiert nicht mit Verbrauchern im Sinne von § 13 BGB.</p>',
        '<p>(3) Entgegenstehende oder abweichende AGB des Auftraggebers werden hiermit abgelehnt und werden nicht Vertragsbestandteil.</p>',
        '<p>(4) Individuelle schriftliche Vereinbarungen („Leistungsbeschreibung", „Projektauftrag", „Dienstleistungsvertrag") haben im Konfliktfall Vorrang vor diesen AGB.</p>',

        '<h3>§ 2 &nbsp;Vertragsschluss</h3>',
        '<p>(1) Alle Leistungsbeschreibungen auf der Website von FZD oder in Angeboten sind unverbindliche Aufforderungen zur Abgabe eines Angebots (invitatio ad offerendum).</p>',
        '<p>(2) Ein verbindlicher Vertrag kommt erst zustande, wenn FZD eine schriftliche Auftragsbestätigung versendet, eine Leistungsbeschreibung unterzeichnet oder die Leistungserbringung mit Wissen des Auftraggebers aufnimmt.</p>',
        '<p>(3) Die Annahme eines Angebots durch den Auftraggeber stellt das Angebot dar; die schriftliche Bestätigung durch FZD die Annahme.</p>',

        '<h3>§ 3 &nbsp;Leistungsumfang</h3>',
        '<p>(1) Der genaue Umfang, die Liefergegenstände, Zeitpläne und Abnahmekriterien werden in der jeweiligen Leistungsbeschreibung („LB") festgelegt.</p>',
        '<p>(2) Die Leistungspflichten von FZD sind grundsätzlich Dienstleistungspflichten (Dienstvertrag gemäß §§ 611 ff. BGB), es sei denn, die LB bezeichnet einen bestimmten Erfolg ausdrücklich als geschuldetes Werkleistungsprodukt.</p>',
        '<p>(3) Änderungen des vereinbarten Leistungsumfangs bedürfen eines schriftlichen Änderungsauftrags. FZD ist berechtigt, Zeitpläne und Vergütungen anzupassen.</p>',
        '<p>(4) FZD ist berechtigt, für Teilleistungen qualifizierte Subunternehmer einzusetzen. FZD bleibt gegenüber dem Auftraggeber vollständig verantwortlich.</p>',
        '<p>(5) Der Auftraggeber stellt alle erforderlichen Informationen, Zugriffsrechte und personelle Mitwirkung zur Verfügung. Verzögerungen durch mangelnde Mitwirkung verlängern vereinbarte Termine.</p>',

        '<h3>§ 4 &nbsp;Vergütung, Zahlung und Verzug</h3>',
        '<p>(1) FZD betreibt zwei Standard-Vergütungsmodelle:</p>',
        '<ul><li><strong>Festpreisprojekte:</strong> Pauschalvergütung mit Meilensteinzahlungen (typischerweise 30 % bei Vertragsunterzeichnung, Zwischenmeilensteinzahlungen, Abschlusszahlung bei Abnahme).</li><li><strong>Zeit &amp; Material (T&amp;M):</strong> Abrechnung auf Basis tatsächlichen Aufwands zum vereinbarten Satz, monatlich nachträglich.</li></ul>',
        '<p>(2) Alle Preise verstehen sich netto zuzüglich gesetzlicher Umsatzsteuer.</p>',
        '<p>(3) Rechnungen sind innerhalb von 14 Tagen nach Rechnungsdatum fällig.</p>',
        '<p>(4) Bei Zahlungsverzug ist FZD berechtigt, Verzugszinsen zum gesetzlichen B2B-Satz (§ 288 Abs. 2 BGB: Basiszinssatz + 9 Prozentpunkte p. a.) sowie eine Pauschale von 40 € gemäß § 288 Abs. 5 BGB geltend zu machen.</p>',
        '<p>(5) FZD behält sich vor, die Leistungserbringung auszusetzen, wenn der Auftraggeber mehr als 30 Tage in Verzug ist.</p>',

        '<h3>§ 5 &nbsp;Geistiges Eigentum und Nutzungsrechte</h3>',
        '<p>(1) Die Inhaberschaft an Rechten des geistigen Eigentums wird in jeder LB ausdrücklich geregelt. Enthält die LB keine Regelung, gelten die Absätze (2)–(4).</p>',
        '<p>(2) <strong>Background-IP:</strong> Alle Werkzeuge, Frameworks, Methoden, Templates und Know-how von FZD verbleiben im ausschließlichen Eigentum von FZD. FZD räumt dem Auftraggeber ein einfaches, nicht übertragbares, dauerhaftes Nutzungsrecht für interne Zwecke ein, bedingt durch vollständige Zahlung.</p>',
        '<p>(3) <strong>Projektspezifische Liefergegenstände:</strong> Sieht die LB Eigentumsübertragung vor, geht das Eigentum mit vollständiger Zahlung auf den Auftraggeber über.</p>',
        '<p>(4) Fehlt eine Regelung in der LB, verbleiben alle Rechte bei FZD und der Auftraggeber erhält ein ausschließliches, dauerhaftes, lizenzgebührenfreies Nutzungsrecht für interne Zwecke.</p>',

        '<h3>§ 6 &nbsp;Vertraulichkeit</h3>',
        '<p>(1) Jede Partei hält alle nichtöffentlichen Informationen der anderen Partei streng vertraulich und nutzt sie ausschließlich zur Leistungserbringung.</p>',
        '<p>(2) Die Geheimhaltungspflicht gilt fünf (5) Jahre nach Beendigung des Vertrags fort.</p>',

        '<h3>§ 7 &nbsp;Datenschutz</h3>',
        '<p>(1) Beide Parteien halten alle anwendbaren Datenschutzgesetze ein, insbesondere die DSGVO und das BDSG.</p>',
        '<p>(2) Soweit FZD personenbezogene Daten im Auftrag des Auftraggebers verarbeitet, schließen die Parteien vorab einen Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO ab.</p>',
        '<p>(3) Die allgemeinen Datenschutzpraktiken von FZD sind in der <a href="#" onclick="FZD_openPrivacy(event)">Datenschutzerklärung</a> beschrieben.</p>',

        '<h3>§ 8 &nbsp;Haftung</h3>',
        '<p>(1) FZD haftet unbeschränkt für Schäden aus Vorsatz oder grober Fahrlässigkeit, Verletzungen von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz.</p>',
        '<p>(2) Für leichte Fahrlässigkeit haftet FZD nur bei Verletzung einer Kardinalpflicht, begrenzt auf den vorhersehbaren, vertragstypischen Schaden.</p>',
        '<p>(3) Die Gesamthaftung pro Projektauftrag ist auf die Gesamtvergütung der jeweiligen LB begrenzt, sofern kein Vorsatz oder grobe Fahrlässigkeit vorliegt.</p>',
        '<p>(4) Ansprüche wegen Mängeln bei Werkvertragsleistungen verjähren 12 Monate nach Abnahme.</p>',

        '<h3>§ 9 &nbsp;Höhere Gewalt</h3>',
        '<p>(1) Keine Partei haftet für Leistungsstörungen durch Umstände höherer Gewalt (Force Majeure), einschließlich Naturkatastrophen, Krieg, Pandemie, staatlicher Beschränkungen oder Infrastrukturausfällen.</p>',
        '<p>(2) Dauert ein Ereignis mehr als 60 aufeinanderfolgende Tage an, kann jede Partei die LB ohne Haftung kündigen; der Auftraggeber vergütet bereits erbrachte Leistungen.</p>',

        '<h3>§ 10 &nbsp;Abwerbeverbot</h3>',
        '<p>Während der Laufzeit eines aktiven Auftrags und für 12 Monate danach wirbt keine Partei Mitarbeiter oder Schlüssel-Subunternehmer der anderen Partei ohne vorherige schriftliche Zustimmung aktiv ab.</p>',

        '<h3>§ 11 &nbsp;Referenz und Portfolio</h3>',
        '<p>FZD darf den Auftraggeber als Referenzkunden nennen und die Art des Auftrags beschreiben, sofern der Auftraggeber nicht schriftlich widerspricht. Der Auftraggeber kann diese Erlaubnis jederzeit schriftlich widerrufen.</p>',

        '<h3>§ 12 &nbsp;Laufzeit und Kündigung</h3>',
        '<p>(1) Jeder Auftrag beginnt am in der LB angegebenen Datum und läuft bis zur Fertigstellung der Leistungen.</p>',
        '<p>(2) Außerordentliche Kündigung aus wichtigem Grund ist möglich bei wesentlicher Vertragsverletzung (Heilungsfrist 14 Tage) oder Insolvenz der anderen Partei.</p>',
        '<p>(3) T&amp;M-Aufträge ohne festes Enddatum können mit 30 Tagen Frist zum Monatsende ordentlich gekündigt werden.</p>',
        '<p>(4) Nach Kündigung gilt: Vergütung für erbrachte Leistungen, Rückgabe vertraulicher Informationen, Lizenzen bedingt durch vollständigen Zahlungseingang.</p>',

        '<h3>§ 13 &nbsp;Änderungen dieser AGB</h3>',
        '<p>(1) FZD behält sich das Recht vor, diese AGB zu ändern. Änderungen werden mindestens 30 Tage vor Wirksamwerden mitgeteilt.</p>',
        '<p>(2) Änderungen gelten als genehmigt, wenn der Auftraggeber nicht innerhalb von 30 Tagen schriftlich widerspricht und die Dienstleistungen weiterhin in Anspruch nimmt.</p>',

        '<h3>§ 14 &nbsp;Anwendbares Recht und Gerichtsstand</h3>',
        '<p>(1) Diese AGB unterliegen ausschließlich dem Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).</p>',
        '<p>(2) Ausschließlicher Gerichtsstand ist Heidelberg, sofern der Auftraggeber Kaufmann, eine juristische Person des öffentlichen Rechts oder ein öffentlich-rechtliches Sondervermögen ist.</p>',

        '<h3>§ 15 &nbsp;Schlussbestimmungen</h3>',
        '<p>(1) <strong>Salvatorische Klausel:</strong> Unwirksame Bestimmungen berühren die Wirksamkeit der übrigen AGB nicht.</p>',
        '<p>(2) <strong>Schriftformerfordernis:</strong> Änderungen bedürfen der Schriftform. Elektronische Textform (E-Mail, PDF) genügt.</p>',
        '<p>(3) <strong>Gesamtheit der Vereinbarungen:</strong> Diese AGB bilden zusammen mit der LB die vollständige Vereinbarung und ersetzen alle vorherigen Absprachen.</p>',

        '<div class="fzd-pm-doc-footer">© 2026 FZD Global GmbH — Alle Rechte vorbehalten.</div>'
      ].join('')
    }
  };

  function getLang() {
    return (typeof window.FZD_getLang === 'function') ? window.FZD_getLang() : 'en';
  }

  function buildModal() {
    var overlay = document.createElement('div');
    overlay.id = 'fzd-terms-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Terms and Conditions');
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(7,9,15,0.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:9999;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML =
      '<div id="fzd-terms-panel" style="background:#191c1e;border:1px solid rgba(255,255,255,0.12);border-radius:4px;max-width:720px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 4px 12px rgba(0,0,0,0.6),0 24px 64px rgba(0,0,0,0.5),0 0 0 1px rgba(0,212,255,0.06);">' +
        '<div id="fzd-terms-header" style="padding:24px 28px 20px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-shrink:0;">' +
          '<div>' +
            '<div class="fzd-pm-eyebrow" id="fzd-tm-eyebrow"></div>' +
            '<div class="fzd-pm-title"   id="fzd-tm-title"></div>' +
            '<div class="fzd-pm-date"    id="fzd-tm-date"></div>' +
          '</div>' +
          '<button id="fzd-terms-close" style="background:none;border:1px solid rgba(255,255,255,0.08);border-radius:4px;color:#859398;cursor:pointer;padding:5px 10px;font-size:18px;line-height:1;flex-shrink:0;transition:color .15s,border-color .15s;" aria-label="Close">×</button>' +
        '</div>' +
        '<div id="fzd-terms-body" style="padding:28px;overflow-y:auto;flex:1;overscroll-behavior:contain;"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    // Reuse the same body styles as privacy modal
    var body = overlay.querySelector('#fzd-terms-body');
    body.className = '';
    body.id = 'fzd-terms-body';
    // Apply same styles via the existing #fzd-privacy-body rules by sharing class
    overlay.querySelector('#fzd-terms-body').setAttribute('id', 'fzd-terms-body');

    var closeBtn = document.getElementById('fzd-terms-close');
    closeBtn.addEventListener('mouseenter', function() { this.style.color='#e0e3e5'; this.style.borderColor='rgba(255,255,255,0.24)'; });
    closeBtn.addEventListener('mouseleave', function() { this.style.color='#859398'; this.style.borderColor='rgba(255,255,255,0.08)'; });
    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });
    window.addEventListener('fzd:langchange', function(e) {
      if (overlay.classList.contains('is-open')) updateContent(e.detail.lang);
    });
  }

  function updateContent(lang) {
    var c = TERMS[lang] || TERMS.en;
    document.getElementById('fzd-tm-eyebrow').textContent = c.eyebrow;
    document.getElementById('fzd-tm-title').textContent   = c.title;
    document.getElementById('fzd-tm-date').textContent    = c.date;
    var body = document.getElementById('fzd-terms-body');
    body.innerHTML = c.body;
    // Apply same visual styles as privacy body
    body.style.cssText = 'padding:28px;overflow-y:auto;flex:1;overscroll-behavior:contain;';
  }

  function openModal() {
    updateContent(getLang());
    var overlay = document.getElementById('fzd-terms-overlay');
    overlay.style.display = 'flex';
    overlay.style.animation = 'fzd-pm-fade 0.2s ease';
    var panel = document.getElementById('fzd-terms-panel');
    panel.style.animation = 'fzd-pm-slide 0.25s ease';
    document.body.style.overflow = 'hidden';
    document.getElementById('fzd-terms-close').focus();
  }

  function closeModal() {
    var overlay = document.getElementById('fzd-terms-overlay');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.FZD_openTerms = function(e) {
    if (e) { e.preventDefault(); }
    openModal();
  };

  document.addEventListener('DOMContentLoaded', buildModal);
}());
