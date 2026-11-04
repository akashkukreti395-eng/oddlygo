import type { ReactNode } from "react";

type ExperienceArtworkSceneProps = { id: string };

const accent = "var(--art-accent)";

export function ExperienceArtworkScene({ id }: ExperienceArtworkSceneProps) {
  let scene: ReactNode;
  switch (id) {
    case "glitch-city":
      scene = <>
        <path d="M0 128h360v52H0z" fill="#121821" />
        <path d="M16 128V61h43v67m8 0V39h57v89m10 0V74h45v54m10 0V27h67v101m9 0V56h45v72m9 0V43h39v85" fill="#202333" stroke="#42445b" strokeWidth="2" />
        <path d="M24 76h9v12h-9zm23 0h8v12h-8zm19-13h9v12h-9zm22 0h9v12h-9zm22 0h9v12h-9zm10 24h9v11h-9zm23 0h9v11h-9zm23 0h9v11h-9zm12-41h10v13h-10zm24 0h10v13h-10zm24 0h10v13h-10zm20 34h10v12h-10zm24 0h10v12h-10zm20-21h9v11h-9zm21 0h9v11h-9z" fill="#68d5d4" opacity=".8" />
        <path d="M0 145h360M0 158h360" stroke="#d95e94" strokeWidth="2" opacity=".72" />
        <path d="M145 180l37-42 33 42" fill="#252032" stroke="#efa76c" strokeWidth="2" />
        <path d="M177 143h7v10h-7z" fill="#fff0b0" />
      </>;
      break;
    case "one-second":
      scene = <>
        <rect x="56" y="35" width="248" height="112" rx="8" fill="#171c20" stroke="#b1865e" strokeWidth="2" />
        <path d="M75 53h38v5H75zm0 12h70v3H75z" fill="#8f8b86" />
        <text x="88" y="122" fill="#ffd68a" fontSize="57" fontFamily="monospace" letterSpacing="3">1.00</text>
        <path d="M271 53h15v15h-15z" fill="#f37160" />
        <path d="M273 61h11" stroke="#ffe0bf" strokeWidth="2" />
      </>;
      break;
    case "neal-fun":
      scene = <>
        <path d="M28 34h148v105H28z" fill="#222638" stroke="#8495bd" strokeWidth="2" transform="rotate(-7 28 34)" />
        <path d="M49 51h120v78H49z" fill="#d69f63" stroke="#f4d09c" strokeWidth="2" />
        <path d="M76 71h98v63H76z" fill="#384b57" stroke="#8ac4bc" strokeWidth="2" />
        <path d="M92 121V94h14v27m9 0V82h15v39m11 0V99h14v22" fill="#f0c67f" />
        <path d="M24 154h312" stroke="#e8a878" strokeWidth="2" strokeDasharray="5 8" />
      </>;
      break;
    case "infinite-canvas":
      scene = <>
        <path d="M12 145c58-73 95 39 150-37s99 41 186-63" fill="none" stroke="#a78be2" strokeWidth="3" />
        <path d="M8 116c62-73 102 36 156-37s95 31 189-50" fill="none" stroke="#64cbce" strokeWidth="2" opacity=".7" />
        <path d="M14 163c58-73 98 37 151-37s99 37 185-48" fill="none" stroke="#ed9c73" strokeWidth="2" opacity=".8" />
        <g fill="#e9c6ed"><circle cx="53" cy="94" r="4" /><circle cx="147" cy="121" r="3" /><circle cx="255" cy="83" r="4" /><circle cx="316" cy="56" r="3" /></g>
      </>;
      break;
    case "radio-garden":
      scene = <>
        <path d="M104 37c37-19 95-7 121 20 24 24 35 62 17 87-16 24-51 26-87 17-44-11-69-41-68-76 1-20 6-37 17-48z" fill="#365a5c" stroke="#8ec6b3" strokeWidth="2" />
        <path d="M110 57l28-10 14 12-9 13 17 8-7 15-24 2-8 21-18-8-7-27-13-8 16-10zm82-1 22 9 10 19-17 8-14-13-16 4-6-13z" fill="#8fb787" />
        <path d="M52 139c62 20 129 16 214-10" fill="none" stroke="#efbd72" strokeWidth="2" strokeDasharray="3 7" />
        <circle cx="192" cy="89" r="5" fill="#ffb872" /><circle cx="118" cy="118" r="4" fill="#ee8894" /><circle cx="224" cy="67" r="4" fill="#8ee1df" />
      </>;
      break;
    case "odd-one-out":
      scene = <>{Array.from({ length: 12 }, (_, i) => {
        const x = 70 + (i % 4) * 57;
        const y = 44 + Math.floor(i / 4) * 42;
        const odd = i === 6;
        return <g key={i}><rect x={x} y={y} width="39" height="29" rx="3" fill={odd ? "#f5a85e" : "#33404a"} stroke={odd ? "#ffe2a5" : "#709099"} /><path d={odd ? `M${x + 19} ${y + 6}l10 17h-20z` : `M${x + 13} ${y + 8}h14v14h-14z`} fill={odd ? "#452a32" : "#83d3ca"} /></g>;
      })}</>;
      break;
    case "maze-mind":
      scene = <>
        <path d="M61 35h235v112H61z" fill="#171d25" stroke="#526674" strokeWidth="2" />
        <path d="M79 54h38v20H99v19h38V73h20v42h37V94h20v21h61M117 54h39v20m38-20v20h20m-97 42v-22m39 22v23m39-1v-21m39 21V75h24" fill="none" stroke="#d6b276" strokeWidth="7" strokeLinejoin="round" />
        <path d="M82 136h15v-15" fill="none" stroke="#7ed7c2" strokeWidth="4" />
        <circle cx="283" cy="54" r="5" fill="#f17d84" />
      </>;
      break;
    case "prism-shift":
      scene = <>
        <path d="M38 85h82" stroke="#8fe4e4" strokeWidth="4" />
        <path d="M120 45l47 80h-94z" fill="#39304c" stroke="#d4b8ff" strokeWidth="3" />
        <path d="M119 85l112-41m-112 41 113 42" stroke="#f49ed1" strokeWidth="3" />
        <path d="M231 44h70v80h-70z" fill="#1d252c" stroke="#9bd8c0" strokeWidth="2" />
        <path d="M251 84h31m-15-16v32" stroke="#f7d27f" strokeWidth="3" />
      </>;
      break;
    case "green-light":
      scene = <>
        <path d="M0 145h360v35H0z" fill="#20242a" />
        <rect x="126" y="27" width="108" height="117" rx="12" fill="#171a1d" stroke="#a0a297" strokeWidth="3" />
        <circle cx="180" cy="58" r="15" fill="#8f5655" /><circle cx="180" cy="102" r="16" fill="#90db83" />
        <path d="M171 143h18v37h-18z" fill="#858176" />
        <path d="M38 157h47m39 0h48m39 0h48m39 0h35" stroke="#e5c779" strokeWidth="3" strokeDasharray="15 12" />
      </>;
      break;
    case "wrong-answers":
      scene = <>
        <path d="M48 38h178v69H48z" fill="#333048" stroke="#a88dd2" strokeWidth="2" />
        <path d="M65 59h132m-132 15h87" stroke="#e6d9ed" strokeWidth="4" strokeLinecap="round" />
        <path d="M110 111l-17 19v-19" fill="#333048" stroke="#a88dd2" strokeWidth="2" />
        <path d="M183 91h127v49H183z" fill="#68434b" stroke="#eb9c87" strokeWidth="2" />
        <text x="205" y="126" fill="#fff0c8" fontSize="29" fontFamily="serif">?!</text>
      </>;
      break;
    case "pointer-pointer":
      scene = <>
        <path d="M62 31h235v122H62z" fill="#d2a873" stroke="#efe1bd" strokeWidth="4" />
        <path d="M72 42h215v101H72z" fill="#627b7c" />
        <path d="M72 116l55-42 38 27 31-37 91 55v24H72z" fill="#344957" />
        <path d="M214 54l30 56-23-8-8 21-9-4 8-21-19 1z" fill="#fff2d6" stroke="#252633" strokeWidth="2" />
        <path d="M47 158h266" stroke="#e4b979" strokeWidth="3" />
      </>;
      break;
    case "shape-lab":
      scene = <>
        <path d="M78 129l40-77 40 77z" fill="#e99a71" stroke="#ffcf96" strokeWidth="3" />
        <path d="M161 44h66v66h-66z" fill="#8275bc" stroke="#d3b4ff" strokeWidth="3" transform="rotate(13 194 77)" />
        <path d="M244 127c0-23 17-41 38-41s37 18 37 41v16h-75z" fill="#72bdb0" stroke="#b3edcf" strokeWidth="3" />
        <path d="M39 148h287" stroke="#d7cabe" strokeWidth="2" />
        <circle cx="121" cy="42" r="8" fill="#f6ce70" /><path d="M264 46l10 10-10 10-10-10z" fill="#ec7da2" />
      </>;
      break;
    case "quick-draw":
      scene = <>
        <path d="M57 145c18-65 49-18 71-73s49 27 81-26m-152 62c28 17 29 44 12 53m128-91c31 1 43 23 68 10" fill="none" stroke="#d9d3c8" strokeWidth="4" strokeLinecap="round" />
        <path d="M250 49l28 28-68 67-28 5 5-28z" fill="#efa85d" stroke="#ffe3a7" strokeWidth="3" />
        <path d="M203 139l-21 10 5-23" fill="#392f36" />
        <path d="M76 40l9 15 17 3-13 11 3 17-16-8-15 8 3-17-13-11 17-3z" fill="#7ecac6" />
      </>;
      break;
    case "the-useless-web":
      scene = <>
        <path d="M54 35h252v111H54z" fill="#24232c" stroke="#a898b8" strokeWidth="2" />
        <path d="M54 53h252" stroke="#777183" strokeWidth="2" /><circle cx="70" cy="44" r="3" fill="#ef897d" /><circle cx="82" cy="44" r="3" fill="#f2c371" />
        <rect x="117" y="78" width="126" height="43" rx="8" fill="#e5a464" />
        <text x="147" y="105" fill="#312632" fontSize="12" fontFamily="monospace">WHY NOT?</text>
        <path d="M256 126l16 30-12-5-5 12-5-3 5-12-12 1z" fill="#eee0c7" />
      </>;
      break;
    case "little-alchemy-2":
      scene = <>
        <path d="M68 57h71v71H68z" fill="#4a8f9a" stroke="#b5e1d3" strokeWidth="2" />
        <path d="M221 57h71v71h-71z" fill="#bd674e" stroke="#f2c17c" strokeWidth="2" />
        <path d="M99 77c-13 15-15 26-2 34 8 5 19 1 21-8 2-8-10-15-7-26z" fill="#92d7e3" />
        <path d="M252 114c-16-10-11-20 2-36 1 11 16 13 14 26-1 8-7 13-16 10z" fill="#ffd076" />
        <path d="M149 93h52m-12-12 13 12-13 12" fill="none" stroke="#f5d28f" strokeWidth="4" />
        <path d="M173 54l13 22h-26z" fill="#d4b7ed" />
      </>;
      break;
    case "earth":
      scene = <>
        <path d="M101 35c42-17 101-3 123 31 25 39 2 82-35 95-42 15-91-6-103-43-10-30-10-67 15-83z" fill="#397f9a" stroke="#9bd4cb" strokeWidth="3" />
        <path d="M114 51l31-5 12 15-17 16 8 16-21 11-2 27-21-10-10-27 8-16zm74 11 22 6 13 20-20 7-14-11-14 3-6-13z" fill="#8dc483" />
        <path d="M64 150c70 22 139 16 226-19" fill="none" stroke="#c6a575" strokeWidth="2" />
        <path d="M78 42l-12-9m208 11 12-11m-26 113 16 10" stroke="#f3d9a1" strokeWidth="2" />
      </>;
      break;
    case "chrome-music-lab":
      scene = <>
        {[0, 1, 2, 3, 4, 5].map((col) => [0, 1, 2, 3].map((row) => <rect key={`${col}-${row}`} x={64 + col * 38} y={47 + row * 24} width="25" height="15" rx="2" fill={["#ed917c", "#e7c56e", "#81cabb", "#9d8bd2", "#db83ad", "#78afd0"][(col + row) % 6]} opacity={(row + col) % 3 === 0 ? 1 : .68} />))}
        <path d="M53 151h254" stroke="#e6d7bd" strokeWidth="2" />
      </>;
      break;
    case "windowswap":
      scene = <>
        <path d="M47 32h266v121H47z" fill="#b98559" stroke="#f3d3a2" strokeWidth="4" />
        <path d="M58 43h244v99H58z" fill="#62838a" />
        <path d="M58 117l52-41 43 31 44-48 105 63v20H58z" fill="#364b50" />
        <path d="M177 43v99m-119-52h244" stroke="#d7bd99" strokeWidth="4" />
        <path d="M71 55h34" stroke="#ffe39c" strokeWidth="4" />
      </>;
      break;
    case "drive-listen":
      scene = <>
        <path d="M0 117h360v63H0z" fill="#1a2026" />
        <path d="M20 115l38-39h64l26 39m57 0 34-51h58l43 51" fill="#38434b" stroke="#e0b576" strokeWidth="2" />
        <path d="M0 148h360" stroke="#d8bb7c" strokeWidth="3" strokeDasharray="22 18" />
        <path d="M117 180l69-63h43l67 63" fill="#252c32" />
        <path d="M43 112h41m168-28h41" stroke="#eb9a76" strokeWidth="3" />
      </>;
      break;
    case "asoftmurmur":
      scene = <>
        <path d="M31 96h33l12-22 16 47 20-68 18 93 21-108 18 89 17-60 20 43 18-25 16 16h48" fill="none" stroke="#9ac8b5" strokeWidth="4" strokeLinejoin="round" />
        <path d="M30 147h299" stroke="#625979" strokeWidth="2" />
        <path d="M53 49v14m29-25v12m222 6v14m-25 53v16" stroke="#dfb17a" strokeWidth="3" />
      </>;
      break;
    case "patatap":
      scene = <>
        <path d="M64 65a25 25 0 1 1 0 50 25 25 0 0 1 0-50zm74-33h42v42h-42zm75 56 23-39 23 39zm12 28h55v32h-55z" fill="#df836e" />
        <path d="M64 44v-18m0 118v18m-42-72H5m117 0h17m50-56 12-12m40 131 15 12" stroke="#e5c975" strokeWidth="4" />
        <path d="M150 123h30m-15-15v30" stroke="#92d7cf" strokeWidth="4" />
      </>;
      break;
    case "zoomquilt":
      scene = <>
        <path d="M29 25h302v130H29z" fill="#604452" stroke="#e2bb8d" strokeWidth="3" />
        <path d="M61 43h238v95H61z" fill="#344f54" stroke="#e0a87e" strokeWidth="3" />
        <path d="M91 59h178v64H91z" fill="#7b5d68" stroke="#c8d09a" strokeWidth="3" />
        <path d="M123 71h114v40H123z" fill="#334449" stroke="#e2bb8d" strokeWidth="3" />
        <path d="M152 80h56v22h-56z" fill="#ce9572" />
      </>;
      break;
    case "cat-bounce":
      scene = <>
        <path d="M0 148h360" stroke="#d3ac83" strokeWidth="3" />
        <path d="M121 126l-3-47 20 14 22-18 26 20 17-13 17 40-20 13-61 1z" fill="#e9a874" stroke="#ffd19e" strokeWidth="3" />
        <path d="M127 82l-8-23 22 16m54 2 20-19-2 30" fill="#e9a874" stroke="#ffd19e" strokeWidth="3" />
        <circle cx="147" cy="101" r="3" fill="#332932" /><circle cx="184" cy="101" r="3" fill="#332932" />
        <path d="M236 40c19 7 28 21 24 39m18-47c14 8 19 18 16 30" fill="none" stroke="#9ac7d2" strokeWidth="3" />
      </>;
      break;
    case "radiooooo":
      scene = <>
        <path d="M69 56h222v92H69z" fill="#543c38" stroke="#e4b67f" strokeWidth="3" />
        <path d="M92 72h77v60H92z" fill="#9b7255" />
        <path d="M106 111l19-24 17 24z" fill="#d5aa73" />
        <path d="M200 84h68m-68 13h44m-44 13h58" stroke="#dfc49d" strokeWidth="3" />
        <path d="M58 43h244" stroke="#ed8f70" strokeWidth="4" />
        <circle cx="277" cy="122" r="6" fill="#8fc2b2" />
      </>;
      break;
    case "stellarium":
      scene = <>
        <path d="M41 126l55-60 51 24 59-42 52 60 59-29" fill="none" stroke="#8295c5" strokeWidth="2" />
        <g fill="#f3d38e"><circle cx="41" cy="126" r="4" /><circle cx="96" cy="66" r="5" /><circle cx="147" cy="90" r="3" /><circle cx="206" cy="48" r="5" /><circle cx="258" cy="108" r="3" /><circle cx="317" cy="79" r="5" /></g>
        <path d="M85 145h189" stroke="#7886a3" strokeWidth="2" />
        <path d="M177 62l7-15 7 15-7 7z" fill="#a5d6d1" />
      </>;
      break;
    case "neal-fun-infinite-craft":
      scene = <>
        <path d="M42 43h91v76H42z" fill="#5b7f7e" stroke="#b5dbc5" strokeWidth="2" transform="rotate(-7 42 43)" />
        <path d="M226 43h91v76h-91z" fill="#98604d" stroke="#e7c182" strokeWidth="2" transform="rotate(7 226 43)" />
        <path d="M130 77h100m-17-15 17 15-17 15" fill="none" stroke="#f3d69a" strokeWidth="4" />
        <path d="M146 104h68v49h-68z" fill="#76629a" stroke="#d4b7e5" strokeWidth="2" />
        <path d="M169 119l11 18 11-18z" fill="#ffe397" />
      </>;
      break;
    case "paper-planes":
      scene = <>
        <path d="M45 121l219-75-73 98-30-40z" fill="#e5ded2" stroke="#f4c27e" strokeWidth="3" />
        <path d="M161 104l103-58-73 98-13-31-30-9z" fill="#aab3b4" />
        <path d="M28 146c68-10 126-6 202 7" fill="none" stroke="#85c9c4" strokeWidth="2" strokeDasharray="5 7" />
        <path d="M297 42l5 11 11 2-9 7 2 11-9-6-10 6 2-11-8-7 11-2z" fill="#f4cb76" />
      </>;
      break;
    case "thisissand":
      scene = <>
        <path d="M0 74c44 20 65-19 108 2s73 25 111 2 78-18 141 4v98H0z" fill="#bd8f65" />
        <path d="M0 102c46 22 69-17 112 4s67 21 109 1 79-16 139 7v66H0z" fill="#cfaa76" />
        <path d="M0 135c55 14 71-13 117 2s71 26 110 3 81-12 133 5v35H0z" fill="#6c8c81" />
        <path d="M0 155c53-10 83 11 129 3s71-14 110-2 77 9 121-4" fill="none" stroke="#edc58b" strokeWidth="3" />
      </>;
      break;
    case "geoguessr":
      scene = <>
        <path d="M31 44l66-20 48 19 48-17 61 24 55-5 20 43-39 25-5 42-58 17-36-25-37 7-23-35-70-11-14-38-31-1z" fill="#688f78" stroke="#b5cf9d" strokeWidth="3" />
        <path d="M72 140c41-39 46 7 80-28s49 5 72-36 45 12 81-32" fill="none" stroke="#edcf87" strokeWidth="4" />
        <path d="M208 52c0 17-24 35-24 35s-24-18-24-35a24 24 0 1 1 48 0z" fill="#e98173" />
        <circle cx="184" cy="51" r="7" fill="#f8e9c7" />
      </>;
      break;
    case "sandboxels":
      scene = <>
        <path d="M44 40h272v108H44z" fill="#252a2a" stroke="#79918e" strokeWidth="2" />
        {Array.from({ length: 42 }, (_, i) => <rect key={i} x={57 + (i * 37) % 247} y={52 + (i * 19) % 84} width="5" height="5" fill={["#ecc16f", "#77c1ae", "#de7b64", "#b799df"][i % 4]} opacity=".9" />)}
        <path d="M58 131c53-28 75-7 120-20s72 3 125-24" fill="none" stroke="#f0c276" strokeWidth="3" />
      </>;
      break;
    case "sandspiel":
      scene = <>
        <path d="M38 132l52-67 45 41 53-54 57 70z" fill="#976e54" stroke="#d4a579" strokeWidth="2" />
        <path d="M38 132l52-67 16 15-41 52zm68 0 29-26 53-54 18 22-47 58z" fill="#d8b27b" />
        <path d="M217 132l26-10 57 10v17H38v-17z" fill="#669285" />
        <path d="M55 150h245" stroke="#d7c092" strokeWidth="2" />
      </>;
      break;
    case "line-rider":
      scene = <>
        <path d="M24 145c55-3 46-83 102-77s51 66 103 58 47-49 106-54" fill="none" stroke="#e5b16b" strokeWidth="5" />
        <path d="M123 68l24-23 22 23-10 21h-25z" fill="#c8d3c6" stroke="#f4e4c2" strokeWidth="2" />
        <path d="M133 89l-10 22m30-21 17 19" stroke="#ede2c9" strokeWidth="3" />
        <circle cx="131" cy="116" r="8" fill="#526576" stroke="#eee1c5" strokeWidth="2" /><circle cx="167" cy="114" r="8" fill="#526576" stroke="#eee1c5" strokeWidth="2" />
        <path d="M0 158h360" stroke="#677276" strokeWidth="2" />
      </>;
      break;
    case "bored-button":
      scene = <>
        <path d="M63 51h234v91H63z" fill="#252734" stroke="#665d71" strokeWidth="3" />
        <rect x="117" y="67" width="126" height="57" rx="28" fill="#eb8f62" stroke="#ffd09a" strokeWidth="3" />
        <text x="140" y="102" fill="#342a35" fontSize="12" fontFamily="monospace">PRESS ME</text>
        <path d="M281 47l8 13 15 2-11 10 3 15-15-7-13 7 2-15-11-10 15-2z" fill="#9bc9bd" />
      </>;
      break;
    case "akinator":
      scene = <>
        <path d="M112 125c-14-17-18-54-4-75 18-28 77-29 96 0 14 21 10 58-5 75l-15 18h-57z" fill="#d3a36a" stroke="#f4ce91" strokeWidth="3" />
        <path d="M106 63c11-37 88-44 105-5-25-11-39-22-56-13-13 8-28 19-49 18z" fill="#39404a" />
        <circle cx="139" cy="91" r="4" fill="#302b36" /><circle cx="174" cy="91" r="4" fill="#302b36" />
        <path d="M145 110h24" stroke="#8f4e4b" strokeWidth="3" />
        <path d="M246 52l12 20 23 4-17 15 4 22-22-11-20 11 4-22-17-15 23-4z" fill="#819fc2" opacity=".8" />
      </>;
      break;
    case "skribbl":
      scene = <>
        <path d="M50 33h260v114H50z" fill="#eee4ce" stroke="#b79e77" strokeWidth="3" />
        <path d="M75 124l40-49 24 24 24-33 41 57m18-3 29-53 34 54" fill="none" stroke="#5d7781" strokeWidth="5" strokeLinecap="round" />
        <path d="M84 55l13-10 9 13-13 10zm135 2 19-7 6 15-19 7z" fill="#e78b73" />
        <path d="M258 39l26 26-72 70-22 3 4-23z" fill="#dc9b56" stroke="#a46d51" strokeWidth="2" />
      </>;
      break;
    case "gartic-phone":
      scene = <>
        <path d="M28 38h91v91H28z" fill="#e8d8ba" stroke="#9c806c" strokeWidth="3" />
        <path d="M134 38h91v91h-91z" fill="#d7e0d0" stroke="#9c806c" strokeWidth="3" />
        <path d="M240 38h91v91h-91z" fill="#e8d8ba" stroke="#9c806c" strokeWidth="3" />
        <path d="M45 104l20-36 18 24 17-17 9 29zm106-9 17-34 25 42zm104 10 24-43 38 43z" fill="#e58e71" />
        <path d="M119 83h14m-4-6 7 6-7 6m91-1h14m-4-6 7 6-7 6" fill="none" stroke="#eebd70" strokeWidth="3" />
      </>;
      break;
    case "2048":
      scene = <>{[2, 4, 8, 16, 32, 64].map((n, i) => <g key={n}><rect x={83 + (i % 3) * 67} y={42 + Math.floor(i / 3) * 57} width="55" height="46" rx="5" fill={["#e9d8b2", "#e8ba84", "#e99770", "#dc7e69", "#aa8fba", "#7caeb0"][i]} /><text x={94 + (i % 3) * 67} y={72 + Math.floor(i / 3) * 57} fill="#302d35" fontSize="17" fontWeight="bold">{n}</text></g>)}</>;
      break;
    case "silk":
      scene = <>
        <path d="M180 32c-79 13-50 47-109 63s-34 39 8 20 72-56 101-38m0-45c79 13 50 47 109 63s34 39-8 20-72-56-101-38" fill="none" stroke="#d38de3" strokeWidth="3" />
        <path d="M180 32c-39 34-30 70-76 96s-14 28 34 4 45-68 42-100m0 0c39 34 30 70 76 96s14 28-34 4-45-68-42-100" fill="none" stroke="#7fd2d0" strokeWidth="2" />
        <path d="M39 145h282" stroke="#6b647d" strokeWidth="2" />
      </>;
      break;
    case "blob-opera":
      scene = <>
        <path d="M62 140c-17-30-4-58 27-65 30-7 54 15 48 44-5 22-48 34-75 21z" fill="#f08377" />
        <path d="M145 135c-15-33-4-67 26-71 30-3 45 22 36 51-7 23-37 31-62 20z" fill="#79c9ba" />
        <path d="M224 140c-20-26-11-54 14-67 29-15 61 2 58 32-2 25-41 48-72 35z" fill="#8d7dc0" />
        <path d="M91 92v11m20-11v11m49-13v11m20-11v11m49-8v11m20-11v11" stroke="#302a36" strokeWidth="3" />
        <path d="M93 125h20m47-3h17m54 6h20" stroke="#ffe7bc" strokeWidth="2" />
      </>;
      break;
    case "google-arts-play":
      scene = <>
        <path d="M64 28h232v126H64z" fill="#3c3540" stroke="#d9bd8c" strokeWidth="5" />
        <path d="M78 42h204v99H78z" fill="#c9a276" />
        <path d="M110 127V72h47v55m17 0V59h54v68m18 0V87h29v40" fill="#635362" />
        <path d="M97 57h165" stroke="#f0d7aa" strokeWidth="3" />
        <path d="M176 76l12 22-23 1z" fill="#e8c479" />
      </>;
      break;
    case "nasa-eyes":
      scene = <>
        <path d="M69 122c38-54 89-79 147-67 30 7 48 24 72 35" fill="none" stroke="#8aa7c2" strokeWidth="2" />
        <path d="M171 61c35-21 74-3 77 27 2 27-32 48-61 35-28-12-35-45-16-62z" fill="#9f694f" stroke="#e9b77d" strokeWidth="3" />
        <path d="M179 74c18-11 40-1 42 14 2 14-15 25-29 19-15-6-21-23-13-33z" fill="#d49663" />
        <path d="M78 95l44 10-29 28zm209-38 17-18 13 22z" fill="#c8d3db" />
        <circle cx="102" cy="45" r="2" fill="#f2d896" /><circle cx="302" cy="117" r="3" fill="#f2d896" />
      </>;
      break;
    case "explore-livecams":
      scene = <>
        <path d="M30 43h204v104H30z" fill="#5d7e6a" stroke="#d8bb8d" strokeWidth="3" />
        <path d="M30 117l46-32 44 25 44-48 70 54v31H30z" fill="#344b44" />
        <path d="M248 67h70v63h-70z" fill="#38453f" stroke="#d8bb8d" strokeWidth="3" />
        <path d="M262 112l18-24 23 24" fill="none" stroke="#99bd8c" strokeWidth="4" />
        <circle cx="292" cy="54" r="5" fill="#ec8b71" />
      </>;
      break;
    case "minecraft-classic":
      scene = <>
        <path d="M0 114h360v66H0z" fill="#70573f" />
        <path d="M0 98h90v23H0zm90 16h78V89h84v30h108V88h-71V59h-84V76h-45V60H81v30H0z" fill="#668854" />
        <path d="M34 79h27v27H34zm52-20h27v28H86zm119-17h28v29h-28zm81 33h26v29h-26z" fill="#91aa69" />
        <path d="M128 121h24v24h-24zm116 0h24v24h-24z" fill="#d1ac78" />
      </>;
      break;
    case "the-deep-sea":
      scene = <>
        <path d="M0 62c45-16 77 13 119-1s82 14 122-1 73 4 119-5v125H0z" fill="#244757" />
        <path d="M0 104c48-17 74 13 124-3s87 16 125-1 73 5 111-5v85H0z" fill="#183641" />
        <path d="M81 128c27-24 54-22 76-5l-13 12 13 12c-29 15-56 6-76-19zm78 5 19-9-6 10 6 10z" fill="#7ab8ae" />
        <circle cx="111" cy="127" r="3" fill="#f4d292" />
        <path d="M236 180v-35m-13 35 13-25 14 25m44 0v-30m-15 30 15-22 16 22" stroke="#d79073" strokeWidth="4" />
        <circle cx="72" cy="54" r="3" fill="#9bc9d0" /><circle cx="277" cy="83" r="2" fill="#9bc9d0" />
      </>;
      break;
    case "spend-money":
      scene = <>
        <path d="M54 38h116v111H54z" fill="#d4c7a8" stroke="#a28765" strokeWidth="3" />
        <path d="M72 58h79m-79 16h63m-63 16h70m-70 16h48" stroke="#726b5e" strokeWidth="4" />
        <path d="M205 72h102v76H205z" fill="#7e9f83" stroke="#cae0ad" strokeWidth="3" />
        <path d="M221 90h70m-70 15h53" stroke="#dce8c5" strokeWidth="3" />
        <path d="M187 38c0-16 36-16 36 0s-36 17-36 0z" fill="#e7bf68" stroke="#fff0b0" strokeWidth="2" />
      </>;
      break;
    case "perfect-circle":
      scene = <>
        <path d="M121 55c34-24 85-16 106 11 21 27 8 68-23 86-31 18-82 10-101-20-20-30-10-60 18-77z" fill="none" stroke="#a99bca" strokeWidth="5" strokeLinecap="round" />
        <path d="M125 59c29-20 77-14 97 12 18 24 7 61-21 76-29 16-75 9-93-18-18-27-9-54 17-70z" fill="none" stroke="#e6b874" strokeWidth="2" opacity=".8" />
        <path d="M48 142h264" stroke="#677078" strokeWidth="2" />
        <path d="M277 43l19 2-6 18" fill="none" stroke="#e6b874" strokeWidth="3" />
      </>;
      break;
    case "password-game":
      scene = <>
        <path d="M68 35h224v111H68z" fill="#282631" stroke="#786f85" strokeWidth="2" />
        <path d="M88 60h100m-100 18h165m-165 18h123m-123 18h77" stroke="#c9c3cf" strokeWidth="4" strokeLinecap="round" />
        <path d="M255 59h18v18h-18zm-12 45 12-17 12 17zm-6 23h29" fill="none" stroke="#e8ac69" strokeWidth="3" />
        <circle cx="264" cy="127" r="3" fill="#79c6b7" />
      </>;
      break;
    case "internet-roadtrip":
      scene = <>
        <path d="M0 136h360v44H0z" fill="#25272a" />
        <path d="M0 154h360" stroke="#e4c47d" strokeWidth="3" strokeDasharray="22 16" />
        <path d="M70 87h148l24 31v25H54v-35z" fill="#d59d68" stroke="#f1ca91" strokeWidth="3" />
        <path d="M85 96h44v30H77zm55 0h50v30h-50z" fill="#6b8a8e" />
        <circle cx="95" cy="145" r="12" fill="#21262a" stroke="#bdc2b5" strokeWidth="3" /><circle cx="210" cy="145" r="12" fill="#21262a" stroke="#bdc2b5" strokeWidth="3" />
        <path d="M273 56h36m-18-18v36" stroke="#e8bc78" strokeWidth="3" />
      </>;
      break;
    case "bouncy-balls":
      scene = <>
        <path d="M0 147h360" stroke="#8b8790" strokeWidth="2" />
        <circle cx="90" cy="110" r="22" fill="#ed9674" /><circle cx="174" cy="83" r="31" fill="#7dc7bd" /><circle cx="269" cy="119" r="16" fill="#d5b66e" />
        <path d="M54 64h25m-13-13v25m167-40h28m-14-14v28m58 17h18" stroke="#b79bd3" strokeWidth="3" />
        <path d="M62 142c9-13 19-13 28 0m66-9c12-17 25-17 37 0m62 9c8-11 17-11 25 0" fill="none" stroke="#d9cdb7" strokeWidth="2" />
      </>;
      break;
    case "wiki-game":
      scene = <>
        <path d="M39 48h94v78H39z" fill="#d5c6a7" stroke="#968979" strokeWidth="2" />
        <path d="M228 48h94v78h-94z" fill="#cec2ae" stroke="#968979" strokeWidth="2" />
        <path d="M53 64h61m-61 12h52m-52 12h61m72-24h61m-61 12h48m-48 12h63" stroke="#727577" strokeWidth="3" />
        <path d="M137 87h83m-15-13 15 13-15 13" fill="none" stroke="#e2a966" strokeWidth="4" />
        <path d="M172 44v18m-8-8 8 8 8-8" fill="none" stroke="#8ec4b8" strokeWidth="3" />
      </>;
      break;
    case "chess-puzzles":
      scene = <>
        <path d="M98 31h164v120H98z" fill="#d7c5a5" stroke="#b2956b" strokeWidth="3" />
        {Array.from({ length: 64 }, (_, i) => i % 2 === 0 ? null : <rect key={i} x={100 + (i % 8) * 20} y={33 + Math.floor(i / 8) * 14} width="20" height="14" fill="#667a74" />)}
        <path d="M151 62h22l-5 12 12 13-7 14h-28l-7-14 12-13z" fill="#eee5cd" stroke="#353942" strokeWidth="2" />
        <path d="M211 91h15v30h-15zm-4-8h23v8h-23z" fill="#353942" />
      </>;
      break;
    case "memory-matrix":
      scene = <>{Array.from({ length: 24 }, (_, i) => {
        const colors = ["#f07f79", "#eebd65", "#75c8bb", "#9c89d6", "#e88db6", "#76add0"];
        const x = 75 + (i % 6) * 36;
        const y = 39 + Math.floor(i / 6) * 31;
        return <g key={i}><rect x={x} y={y} width="28" height="23" rx="3" fill={colors[(i * 5 + Math.floor(i / 6)) % colors.length]} opacity={i === 8 || i === 15 ? .35 : 1} /><path d={`M${x + 6} ${y + 6}h16v11h-16z`} fill="none" stroke="#fff0d6" strokeOpacity=".38" /></g>;
      })}</>;
      break;
    case "word-scramble":
      scene = <>
        <text x="43" y="102" fill="#f2c47a" fontSize="47" fontWeight="bold" fontFamily="monospace" transform="rotate(-8 43 102)">W</text>
        <text x="99" y="75" fill="#ef8f87" fontSize="36" fontWeight="bold" fontFamily="monospace" transform="rotate(9 99 75)">O</text>
        <text x="151" y="120" fill="#8ed1c5" fontSize="50" fontWeight="bold" fontFamily="monospace" transform="rotate(-5 151 120)">R</text>
        <text x="208" y="79" fill="#b09ce1" fontSize="42" fontWeight="bold" fontFamily="monospace" transform="rotate(11 208 79)">D</text>
        <text x="270" y="123" fill="#e99ab8" fontSize="38" fontWeight="bold" fontFamily="monospace" transform="rotate(-12 270 123)">?</text>
        <path d="M54 143h78m75-4h97" stroke="#b1a59a" strokeWidth="2" strokeDasharray="4 6" />
      </>;
      break;
    case "orbit-dodge":
      scene = <>
        <path d="M29 43h302v104H29z" fill="#1b222a" stroke="#657883" strokeWidth="2" />
        <path d="M46 63h267m-267 23h267m-267 23h267m-267 23h267M68 49v89m38-89v89m38-89v89m38-89v89m38-89v89m38-89v89m38-89v89" stroke="#53616a" strokeWidth="1" opacity=".6" />
        <path d="M81 109l15-26 15 26zm76-18h22v22h-22zm86 13 12-21 12 21z" fill="#d87675" />
        <path d="M124 58l16 27h-12l-5 22-8-27h12z" fill="#f0cf80" />
        <path d="M42 151h40m35 0h42m38 0h38m37 0h48" stroke="#86c8bc" strokeWidth="3" strokeDasharray="8 8" />
      </>;
      break;
    default:
      scene = <path d="M36 138h288M64 120l42-46 36 27 44-57 43 46 41-28 34 38" fill="none" stroke={accent} strokeWidth="4" strokeLinejoin="round" />;
  }

  return <svg className="experience-art-scene" viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">{scene}</svg>;
}
