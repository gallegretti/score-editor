import React from 'react';
import { Tooltip } from '@mui/material';
import { useGlyphColor } from '../../glyphColor';
import { BaseGlyphProps } from '../../glyphBaseProps';
import baseSvgStyle from '../../glyphBaseSvgStyle';
import { glyphAsciFontfamily } from '../../glyphTextFont';

export default function MidGlyph(props: BaseGlyphProps) {
  const color = useGlyphColor(props);
  return (
    <Tooltip title={props.hideTooltip ? '' : 'Midi'}>
      <svg
        id={props.id}
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 0 24 24"
        width="30px"
        onClick={props.onClick}
        style={baseSvgStyle(props)}
        fill={color}
      >
        <text
          fill={color}
          style={{ transform: 'translate(0px, 18px)', fontFamily: glyphAsciFontfamily, fontSize: '15px' }}
        >
          .mid
        </text>
      </svg>
    </Tooltip>
  );
}
