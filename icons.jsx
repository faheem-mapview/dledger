/* Daily Ledger — inline SVG icon set (lucide-style, stroke 1.8) */
(function () {
  const P = {
    home:     ['M3 10.5 12 3l9 7.5', 'M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5', 'M9.5 21v-6h5v6'],
    ledger:   ['M4 4.5A1.5 1.5 0 0 1 5.5 3H18a1 1 0 0 1 1 1v15.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19.5z', 'M8 7h7', 'M8 11h7', 'M8 15h4'],
    repeat:   ['m17 2 4 4-4 4', 'M3 11v-1a4 4 0 0 1 4-4h14', 'm7 22-4-4 4-4', 'M21 13v1a4 4 0 0 1-4 4H3'],
    chart:    ['M3 3v18h18', 'M8 17v-4', 'M13 17V8', 'M18 17v-7'],
    calendar: ['M8 2v4', 'M16 2v4', 'M3.5 6.5A1.5 1.5 0 0 1 5 5h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19z', 'M3.5 10h17'],
    settings: ['M4 21v-6', 'M4 11V3', 'M12 21v-8', 'M12 9V3', 'M20 21v-5', 'M20 13V3', 'M1 15h6', 'M9 9h6', 'M17 17h6'],
    search:   ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'm21 21-4.3-4.3'],
    bell:     ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.9 1.9 0 0 0 3.4 0'],
    plus:     ['M5 12h14', 'M12 5v14'],
    chevdown: ['m6 9 6 6 6-6'],
    chevright:['m9 18 6-6-6-6'],
    up:       ['m6 14 6-6 6 6'],
    down:     ['m6 10 6 6 6-6'],
    flame:    ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
    check:    ['M20 6 9 17l-5-5'],
    rupee:    ['M6 3h12', 'M6 8h12', 'm6 13 8.5 8', 'M6 13h3', 'M9 13c6.7 0 6.7-10 0-10'],
    food:     ['M3 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2', 'M7 2v20', 'M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7'],
    move:     ['M22 12h-4l-3 9L9 3l-3 9H2'],
    mind:     ['M12 3 10.1 8.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z'],
    note:     ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
    work:     ['M9 21V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v16', 'M3.5 8.5A1.5 1.5 0 0 1 5 7h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19z'],
    moon:     ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
    sun:      ['M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'M12 1v2', 'M12 21v2', 'M4.2 4.2l1.4 1.4', 'M18.4 18.4l1.4 1.4', 'M1 12h2', 'M21 12h2', 'M4.2 19.8l1.4-1.4', 'M18.4 5.6l1.4-1.4'],
    target:   ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
    clock:    ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
    sparkleSm:['M5 3v4', 'M3 5h4', 'M17 17v4', 'M15 19h4', 'M12 4 9.5 9.5 4 12l5.5 2.5L12 20l2.5-5.5L20 12l-5.5-2.5z'],
    filter:   ['M3 5h18', 'M6 12h12', 'M10 19h4'],
    download: ['M12 3v12', 'm7 11 5 5 5-5', 'M5 21h14'],
    x:        ['M18 6 6 18', 'm6 6 12 12'],
  };

  function Icon({ name, size = 20, stroke = 1.8, fill = 'none', style, ...rest }) {
    const ds = P[name] || [];
    return React.createElement('svg', {
      width: size, height: size, viewBox: '0 0 24 24', fill, stroke: 'currentColor',
      strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
      style: { display: 'block', flexShrink: 0, ...style }, ...rest,
    }, ds.map((d, i) => React.createElement('path', { key: i, d })));
  }

  // category meta for ledger entries
  window.KIND = {
    money: { icon: 'rupee', label: 'Money', color: '#C8442A', soft: '#F7E0D9' },
    food:  { icon: 'food',  label: 'Food',  color: '#D98324', soft: '#FBEBD3' },
    move:  { icon: 'move',  label: 'Move',  color: '#6E8B3D', soft: '#EAF0DC' },
    mind:  { icon: 'mind',  label: 'Mind',  color: '#A0522D', soft: '#F1E2D6' },
    work:  { icon: 'work',  label: 'Work',  color: '#8A6D3B', soft: '#F0E7D2' },
    note:  { icon: 'note',  label: 'Note',  color: '#7A6A57', soft: '#EFE7DA' },
  };

  window.Icon = Icon;
})();
