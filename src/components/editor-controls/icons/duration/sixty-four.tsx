import React from 'react';
import { Tooltip } from '@mui/material';
import { DurationGlyphProps } from './duration';
import { useGlyphColor } from '../glyphColor';
import baseSvgStyle from '../glyphBaseSvgStyle';
import { genericDurationFontSize } from './generic-duration';

export default function SixtyFourGlyph(props: DurationGlyphProps) {
  const color = useGlyphColor(props);
  return (
    <Tooltip title="Sixty-Fourth">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        onClick={props.onClick}
        height="35px"
        width="16px"
        style={baseSvgStyle(props)}
      >
        <path d="M7,9 L7,27" stroke={color} strokeWidth="0.96" style={{ fill: 'none' }} />
        <text fill={color} style={{ transform: 'translate(0px, 29px)', fontSize: genericDurationFontSize }}></text>
        <text fill={color} style={{ transform: 'translate(6.5px, 8px)', fontSize: genericDurationFontSize }}></text>
      </svg>
    </Tooltip>
  );
}
