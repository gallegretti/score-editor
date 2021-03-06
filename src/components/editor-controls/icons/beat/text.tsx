import React from 'react';
import { Tooltip } from '@mui/material';
import { DynamicGlyphProps } from '../dynamics/dynamic';
import { useGlyphColor } from '../glyphColor';
import baseSvgStyle from '../glyphBaseSvgStyle';
import { glyphAsciFontfamily } from '../glyphTextFont';

export default function TextGlyph(props: DynamicGlyphProps) {
  const color = useGlyphColor(props);
  return (
    <Tooltip title="Set text">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="20px"
        width="45px"
        onClick={props.onClick}
        style={baseSvgStyle(props)}
      >
        <text
          fill={color}
          style={{ transform: 'translate(4px, 16px)', fontFamily: glyphAsciFontfamily, fontSize: '20px' }}>
          Text
        </text>
      </svg>
    </Tooltip>
  );
}
