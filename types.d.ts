declare module 'lodash' {
  export * from '@types/lodash';
}

declare module 'react-resizable-panels' {
  export const Panel: any;
  export const PanelGroup: any;
  export const PanelResizeHandle: any;
}

declare module 'embla-carousel-react' {
  export default function useEmblaCarousel(options?: any): any[];
}

declare module 'react-slick' {
  import { Component } from 'react';
  export default class Slider extends Component<any> {}
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export {};