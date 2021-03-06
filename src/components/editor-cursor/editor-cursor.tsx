import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@mui/material';
import { Bounds } from '../../alphatab-types/alphatab-types';

interface EditorCursorProps {
  bounds?: Bounds;
  fret: number | null;
  setFret: (fret: number) => void;
  hasDialogOpen: boolean;
}

const padding = 2;

const newFretFromInput = (currentFret: number | null, newInput: number) => {
  if (currentFret === null) {
    return newInput;
  }
  let newFret;
  if (currentFret >= 0 && currentFret <= 9) {
    newFret = (currentFret * 10) + newInput;
  } else {
    newFret = newInput;
  }
  if (newFret >= 30) {
    newFret = newInput;
  }
  return newFret;
};

export default function EditorCursor(props: EditorCursorProps) {
  const theme = useTheme();

  const refocusCallback = useCallback((e: any) => {
    setTimeout(() => {
      e.target.focus();
    }, 10);
  }, []);

  const inputRef = useCallback((node: any) => {
    // Always refocus the input if there's no open dialog in the app
    if (node) {
      node.removeEventListener('focusout', refocusCallback);
      if (!props.hasDialogOpen) {
        node.addEventListener('focusout', refocusCallback);
      }
    }
  }, [props.hasDialogOpen, refocusCallback]);

  if (!props.bounds) {
    return <div />;
  }
  const FretInput = styled('input')({
    width: '10px',
    opacity: '0',
    // Hides the '+1' and '-1' input arrows
    MozAppearance: 'textfield',
    '&::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '&::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
  });
  return (
    <div
      id="editor-cursor"
      style={{
        position: 'absolute',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: `${theme.palette.mode === 'dark' ? 'white' : 'black'}`,
        left: `${props.bounds.x - padding}px`,
        top: `${props.bounds.y - padding}px`,
        zIndex: 1000,
        width: `${props.bounds.w + padding * 2}px`,
        height: `${props.bounds.h + padding * 2}px`,
        pointerEvents: 'none',
      }}
    >
      <FretInput
        ref={inputRef}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        type="number"
        onChange={(e) => {
          const newInput = Number.parseInt(e.target.value[e.target.value.length - 1], 10);
          props.setFret(newFretFromInput(props.fret, newInput));
        }}
      />
    </div>
  );
}
