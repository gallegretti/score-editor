import React from 'react';
import { DurationGlyphProps } from './duration';
import { useGlyphColor } from '../glyphColor';
import { baseSvgStyle } from '../glyphBaseSvgStyle';
import { genericDurationFontSize } from './generic-duration';
import { Tooltip } from '@mui/material';

export function WholeGlyph(props: DurationGlyphProps) {
    const color = useGlyphColor(props);
    return (
        <Tooltip title={"Whole"}>
            <svg onClick={props.onClick} height="35px" width="12px" xmlns="http://www.w3.org/2000/svg" style={baseSvgStyle(props)}>
                <text fill={color} style={{ transform: 'translate(0px, 29px)', fontSize: genericDurationFontSize }}></text>
            </svg>
        </Tooltip>
    );
}