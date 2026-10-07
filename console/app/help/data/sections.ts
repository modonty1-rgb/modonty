export interface Hotspot {
  /** vertical position 0-100 (% from top) */
  top: number;
  /** horizontal position 0-100 (% from right because RTL) */
  right?: number;
  left?: number;
  /** label number shown inside the dot */
  n: number;
}
