import { AlphaTabApi } from '@coderline/alphatab';
import {
  AccentuationType,
  Beat,
  Chord,
  Duration,
  DynamicValue,
  HarmonicType,
  Note,
} from '../alphatab-types/alphatab-types';
import { BendState } from '../components/editor-controls/editor-controls';
import { ScoreInfo } from './editor-actions/actions/set-score-info/score-info';
import { EditorActionEvent, EditorActionResult } from './editor-actions/editor-action-event';
import EditorActions from './editor-actions/editor-command-delegator/editor-actions';
import SelectedNoteController from './selected-note-controller';

class EditorActionDispatcher {
  constructor(
    public actions: EditorActions,
    public selectedNoteController: SelectedNoteController,
    public onResult: (arg0: EditorActionResult) => void,
  ) {
  }

  public api: AlphaTabApi | undefined;

  selectedBeat = (): Beat | null => this.selectedNoteController?.getSelectedSlot()?.beat ?? null;

  selectedNote = (): Note | null => this.selectedNoteController?.getSelectedSlot()?.note ?? null;

  dispatchAction = (action: EditorActionEvent) => {
    const result = this.actions.doAction(action);
    this.onResult(result);
  };

  setHammer = (hammerOrPull: boolean): void => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-hammer', data: { note, hammerOrPull } });
  };

  setSlide = (slide: boolean): void => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-slide', data: { note, slide } });
  };

  setDynamics = (dynamics: DynamicValue): void => {
    const beat = this.selectedNoteController?.getSelectedSlot()?.beat;
    if (!beat) {
      return;
    }
    this.dispatchAction({ type: 'set-dynamics', data: { beat, dynamics } });
  };

  setTempo = (tempo: number): void => {
    if (!this.api?.score) {
      return;
    }
    this.dispatchAction({ type: 'set-tempo', data: { tempo, score: this.api.score } });
  };

  setGhostNote = (isGhost: boolean): void => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-ghost-note', data: { note, isGhost } });
  };

  setAccentuationNote = (accentuation: AccentuationType): void => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-accentuation', data: { note, accentuation } });
  };

  setPickStroke = (pickStroke: number): void => {
    const beat = this.selectedBeat();
    if (!beat) {
      return;
    }
    this.dispatchAction({ type: 'set-pick-stroke', data: { beat, pickStroke } });
  };

  setHarmonicType = (harmonicType: HarmonicType): void => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-harmonic', data: { note, harmonic: harmonicType } });
  };

  setScoreInfo = (scoreInfo: ScoreInfo) => {
    const score = this.api?.score;
    if (!score) {
      return;
    }
    this.dispatchAction({ type: 'set-score-info', data: { score, scoreInfo } });
  };

  setDuration = (duration: Duration) => {
    const beat = this.selectedBeat();
    if (!beat) {
      return;
    }
    this.dispatchAction({ type: 'set-duration', data: { beat, duration } });
  };

  setDeadNote = (value: boolean) => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-dead-note', data: { note, isDeadNote: value } });
  };

  setTapNote = (value: boolean) => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-tap', data: { note, isLeftHandTap: value } });
  };

  setTieNote = (value: boolean) => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-tie', data: { note, tie: value } });
  };

  setVibratoNote = (value: boolean) => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-vibrato', data: { note, isVibrato: value } });
  };

  setText = (text: string) => {
    const beat = this.selectedNoteController.getSelectedSlot()?.beat;
    if (!beat) {
      return;
    }
    this.dispatchAction({ type: 'set-text', data: { text, beat } });
  };

  setBend = (bend: BendState) => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-bend', data: { ...bend, note } });
  };

  togglePalmMute = () => {
    const note = this.selectedNote();
    if (!note) {
      return;
    }
    this.dispatchAction({ type: 'set-palm-mute', data: { note, isPalmMute: !note.isPalmMute } });
  };

  newTrack = (params: { name: string }) => {
    if (!this.api?.score) {
      return;
    }
    this.dispatchAction({ type: 'add-track', data: { score: this.api.score, track: { name: params.name } } });
  };

  setFret = (fret: number) => {
    const selectedSlot = this.selectedNoteController.getSelectedSlot();
    if (!selectedSlot) {
      return;
    }
    if (selectedSlot?.note) {
      this.dispatchAction({ type: 'set-fret', data: { note: selectedSlot.note, fret } });
    } else {
      const note = new alphaTab.model.Note();
      note.fret = fret;
      note.string = selectedSlot?.string;
      this.dispatchAction({ type: 'add-note', data: { beat: selectedSlot.beat, note } });
      this.selectedNoteController.updateCurrentSelection();
    }
  };

  removeNote = () => {
    const currentSelectedNote = this.selectedNote();
    if (currentSelectedNote) {
      this.dispatchAction({ type: 'remove-note', data: { note: currentSelectedNote } });
      this.selectedNoteController.setSelectedSlot(null);
    }
  };

  addBeat = () => {
    const currentBeat = this.selectedNoteController.getSelectedSlot()?.beat;
    if (currentBeat) {
      if (currentBeat.voice.beats.length === currentBeat.voice.bar.masterBar.timeSignatureNumerator) {
        const currentBar = currentBeat.voice.bar;
        this.dispatchAction({ type: 'add-bar', data: { currentBar } });
      } else {
        const newBeat = new alphaTab.model.Beat();
        this.dispatchAction({ type: 'add-beat', data: { currentBeat, newBeat } });
      }
    }
  };

  setChord = (chord: Chord) => {
    const currentBeat = this.selectedNoteController.getSelectedSlot()?.beat;
    if (currentBeat) {
      this.dispatchAction({ type: 'set-chord', data: { beat: currentBeat, chord } });
    }
  };

  undo = () => {
    const actionResult = this.actions.undoAction();
    this.onResult(actionResult);
  };

  redo = () => {
    const actionResult = this.actions.redoAction();
    this.onResult(actionResult);
  };
}

export default EditorActionDispatcher;
