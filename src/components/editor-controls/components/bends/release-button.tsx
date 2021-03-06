import React from 'react';
import ReleaseBendGlyph from '../../icons/effects/bend/release-bend';
import HalfReleaseBendGlyph from '../../icons/effects/bend/half-release-bend';
import FullReleaseBendGlyph from '../../icons/effects/bend/full-release-bend';
import { BendType } from '../../../../editor/bend-type';
import GenericBendButton from './generic-bend-button';

interface ReleaseButtonProps {
  release: BendType;
  setRelease: (bendType: BendType) => void;
  disabled: boolean;
  isPopperOpen: boolean;
  setPopperOpen: () => void;
}

export default function ReleaseBendButton(props: ReleaseButtonProps) {
  return (
    <GenericBendButton
      currentBendType={props.release}
      setPopperOpen={props.setPopperOpen}
      default={ReleaseBendGlyph}
      half={HalfReleaseBendGlyph}
      full={FullReleaseBendGlyph}
      disabled={props.disabled}
      isPopperOpen={props.isPopperOpen}
      setCurrentBendType={props.setRelease}
    />
  );
}
