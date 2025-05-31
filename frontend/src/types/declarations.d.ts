declare module '@env' {
  export const API_BASE_URL: string;
  export const SKIP_AUTH: string;
}

declare module '*.svg' {
  import * as React from 'react';
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
