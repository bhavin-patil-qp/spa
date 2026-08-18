import { useState, useCallback, useMemo } from 'react';

// ── Conversion math ────────────────────────────────────────
function hexToRgb(hex: string): [number,number,number] | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): [number,number,number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number,number,number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)];
}

function contrastRatio(r: number, g: number, b: number): { white: number; black: number } {
  const lum = (c: number) => { const v = c/255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  const L = 0.2126*lum(r) + 0.7152*lum(g) + 0.0722*lum(b);
  const white = (1.05) / (L + 0.05);
  const black = (L + 0.05) / (0.05);
  return { white: Math.round(white*10)/10, black: Math.round(black*10)/10 };
}

function wcag(ratio: number) {
  if (ratio >= 7)   return { label: 'AAA', color: '#16a34a' };
  if (ratio >= 4.5) return { label: 'AA',  color: '#65a30d' };
  if (ratio >= 3)   return { label: 'AA Large', color: '#d97706' };
  return { label: 'Fail', color: '#dc2626' };
}

function generatePalette(h: number, s: number, l: number) {
  return {
    complementary: [hslToRgb((h+180)%360, s, l)],
    triadic: [hslToRgb((h+120)%360, s, l), hslToRgb((h+240)%360, s, l)],
    analogous: [hslToRgb((h+30)%360, s, l), hslToRgb((h-30+360)%360, s, l)],
    shades: [10,20,30,40,50,60,70,80,90].map(sl => hslToRgb(h, s, sl)),
  };
}

// ── Swatch ─────────────────────────────────────────────────
const Swatch = ({ rgb, label }: { rgb: [number,number,number]; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const hex = rgbToHex(...rgb);
  const copy = () => {
    navigator.clipboard.writeText(hex).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <div className="ct-swatch" onClick={copy} title={`Click to copy ${hex}`}>
      <div className="ct-swatch-color" style={{ background: hex }} />
      <div className="ct-swatch-info">
        <span className="ct-swatch-hex">{copied ? '✓ Copied' : hex}</span>
        {label && <span className="ct-swatch-label">{label}</span>}
      </div>
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────
const ColorTools = () => {
  const [hex, setHex]   = useState('#5b5bd6');
  const [hsl, setHsl]   = useState<[number,number,number]>([240,62,59]);
  const [rgb, setRgb]   = useState<[number,number,number]>([91,91,214]);

  const syncFromHex = useCallback((h: string) => {
    const clean = h.startsWith('#') ? h : '#' + h;
    setHex(clean);
    const r = hexToRgb(clean);
    if (r) { setRgb(r); setHsl(rgbToHsl(...r)); }
  }, []);

  const syncFromRgb = useCallback((r: number, g: number, b: number) => {
    setRgb([r,g,b]);
    setHex(rgbToHex(r,g,b));
    setHsl(rgbToHsl(r,g,b));
  }, []);

  const syncFromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl([h,s,l]);
    const r = hslToRgb(h,s,l);
    setRgb(r);
    setHex(rgbToHex(...r));
  }, []);

  const contrast   = useMemo(() => contrastRatio(...rgb), [rgb]);
  const palette    = useMemo(() => generatePalette(...hsl), [hsl]);
  const cssString  = useMemo(() =>
    `--color-base: ${hex};\n--color-base-rgb: ${rgb.join(', ')};\n--color-base-hsl: ${hsl[0]}deg ${hsl[1]}% ${hsl[2]}%;`,
  [hex, rgb, hsl]);

  const [cssCopied, setCssCopied] = useState(false);
  const copyCss = () => {
    navigator.clipboard.writeText(cssString).then(() => { setCssCopied(true); setTimeout(() => setCssCopied(false), 1800); });
  };

  const hexIsValid = !!hexToRgb(hex);

  return (
    <div className="ct-root">
      <div className="ct-left">
        {/* Big preview */}
        <div className="ct-preview" style={{ background: hex }}>
          <div className="ct-preview-text" style={{ color: contrast.white > contrast.black ? '#fff' : '#000' }}>
            <span className="ct-preview-hex">{hex.toUpperCase()}</span>
            <span className="ct-preview-sub">rgb({rgb.join(', ')})</span>
          </div>
        </div>

        {/* Native picker */}
        <div className="ct-picker-row">
          <input
            type="color"
            className="ct-native-picker"
            value={hexIsValid ? hex : '#5b5bd6'}
            onChange={e => syncFromHex(e.target.value)}
          />
          <input
            className="ct-hex-input"
            value={hex}
            onChange={e => syncFromHex(e.target.value)}
            placeholder="#5b5bd6"
            spellCheck={false}
            maxLength={7}
          />
        </div>

        {/* RGB sliders */}
        <div className="ct-sliders">
          {(['R','G','B'] as const).map((ch, i) => (
            <div key={ch} className="ct-slider-row">
              <span className="ct-slider-label" style={{ color: ['#ef4444','#16a34a','#2563eb'][i] }}>{ch}</span>
              <input
                type="range" min={0} max={255}
                className="ct-slider"
                style={{ '--track': ['#ef4444','#16a34a','#2563eb'][i] } as React.CSSProperties}
                value={rgb[i]}
                onChange={e => {
                  const next = [...rgb] as [number,number,number];
                  next[i] = +e.target.value;
                  syncFromRgb(...next);
                }}
              />
              <input
                type="number" min={0} max={255}
                className="ct-num-input"
                value={rgb[i]}
                onChange={e => {
                  const next = [...rgb] as [number,number,number];
                  next[i] = Math.max(0, Math.min(255, +e.target.value));
                  syncFromRgb(...next);
                }}
              />
            </div>
          ))}
        </div>

        {/* HSL */}
        <div className="ct-sliders">
          {(['H','S','L'] as const).map((ch, i) => {
            const max = i === 0 ? 360 : 100;
            return (
              <div key={ch} className="ct-slider-row">
                <span className="ct-slider-label">{ch}</span>
                <input
                  type="range" min={0} max={max}
                  className="ct-slider"
                  value={hsl[i]}
                  onChange={e => {
                    const next = [...hsl] as [number,number,number];
                    next[i] = +e.target.value;
                    syncFromHsl(...next);
                  }}
                />
                <input
                  type="number" min={0} max={max}
                  className="ct-num-input"
                  value={hsl[i]}
                  onChange={e => {
                    const next = [...hsl] as [number,number,number];
                    next[i] = Math.max(0, Math.min(max, +e.target.value));
                    syncFromHsl(...next);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="ct-right">
        {/* Formats */}
        <div className="ct-section">
          <div className="ct-section-title">Formats</div>
          <div className="ct-formats">
            {[
              { label: 'HEX',  value: hex.toUpperCase() },
              { label: 'RGB',  value: `rgb(${rgb.join(', ')})` },
              { label: 'RGBA', value: `rgba(${rgb.join(', ')}, 1)` },
              { label: 'HSL',  value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
            ].map(f => (
              <FormatRow key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>

        {/* Contrast / WCAG */}
        <div className="ct-section">
          <div className="ct-section-title">Accessibility (WCAG)</div>
          <div className="ct-wcag-row">
            <div className="ct-wcag-card" style={{ background: hex }}>
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>Aa</span>
              <span style={{ color: '#fff', fontSize: 12 }}>on white</span>
              <span className="ct-wcag-badge" style={{ background: wcag(contrast.white).color }}>
                {wcag(contrast.white).label} {contrast.white}:1
              </span>
            </div>
            <div className="ct-wcag-card" style={{ background: '#000' }}>
              <span style={{ color: hex, fontSize: 22, fontWeight: 700 }}>Aa</span>
              <span style={{ color: '#9ca3af', fontSize: 12 }}>on black</span>
              <span className="ct-wcag-badge" style={{ background: wcag(contrast.black).color }}>
                {wcag(contrast.black).label} {contrast.black}:1
              </span>
            </div>
          </div>
        </div>

        {/* Palette */}
        <div className="ct-section">
          <div className="ct-section-title">Palette</div>
          <div className="ct-palette-group">
            <div className="ct-palette-label">Shades</div>
            <div className="ct-swatches">
              {palette.shades.map((c,i) => <Swatch key={i} rgb={c} />)}
            </div>
          </div>
          <div className="ct-palette-group">
            <div className="ct-palette-label">Complementary</div>
            <div className="ct-swatches">
              <Swatch rgb={rgb} label="Base" />
              {palette.complementary.map((c,i) => <Swatch key={i} rgb={c} label="Complement" />)}
            </div>
          </div>
          <div className="ct-palette-group">
            <div className="ct-palette-label">Triadic</div>
            <div className="ct-swatches">
              <Swatch rgb={rgb} label="Base" />
              {palette.triadic.map((c,i) => <Swatch key={i} rgb={c} />)}
            </div>
          </div>
          <div className="ct-palette-group">
            <div className="ct-palette-label">Analogous</div>
            <div className="ct-swatches">
              {palette.analogous.map((c,i) => <Swatch key={i} rgb={c} />)}
              <Swatch rgb={rgb} label="Base" />
            </div>
          </div>
        </div>

        {/* CSS variables */}
        <div className="ct-section">
          <div className="ct-section-title" style={{ display:'flex', justifyContent:'space-between' }}>
            CSS Variables
            <button className="ws-btn ws-btn-ghost ws-btn-sm" onClick={copyCss}>
              {cssCopied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="ct-css-output">{cssString}</pre>
        </div>
      </div>
    </div>
  );
};

const FormatRow = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  return (
    <div className="ct-format-row">
      <span className="ct-format-label">{label}</span>
      <span className="ct-format-value">{value}</span>
      <button className="ct-format-copy" onClick={copy}>{copied ? '✓' : 'Copy'}</button>
    </div>
  );
};

export default ColorTools;
