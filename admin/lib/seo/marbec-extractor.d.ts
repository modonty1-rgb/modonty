declare module "@marbec/web-auto-extractor" {
  export default class WebAutoExtractor {
    constructor(options?: {
      addLocation?: boolean;
      embedSource?: ("rdfa" | "microdata")[];
    });
    parse(html: string): unknown[];
  }
}
