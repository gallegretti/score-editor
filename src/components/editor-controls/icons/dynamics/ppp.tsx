import React from 'react';
import { DynamicGlyphProps } from './dynamic';
import GenericDynamicGlyph from './generic-dynamic';

export default function PianoPianissimoGlyph(props: DynamicGlyphProps) {
  return (
    <GenericDynamicGlyph width="35px" title="Piano Pianissimo" {...props}></GenericDynamicGlyph>
  );
}
