import React, { useState } from 'react';
import { Slider, styled } from '@mui/material';
import { useGlyphColor } from '../editor-controls/icons/glyphColor';

interface VolumeControlProps {
    volume: number,
    setVolume: (arg: number) => void,
}

function VolumeOn() {
  const color = useGlyphColor({ disabled: false, selected: false });
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill={color}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function VolumeOff() {
  const color = useGlyphColor({ disabled: false, selected: false });
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill={color}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

const VolumeControlsDiv = styled('div')(() => ({
  display: 'flex',
  width: '140px',
  gap: '20px',
}));

export function VolumeControlComponent(props: VolumeControlProps) {
  const [previousVolume, setPreviousVolume] = useState(0.5);
  // const theme = useTheme();

  const volumeOff = () => {
    props.setVolume(0);
  };

  const volumeOn = () => {
    const newVolume = previousVolume === 0 ? 0.5 : previousVolume;
    props.setVolume(newVolume);
  };

  const setVolume = (volume: number) => {
    setPreviousVolume(props.volume);
    props.setVolume(volume);
  };

  return (
    <VolumeControlsDiv>
      {props.volume !== 0
        ? <div onClick={volumeOff}><VolumeOn /></div>
        : <div onClick={volumeOn}><VolumeOff /></div>}
      <Slider
        size="small"
        value={props.volume}
        min={0}
        max={1}
        step={0.05}
        onChange={(event, volume) => setVolume(volume as number)}
      />
    </VolumeControlsDiv>
  );
}
