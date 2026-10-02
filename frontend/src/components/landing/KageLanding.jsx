import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   KageLanding — Loads the authored Kage temple HTML document as a full
   interactive landing page. After the iframe loads, CodeSentinel branding
   is injected via contentDocument (same-origin) to replace the Kage
   placeholder text. The scroll-driven camera animation works natively.
   ═══════════════════════════════════════════════════════════════════════════ */

const BRANDING_CSS = `
  /* Ensure the customized content looks right */
  .nav { z-index: 50; }
`;

export default function KageLanding() {
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const onLoad = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc?.body) return;

        // ── Replace brand ──
        const brandTx = doc.querySelector('.brand-tx');
        if (brandTx) {
          const b = brandTx.querySelector('b');
          const i = brandTx.querySelector('i');
          if (b) b.textContent = 'CODESENTINEL';
          if (i) i.textContent = 'AI CO-PILOT';
        }

        // ── Replace nav links ──
        const navLinks = doc.querySelectorAll('.nav-link');
        const navLabels = [
          { main: 'HOME', alt: 'ホーム', href: '#hero' },
          { main: 'ABOUT', alt: 'アバウト', href: '#gate' },
          { main: 'TOOLS', alt: 'ツール', href: '#pathways' },
          { main: 'WORKFLOW', alt: 'ワークフロー', href: '#rituals' },
          { main: 'PRICING', alt: 'プライシング', href: '#eternity' },
        ];
        navLinks.forEach((link, i) => {
          if (navLabels[i]) {
            const spans = link.querySelectorAll('span');
            if (spans[0]) spans[0].textContent = navLabels[i].main;
            if (spans[1]) spans[1].textContent = navLabels[i].alt;
          }
        });

        // ── Replace hero content ──
        const eyebrow = doc.querySelector('.hero-top .eyebrow');
        if (eyebrow) {
          // Keep the dot, replace the text node
          const textNodes = Array.from(eyebrow.childNodes).filter(n => n.nodeType === 3);
          if (textNodes.length) textNodes[textNodes.length - 1].textContent = ' AI-POWERED CODE INTELLIGENCE';
          // Also check for span text
          const spans = eyebrow.querySelectorAll('span:not(.dot)');
          spans.forEach(s => { if (s.textContent.includes('CHAPTER')) s.textContent = ' AI-POWERED CODE INTELLIGENCE'; });
        }

        // Replace h1 hero text
        const heroH1 = doc.querySelector('.hero h1');
        if (heroH1) {
          heroH1.innerHTML = `
            <span class="mask-line"><span>WHERE STILLNESS</span></span>
            <span class="mask-line"><span>REVEALS THE UNSEEN.</span></span>
          `;
        }

        // Replace hero subtitle
        const heroSub = doc.querySelector('.hero-sub');
        if (heroSub) {
          const p = heroSub.querySelector('p') || heroSub;
          p.textContent = 'CodeSentinel watches your codebase so you don\'t have to. Review PRs, generate docs, triage bugs, and scaffold tests — all from one dashboard.';
        }

        // ── Replace chapter chips ──
        const chips = doc.querySelectorAll('.chip');
        const chipData = [
          { num: 'I', title: 'PR REVIEW', desc: 'Line-level analysis' },
          { num: 'II', title: 'DOCS GEN', desc: 'Auto documentation' },
          { num: 'III', title: 'BUG TRIAGE', desc: 'Smart severity' },
          { num: 'IV', title: 'TEST SCAFFOLD', desc: 'Framework-aware' },
        ];
        chips.forEach((chip, i) => {
          if (chipData[i]) {
            const b = chip.querySelector('b');
            const p = chip.querySelector('p');
            if (b) b.textContent = chipData[i].title;
            if (p) p.textContent = chipData[i].desc;
          }
        });

        // ── Replace section heads ──
        const secHeads = doc.querySelectorAll('.sec-head .k');
        const secLabels = ['THE GATE — AI Review', 'PATHWAYS — Tools', 'RITUALS — Workflow', 'ETERNITY — Ship'];
        secHeads.forEach((k, i) => {
          if (secLabels[i]) {
            const b = k.querySelector('b');
            if (b) b.textContent = String(i + 1).padStart(2, '0');
            // Replace non-bold text
            const textNode = Array.from(k.childNodes).find(n => n.nodeType === 3 && n.textContent.includes('—'));
            if (textNode) textNode.textContent = ` — ${secLabels[i].split('— ')[1] || secLabels[i]}`;
          }
        });

        // ── Replace gate section content ──
        const gateH2 = doc.querySelector('#gate h2, .gate-grid h2');
        if (gateH2) {
          gateH2.textContent = 'AI That Reviews Like a Senior Engineer';
        }
        const gateLead = doc.querySelector('.gate-copy .lead');
        if (gateLead) {
          gateLead.textContent = 'Every pull request passes through a multi-provider AI chain — NVIDIA NIM, Gemini, and Groq — catching bugs, style issues, and security risks before they reach main.';
        }

        // ── Replace stats ──
        const stats = doc.querySelectorAll('.gate-stats div');
        const statData = [
          { val: '3', label: 'AI PROVIDERS' },
          { val: '4', label: 'CORE TOOLS' },
          { val: '<1s', label: 'AVG LATENCY' },
          { val: '99.9%', label: 'UPTIME SLA' },
        ];
        stats.forEach((stat, i) => {
          if (statData[i]) {
            const b = stat.querySelector('b');
            const span = stat.querySelector('span');
            if (b) b.textContent = statData[i].val;
            if (span) span.textContent = statData[i].label;
          }
        });

        // ── Replace card labels ──
        const cardLabs = doc.querySelectorAll('.card-lab b');
        const cardNames = ['AI Review', 'Docs Engine', 'Bug Sentinel'];
        cardLabs.forEach((b, i) => {
          if (cardNames[i]) b.textContent = cardNames[i];
        });

        // ── Replace card Japanese labels ──
        const cardJps = doc.querySelectorAll('.card-lab .jp');
        const cardJpNames = ['審査', '文書', '監視'];
        cardJps.forEach((jp, i) => {
          if (cardJpNames[i]) jp.textContent = cardJpNames[i];
        });

        // ── Replace card meta descriptions ──
        const cardMetas = doc.querySelectorAll('.card-meta');
        const metaDescs = ['PR Analysis', 'Auto documentation', 'Smart triage'];
        cardMetas.forEach((meta, i) => {
          if (metaDescs[i]) {
            const spans = meta.querySelectorAll('span');
            if (spans[0]) spans[0].textContent = metaDescs[i];
          }
        });

        // ── Replace lessons section ──
        const curHead = doc.querySelector('.cur-head');
        if (curHead) {
          const h2 = curHead.querySelector('h2');
          const p = curHead.querySelector('p');
          if (h2) h2.textContent = 'Five tools. One dashboard. Zero noise.';
          if (p) p.textContent = 'Each tool is purpose-built for a single job. Connect your repo, push a commit, and let CodeSentinel handle the rest — review, document, triage, test, and ship.';
        }

        const lessonItems = doc.querySelectorAll('.les');
        const lessonData = [
          { title: 'PR Review', jp: '審査', desc: 'Line-level AI analysis on every pull request — catching bugs, style issues, and security risks.', time: 'Instant' },
          { title: 'Docs Generation', jp: '文書', desc: 'Auto-generate docstrings, READMEs, and architecture diagrams from your codebase.', time: 'On push' },
          { title: 'Bug Triage', jp: '分類', desc: 'Smart severity scoring and root-cause analysis powered by multi-provider AI.', time: 'Real-time' },
          { title: 'Test Scaffold', jp: '試験', desc: 'Framework-aware test generation — unit, integration, and edge cases in one click.', time: 'Per commit' },
          { title: 'AI Fallback Chain', jp: '連鎖', desc: 'NVIDIA NIM → Gemini → Groq — triple-redundant AI ensures zero downtime on every request.', time: 'Always on' },
        ];
        lessonItems.forEach((les, i) => {
          if (lessonData[i]) {
            const h3 = les.querySelector('h3');
            if (h3) h3.innerHTML = `${lessonData[i].title}<em class="jp">${lessonData[i].jp}</em>`;
            const p = les.querySelector('p');
            if (p) p.textContent = lessonData[i].desc;
            const t = les.querySelector('.t');
            if (t) t.textContent = lessonData[i].time;
          }
        });

        // ── Replace closing section ──
        const finH2 = doc.querySelector('.fin h2');
        if (finH2) {
          finH2.innerHTML = 'SHIP WITH<br>CONFIDENCE';
        }
        const finP = doc.querySelector('.fin p');
        if (finP) {
          finP.textContent = 'Every commit reviewed, every doc generated, every bug triaged — CodeSentinel stands guard so your team can move fast without breaking things.';
        }

        // ── Replace footer content with project details ──
        const footBrand = doc.querySelector('.foot-brand p');
        if (footBrand) {
          footBrand.textContent = 'CodeSentinel — AI-powered code review and DevOps co-pilot. Built with NVIDIA NIM, Gemini, and Groq.';
        }

        // Replace footer grid columns with project-relevant sections
        const footGrid = doc.querySelector('.foot-grid');
        if (footGrid) {
          // Remove old columns (keep foot-brand)
          const oldCols = footGrid.querySelectorAll(':scope > div:not(.foot-brand)');
          oldCols.forEach(col => col.remove());

          const colsData = [
            { title: 'Features', items: [
              { label: 'PR Review', href: '#gate' },
              { label: 'Docs Generation', href: '#pathways' },
              { label: 'Bug Triage', href: '#lessons' },
              { label: 'Test Scaffold', href: '#eternity' },
            ]},
            { title: 'Resources', items: [
              { label: 'Documentation', href: '#gate' },
              { label: 'API Reference', href: '#pathways' },
              { label: 'Changelog', href: '#lessons' },
              { label: 'Status Page', href: '#eternity' },
            ]},
            { title: 'Connect', items: [
              { label: 'GitHub', href: 'https://github.com' },
              { label: 'Discord', href: '#top' },
              { label: 'Twitter / X', href: '#top' },
            ]},
          ];

          colsData.forEach(col => {
            const div = doc.createElement('div');
            const h4 = doc.createElement('h4');
            h4.textContent = col.title;
            const ul = doc.createElement('ul');
            col.items.forEach(item => {
              const li = doc.createElement('li');
              const a = doc.createElement('a');
              a.href = item.href;
              a.textContent = item.label;
              a.setAttribute('data-cursor', '');
              li.appendChild(a);
              ul.appendChild(li);
            });
            div.appendChild(h4);
            div.appendChild(ul);
            footGrid.appendChild(div);
          });
        }

        // Replace footer base text
        const footBase = doc.querySelector('.foot-base');
        if (footBase) {
          const spans = footBase.querySelectorAll('span');
          if (spans[0]) spans[0].textContent = '© 2026 CodeSentinel — AI Co-Pilot';
          if (spans[1]) spans[1].textContent = 'コードを守る、未来を創る';
        }

        // ── Replace CTA text ──
        const ctaSpan = doc.querySelector('.cta span');
        if (ctaSpan) ctaSpan.textContent = 'GET STARTED';

        // ── Make CTA link to dashboard ──
        const cta = doc.querySelector('.cta');
        if (cta) {
          cta.addEventListener('click', (e) => {
            e.preventDefault();
            window.parent.location.href = '/dashboard';
          });
        }

        // ── Inject custom style ──
        const style = doc.createElement('style');
        style.textContent = BRANDING_CSS;
        doc.head.appendChild(style);

      } catch (err) {
        console.warn('[KageLanding] Content customization failed:', err);
      } finally {
        setReady(true);
      }
    };

    const checkLoad = () => {
      const doc = frame.contentDocument;
      if (doc && doc.readyState === 'complete' && doc.location?.href !== 'about:blank') {
        onLoad();
      } else {
        frame.addEventListener('load', onLoad);
      }
    };
    checkLoad();
    
    // Foolproof fallback: always reveal after 1.5s
    const fallbackTimer = setTimeout(() => setReady(true), 1500);

    return () => {
      frame.removeEventListener('load', onLoad);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <iframe
        ref={frameRef}
        title="CodeSentinel — AI Code Review"
        src="/landing-pages/kage.html"
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        loading="eager"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
          background: '#05070a',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />
    </div>
  );
}
