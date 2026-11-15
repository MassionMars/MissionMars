/* MISSION MARS — holographic UI kit: icon set, emoji→hologram, faces, story panel, base conditions */
(function () {
  "use strict";
  var P = {
    rock: "<path d=\"M3.5 18.5 5 11l5-5.5 6 1.5 4 6-1.5 5.5z\"/><path d=\"M10 5.5 11.5 12l7 6.5M5 11l6.5 1\" fill=\"none\"/>",
    radiation: "<circle cx=\"12\" cy=\"12\" r=\"1.8\"/><path d=\"M12 10.2 8 3.4a9.4 9.4 0 0 1 8 0z\"/><path d=\"M13.6 13 17.4 20a9.4 9.4 0 0 1-7-4.5z\" transform=\"rotate(0)\"/><path d=\"M10.4 13 6.6 20a9.4 9.4 0 0 1-3-6.6z\" transform=\"translate(0 0)\"/>",
    air: "<path d=\"M3 9h10a2.6 2.6 0 1 0-2.6-2.6M3 14h14a2.6 2.6 0 1 1-2.6 2.6M3 19h7\" fill=\"none\"/>",
    recycle: "<path d=\"M7 7.5 10 3l3 4.5M10 3v8M17 16.5 14 21l-3-4.5M14 21v-8M4.5 15 3 11l4-1M19.5 9 21 13l-4 1\" fill=\"none\"/>",
    fire: "<path d=\"M12 21c-4 0-6.5-2.7-6.5-6 0-3.6 3-5.4 3.5-9 2.4 1.4 4 3.4 4 5.6.8-.6 1.4-1.6 1.5-2.8 1.6 1.7 2.5 3.4 2.5 5.2 0 3.7-2.5 7-5 7z\"/>",
    ufo: "<ellipse cx=\"12\" cy=\"14\" rx=\"9\" ry=\"3.6\"/><path d=\"M7.2 12.5C7.6 8 9.4 6 12 6s4.4 2 4.8 6.5\" fill=\"none\"/><path d=\"M8 18l-1.5 2.5M12 18.4V21M16 18l1.5 2.5\" fill=\"none\"/>",
    foot: "<path d=\"M8 20c-1.6 0-2.4-1.4-2-3.2.5-2.3 1.4-3.6 1.4-6.2C7.4 8 8.6 5.5 10.6 5.5S13.6 8 13 11c-.4 2.2.5 3.6.1 5.6-.3 2-2.6 3.4-5.1 3.4z\"/><circle cx=\"15.5\" cy=\"5.5\" r=\"1.1\"/><circle cx=\"18\" cy=\"8\" r=\"1\"/><circle cx=\"19.2\" cy=\"11\" r=\".9\"/>",
    wave: "<path d=\"M2.5 9c2.2-2 4.2-2 6.3 0s4.2 2 6.3 0 4-2 6.4 0M2.5 14c2.2-2 4.2-2 6.3 0s4.2 2 6.3 0 4-2 6.4 0M2.5 19c2.2-2 4.2-2 6.3 0s4.2 2 6.3 0 4-2 6.4 0\" fill=\"none\"/>",
    grad: "<path d=\"M2 9 12 4l10 5-10 5z\"/><path d=\"M6 11.5V16c1.6 1.6 3.6 2.4 6 2.4s4.4-.8 6-2.4v-4.5M22 9v6\" fill=\"none\"/>",
    planet: "<circle cx=\"12\" cy=\"12\" r=\"5.6\"/><ellipse cx=\"12\" cy=\"12\" rx=\"10\" ry=\"3.2\" transform=\"rotate(-22 12 12)\" fill=\"none\"/>",
    comet: "<circle cx=\"16.5\" cy=\"7.5\" r=\"3.6\"/><path d=\"M13.8 10.2 3 21M14 7 4 10M17 11l-3 9\" fill=\"none\"/>",
    telescope: "<path d=\"M3.5 12.2 15 6l2.2 4-11.5 6.2z\"/><path d=\"M17 8.4 20.6 6.5M10 14.4 7 21M10 14.4l3 6.6\" fill=\"none\"/>",
    plate: "<circle cx=\"12\" cy=\"12\" r=\"8.6\"/><circle cx=\"12\" cy=\"12\" r=\"4.8\" fill=\"none\"/><path d=\"M2.5 3v8M21.5 3c-1.7 1.4-2.2 4-1.8 7\" fill=\"none\"/>",
    build: "<path d=\"M3 21h18M5 21V10l7-6 7 6v11\" fill=\"none\"/><path d=\"M9.5 21v-6h5v6\"/>",
    extinguisher: "<rect x=\"7\" y=\"8\" width=\"8\" height=\"13\" rx=\"2.4\"/><path d=\"M11 8V5.4h4.5l3 2.4M9 5.4h2\" fill=\"none\"/>",
    worm: "<path d=\"M4 17c0-3.6 3-3.6 4.4-1.2C9.8 18.6 12 18.4 12.4 15.4S14 10 17 11c2.6.9 3 3.4 3 6\" fill=\"none\"/><circle cx=\"20\" cy=\"9\" r=\"1.6\"/>",
    fog: "<path d=\"M4 8h12M2 12h17M5 16h14M8 20h9\" fill=\"none\"/>",
    volcano: "<path d=\"M3 20 9 9h6l6 11z\"/><path d=\"M9.5 9 8 5M12 7.4V3M14.5 9 16 5\" fill=\"none\"/>",
    desert: "<path d=\"M2.5 18c3-4 5.5-4 8.5 0s5.6 4 8.5 0\" fill=\"none\"/><circle cx=\"17\" cy=\"7\" r=\"3\"/><path d=\"M2.5 21.5h19\" fill=\"none\"/>",
    chart: "<path d=\"M3 20h18M3 20V4\" fill=\"none\"/><path d=\"M5.5 16 10 11l3.2 3L19 7.5M15.5 7.5H19V11\" fill=\"none\"/>",
    camera: "<path d=\"M3.5 8.5h3.6L9 5.5h6l1.9 3H20.5v11h-17z\"/><circle cx=\"12\" cy=\"13.6\" r=\"3.6\" fill=\"none\"/>",
    parachute: "<path d=\"M3 11a9 8 0 0 1 18 0c-1.5-1.6-3.6-1.6-4.6 0-1-1.6-3.4-1.6-4.4 0-1-1.6-3.4-1.6-4.4 0C6.6 9.4 4.5 9.4 3 11z\"/><path d=\"M3 11 11 20M21 11 13 20M12 11v9\" fill=\"none\"/><rect x=\"10\" y=\"19.6\" width=\"4\" height=\"2.4\" rx=\".6\"/>",
    robot: "<rect x=\"5\" y=\"8\" width=\"14\" height=\"11\" rx=\"3\"/><path d=\"M12 8V4.4M9.5 4.4h5\" fill=\"none\"/><circle cx=\"9.4\" cy=\"13\" r=\"1.5\"/><circle cx=\"14.6\" cy=\"13\" r=\"1.5\"/><path d=\"M9.5 16.4h5M2.8 12v3M21.2 12v3\" fill=\"none\"/>",
    ice: "<path d=\"M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z\"/><path d=\"M4 7.4l8 4.6 8-4.6M12 12v9\" fill=\"none\"/>",
    syringe: "<path d=\"M14.5 4.5l5 5M12 7l5 5-6.6 6.6H6.3v-4.1z\"/><path d=\"M3.5 20.5 6.6 17.4M16 3.5l4.5 4.5\" fill=\"none\"/>",
    atom: "<ellipse cx=\"12\" cy=\"12\" rx=\"9.4\" ry=\"3.6\"/><ellipse cx=\"12\" cy=\"12\" rx=\"9.4\" ry=\"3.6\" transform=\"rotate(60 12 12)\"/><ellipse cx=\"12\" cy=\"12\" rx=\"9.4\" ry=\"3.6\" transform=\"rotate(120 12 12)\"/><circle cx=\"12\" cy=\"12\" r=\"1.6\" fill=\"currentColor\"/>",
    broom: "<path d=\"M19 3 11.5 12.5\" fill=\"none\"/><path d=\"M11.5 12.5 7 11 3.5 20.5l9.4-1.4z\"/>",
    phone: "<rect x=\"7\" y=\"2.8\" width=\"10\" height=\"18.4\" rx=\"2.4\"/><path d=\"M10.6 18.6h2.8\" fill=\"none\"/>",
    laptop: "<rect x=\"4.5\" y=\"5.4\" width=\"15\" height=\"10.4\" rx=\"1.6\"/><path d=\"M2.5 19h19\" fill=\"none\"/>",
    passport: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2.2\"/><circle cx=\"12\" cy=\"10.4\" r=\"3.4\" fill=\"none\"/><path d=\"M8.6 17h6.8M12 7v6.8M8.6 10.4h6.8\" fill=\"none\"/>",
    moon: "<path d=\"M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z\"/>",
    thermo: "<path d=\"M10 14.2V5a2 2 0 0 1 4 0v9.2a4 4 0 1 1-4 0z\"/><path d=\"M12 9v7\" fill=\"none\"/>",
    person: "<circle cx=\"12\" cy=\"7.4\" r=\"3.4\"/><path d=\"M5 20.5c.4-4.4 3-6.6 7-6.6s6.6 2.2 7 6.6z\"/>",
    life: '<path d="M12 20.4C5.2 15.6 3 11.6 3 8.7A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 9 1.8c0 2.9-2.2 6.9-9 11.7z"/><path d="M6.4 11.4h3l1.5-2.8 2.1 5.4 1.4-2.6h2.2" fill="none"/>',
    energy: '<path d="M13.4 2.5 5 13.6h5.6L9.6 21.5 19 9.9h-5.7z"/>',
    shield: '<path d="M12 2.6 19.8 5.6v6c0 4.9-3.3 8.2-7.8 9.8-4.5-1.6-7.8-4.9-7.8-9.8v-6z"/><path d="M12 8v7M8.5 11.5h7" fill="none"/>',
    science: '<path d="M9.2 3h5.6M10.2 3v6L4.6 18.8a1.7 1.7 0 0 0 1.5 2.5h11.8a1.7 1.7 0 0 0 1.5-2.5L13.8 9V3" fill="none"/><path d="M7.3 15h9.4l2.3 4.3a1.2 1.2 0 0 1-1 1.7H6a1.2 1.2 0 0 1-1-1.7z"/><circle cx="10" cy="17.6" r=".9" fill="currentColor" stroke="none"/><circle cx="14" cy="16.6" r=".7" fill="currentColor" stroke="none"/>',
    greenhouse: '<path d="M12 21v-9" fill="none"/><path d="M12 13c0-3.8-2.8-6-7-6 0 3.9 2.8 6 7 6z"/><path d="M12 15.5c0-3.4 2.4-5.4 6.6-5.4 0 3.5-2.4 5.4-6.6 5.4z"/><path d="M6.5 21h11" fill="none"/>',
    medbay: '<rect x="3" y="6.5" width="18" height="13.5" rx="2.6"/><path d="M9 6.5V5a1.6 1.6 0 0 1 1.6-1.6h2.8A1.6 1.6 0 0 1 15 5v1.5" fill="none"/><path d="M12 10v6.4M8.8 13.2h6.4" fill="none"/>',
    lab: '<ellipse cx="12" cy="12" rx="9.2" ry="3.7"/><ellipse cx="12" cy="12" rx="9.2" ry="3.7" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.2" ry="3.7" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.6" fill="currentColor" fill-opacity=".8"/>',
    airlock: '<path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" fill="none"/><path d="M3.5 21h17" fill="none"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16z" stroke="none"/><circle cx="12" cy="9" r="2.6"/><path d="M14.8 14.5h.01" stroke-width="2.4"/>',
    rover: '<path d="M3.5 12.5h13.4l2.8 3.5H3.5z"/><circle cx="7" cy="18" r="2.2"/><circle cx="15.8" cy="18" r="2.2"/><path d="M6 12.5V9h5v3.5M14.2 12.5V8l3.4-2.4" fill="none"/>',
    gift: '<rect x="3.5" y="10" width="17" height="10.5" rx="1.6"/><rect x="2.5" y="6.8" width="19" height="3.4" rx="1.2"/><path d="M12 6.8v13.7" fill="none"/><path d="M12 6.8C9.8 3 6.2 3.6 7.2 5.7c.6 1.1 4.8 1.1 4.8 1.1zM12 6.8c2.2-3.8 5.8-3.2 4.8-1.1-.6 1.1-4.8 1.1-4.8 1.1z" fill="none"/>',
    lock: '<rect x="5.5" y="10.5" width="13" height="10" rx="2.2"/><path d="M8.3 10.5V8a3.7 3.7 0 0 1 7.4 0v2.5" fill="none"/><path d="M12 14.4v2.4" stroke-width="2"/>',
    check: '<path d="M4.5 12.6l5 5 10-11" fill="none" stroke-width="2.2"/>',
    cross: '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke-width="2.2"/>',
    star: '<path d="M12 2.8l2.7 5.7 6.2.8-4.6 4.2 1.2 6.1L12 16.6 6.5 19.6l1.2-6.1L3.1 9.3l6.2-.8z"/>',
    storm: '<path d="M3 8.5h11a3 3 0 1 0-3-3" fill="none"/><path d="M3 13h15.5a3 3 0 1 1-3 3" fill="none"/><path d="M3 17.5h7" fill="none"/><circle cx="19" cy="9" r=".9" fill="currentColor"/><circle cx="21" cy="12" r=".6" fill="currentColor"/>',
    flare: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" fill="none"/>',
    dish: '<path d="M5.5 13.5a8 8 0 0 0 11-11z"/><path d="M10.4 9.2 14 12.8M9 19.5h7M12.6 14.2 11 19.5" fill="none"/><path d="M17.5 8a4 4 0 0 1 2.5 2.5M18.2 4.6A7.6 7.6 0 0 1 22 8.6" fill="none"/>',
    cold: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2 3.8 16.8" fill="none"/><path d="M9.5 4l2.5 2.4L14.5 4M9.5 20 12 17.6 14.5 20M3.6 10.4l3.3-.6-.9-3.2M20.4 13.6l-3.3.6.9 3.2M3.6 13.6l3.3.6-.9 3.2M20.4 10.4l-3.3-.6.9-3.2" fill="none" stroke-width="1.3"/>',
    sun: '<circle cx="12" cy="13" r="4.4"/><path d="M12 3.5v2.6M3.5 13h2.6M17.9 13h2.6M6 7l1.8 1.8M18 7l-1.8 1.8M2.5 20.5h19" fill="none"/>',
    user: '<path d="M12 3a8 8 0 0 0-8 8v3.2A4 4 0 0 0 8 18.2h8a4 4 0 0 0 4-4V11a8 8 0 0 0-8-8z"/><rect x="6.2" y="8.6" width="11.6" height="6.4" rx="3.2"/><path d="M9.5 21h5" fill="none"/>',
    trophy: '<path d="M8 3.8h8v6.2a4 4 0 0 1-8 0z"/><path d="M8 5.8H5a3.2 3.2 0 0 0 3 4.4M16 5.8h3a3.2 3.2 0 0 1-3 4.4" fill="none"/><path d="M12 14v4.2M8.2 20.5h7.6" fill="none"/>',
    route: '<circle cx="5.5" cy="18.5" r="2.2"/><circle cx="18.5" cy="5.5" r="2.2"/><path d="M7.4 17.2C12 14 8 10.5 12 8.8c2-.9 3-1 4.4-2" fill="none" stroke-dasharray="2.2 2"/>',
    sat: '<rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1.2" transform="rotate(45 12 12)"/><path d="M4.5 4.5l3.6 3.6M15.9 15.9l3.6 3.6M3 8l5-1M16 17l5-1M16.5 7.5 20 4M4 20l3.5-3.5" fill="none"/>',
    spark: '<path d="M12 2.8c.8 5.2 3.8 8.2 9 9.2-5.2 1-8.2 4-9 9.2-.8-5.2-3.8-8.2-9-9.2 5.2-1 8.2-4 9-9.2z"/>',
    bulb: '<path d="M9 18.2h6M10 21h4M12 2.8a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2h5c0-.8.4-1.5 1.1-2A6 6 0 0 0 12 2.8z"/>',
    rocket: '<path d="M12 2.6c3.7 2.6 5.2 6.4 4.1 11.4L12 17.2 7.9 14C6.8 9 8.3 5.2 12 2.6z"/><circle cx="12" cy="9.6" r="1.7"/><path d="M8.2 15.5 5 19.5l4.2-1M15.8 15.5l3.2 4-4.2-1" fill="none"/>',
    film: '<rect x="3" y="8.5" width="18" height="12" rx="1.6"/><path d="M3 8.5l2.8-4.8 3.6 4.8 3.6-4.8 3.6 4.8 2.8-4.8" fill="none"/>',
    play: '<path d="M8 5.2l11 6.8-11 6.8z"/>',
    skip: '<path d="M5 5.5l8 6.5-8 6.5zM14 5.5l8 6.5-8 6.5z"/>',
    warn: '<path d="M12 3.2 22 20.5H2z"/><path d="M12 10v5M12 17.6v.4" fill="none" stroke-width="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.6 2.2" fill="none"/>',
    tap: '<path d="M9 11.2V5.6a1.6 1.6 0 0 1 3.2 0v5M12.2 10.2V9a1.6 1.6 0 0 1 3.2 0v1.8M15.4 10.8v-.5a1.6 1.6 0 0 1 3.2 0v4.5a6 6 0 0 1-6 6h-.8a5.2 5.2 0 0 1-4.2-2.1L4.9 14.4a1.7 1.7 0 0 1 2.6-2.1L9 14" fill="none"/>',
    drop: '<path d="M12 3s6.2 6.6 6.2 11.2a6.2 6.2 0 0 1-12.4 0C5.8 9.6 12 3 12 3z"/>',
    book: '<path d="M3.5 5.6c2.4-1.2 5.4-1.2 8.5.4 3.1-1.6 6.1-1.6 8.5-.4V19c-2.4-1.2-5.4-1.2-8.5.4-3.1-1.6-6.1-1.6-8.5-.4z"/><path d="M12 6v13.4" fill="none"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 2.6 3 15.4 0 18M12 3c-3 2.6-3 15.4 0 18" fill="none"/>',
    tired: '<path d="M4.5 6.5h6l-6 7h6M13 12h4.6l-4.6 5.4h4.6" fill="none"/><path d="M18.5 4.5h2.4l-2.4 2.8h2.4" fill="none" stroke-width="1.3"/>',
    box: '<path d="M12 3 20.5 7.5v9L12 21l-8.5-4.5v-9z"/><path d="M12 12l8.5-4.5M12 12v9M12 12 3.5 7.5" fill="none"/>',
    ruler: '<rect x="2.8" y="8" width="18.4" height="8" rx="1.6" transform="rotate(-18 12 12)"/><path d="M7 11.6l1 2.2M10.2 10.6l1 2.2M13.4 9.6l1 2.2M16.6 8.6l1 2.2" fill="none"/>',
    pin: '<path d="M12 21.5s6.5-6.1 6.5-11.2a6.5 6.5 0 0 0-13 0c0 5.1 6.5 11.2 6.5 11.2z"/><circle cx="12" cy="10.2" r="2.4"/>',
    heartbeat: '<path d="M2.5 12.5h4l2.2-6 3.5 12 2.8-8 1.5 2h5" fill="none"/>',
    wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 14.5h16a3 3 0 1 1-3 3" fill="none"/>',
    sprout: '<path d="M12 21v-9" fill="none"/><path d="M12 13c0-3.8-2.8-6-7-6 0 3.9 2.8 6 7 6z"/><path d="M12 15.5c0-3.4 2.4-5.4 6.6-5.4 0 3.5-2.4 5.4-6.6 5.4z"/>',
    arrow: '<path d="M4 12h15M13 5.5 19.5 12 13 18.5" fill="none" stroke-width="2"/>',
    home: '<path d="M3.5 11 12 3.8l8.5 7.2V20a1 1 0 0 1-1 1h-4.2v-6h-6.6v6H4.5a1 1 0 0 1-1-1z"/>',
    tool: '<path d="M14.5 5.5a4.4 4.4 0 0 0-5.6 5.6L3.8 16.2a2 2 0 0 0 2.8 2.8l5.1-5.1a4.4 4.4 0 0 0 5.6-5.6l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    quote: '<path d="M4.5 18.5v-6.2C4.5 8.4 6.6 6 10 5.5M13.5 18.5v-6.2c0-3.9 2.1-6.3 5.5-6.8" fill="none" stroke-width="2"/>',
    medal: '<circle cx="12" cy="14.5" r="5.8"/><path d="M8.2 9.6 6 3.5h4.2L12 8.4 13.8 3.5H18l-2.2 6.1" fill="none"/><path d="M12 11.6l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="currentColor" fill-opacity=".7" stroke="none"/>'
  };
  var COL = {
    rock: "#ffb98a",
    radiation: "#ffe27a",
    air: "#aee6ff",
    recycle: "#8dffb4",
    fire: "#ff9b6b",
    ufo: "#b69cff",
    foot: "#ffc58a",
    wave: "#7fd6ff",
    grad: "#9fc9ff",
    planet: "#d6a9ff",
    comet: "#ffd27a",
    telescope: "#9fc9ff",
    plate: "#ffe9b0",
    build: "#ffd08a",
    extinguisher: "#ff8f9c",
    worm: "#ffb98a",
    fog: "#c8e6f5",
    volcano: "#ff9b6b",
    desert: "#ffd27a",
    chart: "#8dffb4",
    camera: "#9fc9ff",
    parachute: "#ffb98a",
    robot: "#7ee7ff",
    ice: "#aee6ff",
    syringe: "#ff9bb9",
    atom: "#7ee7ff",
    broom: "#ffd08a",
    phone: "#9fc9ff",
    laptop: "#9fc9ff",
    passport: "#ffd36e",
    moon: "#e6e0ff",
    thermo: "#ff9bb9",
    person: "#7ee7ff",
    life: "#ff9bb9", energy: "#ffe27a", shield: "#8fc4ff", science: "#d6a9ff", greenhouse: "#8dffb4", sprout: "#8dffb4", medbay: "#ff9bb9", lab: "#9fc9ff", airlock: "#ffd08a", rover: "#ffb98a",
    gift: "#ff9fe3", lock: "#b9c6ff", check: "#8dffb4", cross: "#ff8f9c", star: "#ffe27a", storm: "#ffc58a", flare: "#ffe27a", dish: "#7ee7ff", cold: "#aee6ff", sun: "#ffd27a", user: "#7ee7ff",
    trophy: "#ffe27a", route: "#9ee9ff", sat: "#7ee7ff", spark: "#e6d4ff", bulb: "#ffe98a", rocket: "#ffb98a", film: "#c8b2ff", play: "#8dffb4", skip: "#b9c6ff", warn: "#ffd36e", clock: "#7ee7ff",
    tap: "#e6fbff", drop: "#7fd6ff", book: "#9fc9ff", globe: "#7ee7ff", tired: "#c8b2ff", box: "#e8c9a0", ruler: "#9ee9ff", pin: "#ff9bb9", heartbeat: "#ff9bb9", wind: "#ffc58a", arrow: "#7ee7ff", home: "#9fc9ff", tool: "#ffd08a", quote: "#7ee7ff", medal: "#ffe27a"
  };
  var EMO = {
    "🪨": "rock", "🇪🇺": "globe",
    "☢️": "radiation",
    "🫁": "air",
    "🫧": "air",
    "♻️": "recycle",
    "🔥": "fire",
    "🛸": "ufo",
    "🦶": "foot",
    "👣": "foot",
    "🏊": "wave",
    "🌊": "wave",
    "🎓": "grad",
    "🪐": "planet",
    "🔴": "planet",
    "🔵": "planet",
    "☄️": "comet",
    "🔭": "telescope",
    "🍽️": "plate",
    "🌞": "sun",
    "🏗️": "build",
    "🧯": "extinguisher",
    "🪱": "worm",
    "🌫️": "fog",
    "🌋": "volcano",
    "🏜️": "desert",
    "📈": "chart",
    "📷": "camera",
    "🪂": "parachute",
    "🤖": "robot",
    "🧊": "ice",
    "💉": "syringe",
    "⚛️": "atom",
    "🧹": "broom",
    "📱": "phone",
    "💻": "laptop",
    "🛂": "passport",
    "🌙": "moon",
    "🧑": "person",
    "🔐": "lock",
    "🌡️": "thermo",
    "🌡": "thermo",
    "🔆": "sun",
    "❤️": "life", "❤": "life", "💖": "life", "💓": "heartbeat", "⚡": "energy", "🛡️": "shield", "🛡": "shield", "🧬": "science", "🧪": "science", "🔬": "lab", "⚗️": "science",
    "🌱": "sprout", "🥬": "greenhouse", "🏥": "medbay", "🩺": "medbay", "🚪": "airlock", "🚙": "rover", "🚗": "rover", "🛻": "rover", "🎁": "gift", "🔒": "lock", "✅": "check", "✓": "check", "❌": "cross", "✗": "cross",
    "⚠️": "warn", "⚠": "warn", "☀️": "sun", "☀": "sun", "🌪️": "storm", "🌪": "storm", "🥶": "cold", "❄️": "cold", "📡": "dish", "🛰️": "sat", "🛰": "sat", "🏆": "trophy", "✨": "spark", "💡": "bulb",
    "🚀": "rocket", "🎬": "film", "👤": "user", "🧑‍🚀": "user", "👩‍🚀": "user", "👨‍🚀": "user", "👆": "tap", "💧": "drop", "📏": "ruler", "📖": "book", "📘": "book", "😓": "tired", "📦": "box",
    "🌬️": "wind", "🌬": "wind", "🔭": "sat", "🚁": "sat", "🌅": "sun", "🏠": "home", "🎯": "pin", "🔧": "tool", "🛠️": "tool", "🏅": "medal", "🥇": "medal", "⭐": "star", "🌟": "star", "⏱️": "clock", "⏱": "clock", "⏳": "clock", "🔄": "arrow", "➡️": "arrow", "▶️": "play", "⏭": "skip", "⏭️": "skip", "🗺️": "route", "🧭": "route", "🌍": "globe", "🌎": "globe"
  };
  var keys = Object.keys(EMO).sort(function (a, b) { return b.length - a.length; });
  var RE_SPLIT = new RegExp("(" + keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")");
  var RE_HAS = RE_SPLIT;

  function ic(name, cls) {
    if (!P[name]) return "";
    return '<span class="hi hi-' + name + (cls ? " " + cls : "") + '" style="--hc:' + (COL[name] || "#7ee7ff") + '" aria-hidden="true"><svg viewBox="0 0 24 24">' + P[name] + "</svg></span>";
  }
  function node(name, cls) { var t = document.createElement("span"); t.innerHTML = ic(name, cls); return t.firstChild; }

  /* hologram face: k 0 sad / 1 neutral / 2 happy ; size px */
  var FC = [["#8fb8ff", "#3f6cd8"], ["#7ee7ff", "#2f9bd8"], ["#8dffd0", "#22b8a0"]];
  var fid = 0;
  function face(k, size) {
    k = k === 0 || k === 1 || k === 2 ? k : 1; var c = FC[k], id = "hf" + (++fid);
    var mouth = ["M40 79q20-15 40 0", "M42 77h36", "M38 70q22 22 44 0"][k];
    var eyes = k === 2 ? '<path d="M38 52q7-9 14 0M68 52q7-9 14 0" fill="none"/>' : '<ellipse cx="45" cy="52" rx="5.2" ry="6.4" fill="currentColor" stroke="none"/><ellipse cx="75" cy="52" rx="5.2" ry="6.4" fill="currentColor" stroke="none"/>';
    var brow = k === 0 ? '<path d="M34 40l18 6M86 40l-18 6" fill="none"/>' : "";
    var tear = k === 0 ? '<path d="M47 62q-4 8 0 11 4-3 0-11z" fill="#bfe0ff" stroke="none" opacity=".85"/>' : "";
    return '<svg class="hface hf' + k + '" viewBox="0 0 120 120" style="--hc:' + c[0] + ';width:' + (size || 64) + 'px;height:' + (size || 64) + 'px" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="' + c[0] + '" stop-opacity=".38"/><stop offset="1" stop-color="' + c[1] + '" stop-opacity=".62"/></radialGradient></defs>'
      + '<circle cx="60" cy="60" r="52" fill="url(#' + id + ')" stroke="' + c[0] + '" stroke-width="3.2"/><ellipse cx="60" cy="60" rx="52" ry="14" fill="none" stroke="' + c[0] + '" stroke-opacity=".28" stroke-width="1.6"/><ellipse cx="60" cy="60" rx="20" ry="52" fill="none" stroke="' + c[0] + '" stroke-opacity=".22" stroke-width="1.6"/>'
      + '<path d="M26 34q9-17 31-20" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="4.2" stroke-linecap="round"/>'
      + '<g style="color:#eaffff" stroke="#eaffff" stroke-width="4.4" stroke-linecap="round" fill="none">' + eyes + brow + '<path d="' + mouth + '" fill="none"/></g>' + tear + '</svg>';
  }

  /* ---------------- emoji → hologram scanner ---------------- */
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|SELECT|SVG|CANVAS|TITLE|CODE|PRE)$/;
  var SKIP_SEL = "#hud-hearts,#modal-hearts,.mi,.hi,[data-noholo],[id^='arena-game'],#gh-active-game-box,.mm2-demo,.mm2-stage,.mm3-wrap,[class*='mm3-'],[class*='mm2-g'],.tut-gif,#tut-gif-new,#mm-stage,#mm2-box,#minigame-host,.hface";
  var LETTER = /[A-Za-zА-Яа-яЁёӢӣҒғҚқҲҳҶҷӮӯ]/;
  function inSkip(n) {
    var p = n.parentNode;
    if (!p || p.nodeType !== 1) return true;
    if (SKIP.test(p.nodeName.toUpperCase())) return true;
    try { if (p.closest && p.closest(SKIP_SEL)) return true; } catch (e) {}
    return false;
  }
  function conv(n) {
    var v = n.nodeValue; if (!v || !RE_HAS.test(v) || inSkip(n)) return;
    var parts = v.split(RE_SPLIT), letters = LETTER.test(v), out = [], i;
    var seenText = false;
    for (i = 0; i < parts.length; i++) {
      if (i % 2 === 0) { out.push({ t: parts[i] }); if (parts[i].trim()) seenText = true; }
      else out.push({ e: parts[i], lead: !seenText });
    }
    if (letters) {
      for (i = 0; i < out.length; i++) if (out[i].e) {
        var after = out.slice(i + 1).some(function (o) { return o.t && o.t.trim(); });
        if (!out[i].lead && after) { out[i] = { t: out[i].e }; }
      }
    }
    var frag = document.createDocumentFragment(), buf = "";
    function flush() { if (buf) { frag.appendChild(document.createTextNode(buf)); buf = ""; } }
    out.forEach(function (o) {
      if (o.e) { flush(); frag.appendChild(node(EMO[o.e])); } else buf += o.t;
    });
    flush();
    if (n.parentNode) n.parentNode.replaceChild(frag, n);
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { conv(root); return; }
    if (root.nodeType !== 1) return;
    if (SKIP.test(root.nodeName.toUpperCase())) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(conv);
  }
  var scheduled = false, pending = [];
  function queue(n) { pending.push(n); if (scheduled) return; scheduled = true; (window.requestAnimationFrame || setTimeout)(function () { scheduled = false; var l = pending; pending = []; l.forEach(walk); }); }
  var scanOn = false;
  function startScan() {
    if (scanOn) return; scanOn = true; walk(document.body);
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === "characterData") queue(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) queue(m.addedNodes[j]);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  /* ---------------- Problem → Choice → Result panel ---------------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var RN = [["life", "Жизнь"], ["energy", "Энергия"], ["shield", "Щит"]];
  function chip(v, k) { return '<span class="hs-chip ' + (v > 0 ? "up" : "dn") + '">' + ic(RN[k][0]) + '<b>' + (v > 0 ? "+" : "−") + Math.abs(v) + '</b><em>' + RN[k][1] + '</em></span>'; }
  function story(o) {
    var d = o.delta || [0, 0, 0], gain = [], lose = [];
    d.forEach(function (v, i) { if (v > 0) gain.push(chip(v, i)); else if (v < 0) lose.push(chip(v, i)); });
    var win = !!o.win;
    var h = '<div class="hs ' + (win ? "is-win" : "is-lose") + '">'
      + '<div class="hs-step hs-p"><div class="hs-n"><i>1</i><span>Проблема</span></div><div class="hs-ico">' + ic(o.pIcon || "warn") + '</div><div class="hs-t">' + esc(o.pTitle) + '</div><div class="hs-s">' + esc(o.pText) + '</div></div>'
      + '<div class="hs-arrow">' + ic("arrow") + '</div>'
      + '<div class="hs-step hs-c"><div class="hs-n"><i>2</i><span>Выбор</span></div><div class="hs-ico">' + (o.cEmb || ic(o.cIcon || "tool")) + '</div><div class="hs-t">' + esc(o.cTitle) + '</div><div class="hs-s">' + esc(o.cText) + '</div></div>'
      + '<div class="hs-arrow">' + ic("arrow") + '</div>'
      + '<div class="hs-step hs-r"><div class="hs-n"><i>3</i><span>Результат</span></div><div class="hs-ico">' + ic(win ? "check" : "cross", win ? "hs-ok" : "hs-bad") + '</div><div class="hs-t">' + esc(o.rTitle) + '</div><div class="hs-s">' + esc(o.rText) + '</div>'
      + '<div class="hs-delta">' + (gain.length ? '<div class="hs-row"><span class="hs-lb up">Получили</span>' + gain.join("") + '</div>' : "") + (lose.length ? '<div class="hs-row"><span class="hs-lb dn">Потеряли</span>' + lose.join("") + '</div>' : "") + (!gain.length && !lose.length ? '<div class="hs-row"><span class="hs-lb">Без изменений</span></div>' : "") + '</div></div>'
      + '</div>' + (o.sci ? '<div class="hs-sci">' + ic("spark") + '<span><b>Научное открытие ' + o.sci.n + ' / 5</b><em>' + esc(o.sci.t) + '</em></span></div>' : "");
    var box = document.createElement("div"); box.className = "hs-wrap"; box.innerHTML = h; return box;
  }

  /* ---------------- base conditions (crisis look) ---------------- */
  var COND = { storm: "storm", flare: "flare", blackout: "blackout", cold: "cold" };
  var CTXT = {
    storm: ["storm", "Пылевая буря", "Пыль закрыла панели. Экипаж укрылся внутри."],
    flare: ["flare", "Солнечная вспышка", "Щит базы горит. Выходить наружу опасно."],
    blackout: ["dish", "Связь потеряна", "Марс за Солнцем. Антенна молчит."],
    cold: ["cold", "Экстремальный холод", "Ночью около −85 °C. На обогрев уходит больше энергии."]
  };
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function condition(kind) {
    var root = document.documentElement;
    ["storm", "flare", "blackout", "cold"].forEach(function (k) { root.classList.remove("cond-" + k); });
    var old = document.getElementById("hc-layer"); if (old) old.remove();
    var oc = document.getElementById("hc-chip"); if (oc) oc.remove();
    if (!COND[kind]) return;
    root.classList.add("cond-" + kind);
    var inHub = !!document.getElementById("mars-base-svg");
    var L = mk("div", "hc-layer hc-" + kind); L.id = "hc-layer"; L.setAttribute("aria-hidden", "true");
    var h = "", i, r;
    if (kind === "storm") {
      h += '<i class="hc-haze"></i><i class="hc-haze h2"></i><i class="hc-front"></i>';
      for (i = 0; i < 46; i++) { r = Math.random(); h += '<b class="hc-dust" style="top:' + (Math.random() * 100).toFixed(1) + '%;width:' + (60 + r * 220).toFixed(0) + 'px;animation-duration:' + (1.6 + Math.random() * 2.4).toFixed(2) + 's;animation-delay:-' + (Math.random() * 4).toFixed(2) + 's;opacity:' + (0.25 + r * .5).toFixed(2) + '"></b>'; }
    } else if (kind === "flare") {
      h += '<i class="hc-glow"></i><i class="hc-aurora"></i><i class="hc-aurora a2"></i>';
      for (i = 0; i < 26; i++) h += '<b class="hc-part" style="left:' + (Math.random() * 100).toFixed(1) + '%;animation-delay:-' + (Math.random() * 3).toFixed(2) + 's;animation-duration:' + (1.1 + Math.random() * 1.6).toFixed(2) + 's"></b>';
    } else if (kind === "blackout") {
      h += '<i class="hc-dark"></i><i class="hc-static"></i><i class="hc-scan"></i><div class="hc-nosig">' + ic("dish") + '<b>NO SIGNAL</b></div>';
    } else if (kind === "cold") {
      h += '<i class="hc-blue"></i>';
    }
    L.innerHTML = h;
    if (inHub) (document.getElementById("base-stage-wrapper") || document.body).appendChild(L);
    var t = CTXT[kind], c = mk("div", "hc-chip hc-c-" + kind, ic(t[0]) + '<span><b>' + t[1] + '</b><em>' + t[2] + '</em></span>'); c.id = "hc-chip";
    document.body.appendChild(c);
  }

  var API = { ic: ic, node: node, face: face, story: story, condition: condition, scan: walk, start: startScan, EMO: EMO, COL: COL, esc: esc };
  window.MMHolo = API;
  if (/\/dune\//.test(location.pathname) || document.documentElement.hasAttribute("data-holo-scan")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startScan); else startScan();
  }
})();
