import "./DnaHelix.css";

/*
  Double-helix SVG, period=100px.
  Group animates translateX(0→-100px), loops seamlessly because
  the path repeats every 100px and rungs are spaced every 50px.
*/
const RUNGS = [
  { x: -75, cls: "dna-rung--a" },
  { x: -25, cls: "dna-rung--b" },
  { x:  25, cls: "dna-rung--a" },
  { x:  75, cls: "dna-rung--b" },
  { x: 125, cls: "dna-rung--a" },
  { x: 175, cls: "dna-rung--b" },
  { x: 225, cls: "dna-rung--a" },
  { x: 275, cls: "dna-rung--b" },
];

const STRAND_A =
  "M-100,45 C-87.5,15 -62.5,15 -50,45 C-37.5,75 -12.5,75 0,45" +
  " C12.5,15 37.5,15 50,45 C62.5,75 87.5,75 100,45" +
  " C112.5,15 137.5,15 150,45 C162.5,75 187.5,75 200,45" +
  " C212.5,15 237.5,15 250,45 C262.5,75 287.5,75 300,45";

const STRAND_B =
  "M-100,45 C-87.5,75 -62.5,75 -50,45 C-37.5,15 -12.5,15 0,45" +
  " C12.5,75 37.5,75 50,45 C62.5,15 87.5,15 100,45" +
  " C112.5,75 137.5,75 150,45 C162.5,15 187.5,15 200,45" +
  " C212.5,75 237.5,75 250,45 C262.5,15 287.5,15 300,45";

export default function DnaHelix() {
  return (
    <div className="dna-wrap" aria-hidden="true">
      <svg className="dna-svg" viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
        <g className="dna-flow">
          {/* Rungs — drawn first (bottom layer) */}
          {RUNGS.map(({ x, cls }) => (
            <line key={x} x1={x} y1="15" x2={x} y2="75" className={`dna-rung ${cls}`} />
          ))}

          {/* Strand B (back) */}
          <path d={STRAND_B} className="dna-strand-b" />

          {/* Rung dots at junction points */}
          {RUNGS.map(({ x, cls }) => (
            <g key={`dot-${x}`}>
              <circle cx={x} cy="15" r="2.8" className={`dna-dot ${cls}`} />
              <circle cx={x} cy="75" r="2.8" className={`dna-dot ${cls}`} />
            </g>
          ))}

          {/* Strand A (front) */}
          <path d={STRAND_A} className="dna-strand-a" />
        </g>
      </svg>
    </div>
  );
}
