import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const Vector8Icon = (props: any) => (
  <Svg width={5} height={9} viewBox="0 0 5 9" fill="none" {...props}>
    <Path
      d="M0.5 0.5L4.5 4.5L0.5 8.5"
      stroke="#999999"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Vector8Icon;
