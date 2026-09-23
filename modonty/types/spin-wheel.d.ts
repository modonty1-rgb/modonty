declare module "spin-wheel" {
  export interface WheelRestEvent {
    currentIndex: number;
  }

  export interface WheelProps {
    items: Array<{ label: string; backgroundColor?: string; labelColor?: string; weight?: number }>;
    borderColor?: string;
    borderWidth?: number;
    lineColor?: string;
    lineWidth?: number;
    isInteractive?: boolean;
    itemLabelAlign?: "left" | "center" | "right";
    itemLabelFont?: string;
    itemLabelFontSizeMax?: number;
    itemLabelRadius?: number;
    itemLabelRadiusMax?: number;
    itemLabelStrokeColor?: string;
    itemLabelStrokeWidth?: number;
    onRest?: (event: WheelRestEvent) => void;
  }

  export class Wheel {
    constructor(container: Element, props?: WheelProps);
    remove(): void;
    spinToItem(itemIndex: number, duration: number, spinToCenter?: boolean, revolutions?: number, direction?: 1 | -1): void;
  }
}
