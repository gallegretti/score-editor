import React from 'react';
import { DynamicGlyphProps } from './dynamic';
import GenericDynamicGlyph from './generic-dynamic';

export default function MezzoPianoGlyph(props: DynamicGlyphProps) {
  return (
    <GenericDynamicGlyph width="30px" title="Mezzo Piano" {...props}></GenericDynamicGlyph>
  );
}
