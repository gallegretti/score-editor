import React, { useState } from 'react';
import './App.css';
import {
  createTheme, ThemeProvider, PaletteMode, styled,
} from '@mui/material';
import SelectedNoteController from './editor/selected-note-controller';
import EventEmitter from './editor/ui-actions/event-emitter';
import { EditorUIEvent } from './editor/ui-actions/editor-ui-event';
import EditorActions from './editor/editor-actions/editor-command-delegator/editor-actions';
import { EditorActionResult } from './editor/editor-actions/editor-action-event';
import { EditorControls, BendState } from './components/editor-controls/editor-controls';
import EditorCursor from './components/editor-cursor/editor-cursor';
import EditorPlayerControls from './components/editor-player-controls/editor-player-controls';
import AlphaTabViewport from './components/alphatab-viewport/alphatab-viewport';
import { getBendState } from './editor/editor-actions/actions/set-bend/set-bend-lookup-table';
import { ColorModeContext } from './editor/color-mode-context';
import EditorLeftMenu from './components/editor-left-menu';
import {
  AccentuationType,
  AlphaTabApi,
  Beat,
  Chord,
  Duration,
  DynamicValue,
  HarmonicType,
  Note,
  PickStroke,
  Score,
  ScoreRenderer,
  Track,
} from './alphatab-types/alphatab-types';
import { DialogContext } from './editor/dialog-context';
import EditorActionDispatcher from './editor/editor-action-dispatcher';

function useForceUpdate() {
  const [_, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

const editorActions: EditorActions = new EditorActions();
let selectedNoteController!: SelectedNoteController;
let api!: AlphaTabApi;
const editorActionDispatcher = new EditorActionDispatcher(
  editorActions,
  selectedNoteController,
  () => {},
);

const Body = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : 'inherit',
  height: '100vh',
}));

export default function App() {
  const forceUpdate = useForceUpdate();
  const [hasDialog, setHasDialog] = useState(false);

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  const handlerActionResult = (result: EditorActionResult) => {
    if (result.requiresRerender) {
      api.render();
    }
    if (result.requiresMidiUpdate) {
      // loadMidiForScore is a private function.
      (api as any).loadMidiForScore();
    }
  };

  const setupWithApi = (newApi: AlphaTabApi) => {
    api = newApi;
    // eslint-disable-next-line no-new
    new EventEmitter(api.renderer as ScoreRenderer, onEditorUIEvent);
    selectedNoteController = new SelectedNoteController(api.renderer as ScoreRenderer);
    editorActionDispatcher.api = newApi;
    editorActionDispatcher.onResult = handlerActionResult;
    editorActionDispatcher.selectedNoteController = selectedNoteController;
    forceUpdate();
  };

  const onEditorUIEvent = (UIeventData: EditorUIEvent) => {
    console.log(UIeventData);
    if (UIeventData.type === 'string-mouse-down') {
      selectedNoteController.setSelectedSlot({
        string: UIeventData.data.stringNumber,
        beat: UIeventData.data.beat,
      });
    }
    if (UIeventData.type === 'note-mouse-down') {
      selectedNoteController.toggleNoteSelection(UIeventData.data.note);
    }
    if (UIeventData.type === 'delete-selected-note') {
      editorActionDispatcher.removeNote();
    }
    if (UIeventData.type === 'move-cursor-right' && selectedNoteController.hasSelectedSlot()) {
      UIeventData.rawEvent.preventDefault();
      const moved = selectedNoteController.moveSelectedNoteRight();
      if (!moved) {
        editorActionDispatcher.addBeat();
      }
    }
    if (UIeventData.type === 'move-cursor-left' && selectedNoteController.hasSelectedSlot()) {
      UIeventData.rawEvent.preventDefault();
      selectedNoteController.moveSelectedNoteLeft();
    }
    if (UIeventData.type === 'move-cursor-up' && selectedNoteController.hasSelectedSlot()) {
      UIeventData.rawEvent.preventDefault();
      selectedNoteController.moveSelectedNoteUp();
    }
    if (UIeventData.type === 'move-cursor-down' && selectedNoteController.hasSelectedSlot()) {
      UIeventData.rawEvent.preventDefault();
      selectedNoteController.moveSelectedNoteDown();
    }
    if (UIeventData.type === 'deselect-cursor' && selectedNoteController.hasSelectedSlot()) {
      UIeventData.rawEvent.preventDefault();
      selectedNoteController.setSelectedSlot(null);
    }
    if (UIeventData.type === 'undo-action') {
      editorActionDispatcher.undo();
    }
    if (UIeventData.type === 'redo-action') {
      editorActionDispatcher.redo();
    }

    forceUpdate();
  };

  // Helpers
  const hasSelectedNote = (): boolean => !!selectedNoteController?.getSelectedSlot()?.note;

  const hasSelectedBeat = (): boolean => !!selectedNoteController?.getSelectedSlot()?.beat;

  const selectedBeat = (): Beat | null => selectedNoteController?.getSelectedSlot()?.beat ?? null;

  const selectedNote = (): Note | null => selectedNoteController?.getSelectedSlot()?.note ?? null;

  const onAlphatabRenderFinished = () => {
    // TODO: It looks like alphaTab will emit the render finished event before it finishes updating the boundsLookup.
    // Needs to investigate if that's the case or something else, and how to remove this timeout
    setTimeout(() => {
      forceUpdate();
    }, 50);
  };

  const playPause = () => {
    api.playPause();
    forceUpdate();
  };

  const setCountIn = (countIn: boolean) => {
    if (api) {
      api.countInVolume = countIn ? 1 : 0;
      forceUpdate();
    }
  };

  const setMetronome = (metronome: boolean) => {
    if (api) {
      api.metronomeVolume = metronome ? 1 : 0;
      forceUpdate();
    }
  };

  const currentSelectedBend = (): BendState | null => {
    const note = selectedNote();
    if (!note) {
      return null;
    }
    return getBendState(note);
  };

  const currentFret = (): number | null => selectedNoteController?.getSelectedNote()?.fret ?? null;

  const currentSelectedBeatText = (): string | null => selectedBeat()?.text ?? null;

  const isCurrentSelectedNotePalmMute = (): boolean => selectedNote()?.isPalmMute ?? false;

  const isCurrentSelectedNoteTie = (): boolean => selectedNote()?.isTieOrigin ?? false;

  const isLeftHandTapNote = (): boolean => selectedNote()?.isLeftHandTapped ?? false;

  const isVibrato = (): boolean => selectedNote()?.vibrato !== 0 ?? false;

  const currentSelectedBeatDuration = (): Duration | null => selectedBeat()?.duration ?? null;

  const currentSelectedBeatDynamics = (): DynamicValue | null => selectedBeat()?.dynamics ?? null;

  const currentSelectedBeatPickStroke = (): PickStroke | null => selectedBeat()?.pickStroke ?? null;

  const currentSelectedNoteIsGhost = (): boolean | null => selectedNote()?.isGhost ?? null;

  const currentSelectedNoteAccentuation = (): AccentuationType | null => selectedNote()?.accentuated ?? null;

  const currentSelectedNoteHarmonicType = (): HarmonicType | null => selectedNote()?.harmonicType ?? null;

  const currentChord = () : Chord | null => selectedNote()?.beat.chord ?? null;

  const currentSelectedNoteDead = (): boolean | null => selectedNote()?.isDead ?? null;

  const currentSelectedNoteHammerOrPull = (): boolean | null => selectedNote()?.isHammerPullOrigin ?? null;

  const currentSelectedNoteSlide = (): boolean | null => (selectedNote()?.slideOutType ?? 0) > 0;

  const currentAvailableChords = (): Chord[] => {
    const chords = api?.score?.tracks[0].staves[0].chords;
    return Array.from(chords?.values() ?? []);
  };

  const print = () => {
    api.print('', null);
  };

  const score = (): Score | null => api?.score;

  const setVolume = (volume: number) => {
    api.masterVolume = volume;
  };

  const setSpeed = (speed: number) => {
    api.playbackSpeed = speed;
  };

  const selectTrack = (track: Track) => {
    api.renderTracks([track]);
    setSelectedTrackIndex(track.index);
    const lineCount = track.staves[0]?.standardNotationLineCount;
    if (lineCount) {
      selectedNoteController.setNumberOfStrings(lineCount);
    }
  };

  const openFile = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      api.load(event.target?.result, [0]);
    };
    fileReader.readAsArrayBuffer(file);
  };

  const exportGuitarPro = () => {
    const exporter = new alphaTab.exporter.Gp7Exporter();
    const data = exporter.export(api.score!, api.settings);
    const a = document.createElement('a');
    a.download = `${api?.score?.title || 'File'}.gp`;
    a.href = URL.createObjectURL(new Blob([data]));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const newFile = () => {
    api.tex('\\title \'New score\' . 3.3.4');
  };

  const exportMidi = () => {
    api.downloadMidi();
  };

  const [paletteMode, setPaletteMode] = useState<PaletteMode>('dark');

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setPaletteMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () => createTheme({
      palette: {
        mode: paletteMode,
      },
    }),
    [paletteMode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <DialogContext.Provider value={{ hasDialog, setHasDialog }}>
        <ThemeProvider theme={theme}>
          <Body>
            <div className="app-container">
              <div className="app-content">
                <EditorLeftMenu
                  score={api?.score}
                  onNewTrack={editorActionDispatcher.newTrack}
                  selectedTrackIndex={selectedTrackIndex}
                  selectTrack={selectTrack}
                />
                <div className="app-editor-controls">
                  <EditorControls
                    newFile={newFile}
                    open={openFile}
                    isDeadNote={currentSelectedNoteDead()}
                    score={score()}
                    currentHarmonicType={currentSelectedNoteHarmonicType()}
                    currentPickStroke={currentSelectedBeatPickStroke()}
                    setChord={editorActionDispatcher.setChord}
                    setText={editorActionDispatcher.setText}
                    setScoreInfo={editorActionDispatcher.setScoreInfo}
                    setHarmonicType={editorActionDispatcher.setHarmonicType}
                    setTempo={editorActionDispatcher.setTempo}
                    setDeadNote={editorActionDispatcher.setDeadNote}
                    setPickStroke={editorActionDispatcher.setPickStroke}
                    setAccentuationNote={editorActionDispatcher.setAccentuationNote}
                    setGhostNote={editorActionDispatcher.setGhostNote}
                    setHammer={editorActionDispatcher.setHammer}
                    setSlide={editorActionDispatcher.setSlide}
                    setVibrato={editorActionDispatcher.setVibratoNote}
                    setDynamics={editorActionDispatcher.setDynamics}
                    setTap={editorActionDispatcher.setTapNote}
                    setTie={editorActionDispatcher.setTieNote}
                    setDuration={editorActionDispatcher.setDuration}
                    togglePalmMute={editorActionDispatcher.togglePalmMute}
                    undo={editorActionDispatcher.undo}
                    redo={editorActionDispatcher.redo}
                    setBend={editorActionDispatcher.setBend}
                    currentChord={currentChord()}
                    isGhost={currentSelectedNoteIsGhost()}
                    isLeftHandTapNote={isLeftHandTapNote()}
                    isVibrato={isVibrato()}
                    isHammerOrPull={currentSelectedNoteHammerOrPull()}
                    isSlide={currentSelectedNoteSlide()}
                    isTie={isCurrentSelectedNoteTie()}
                    currentAccentuation={currentSelectedNoteAccentuation()}
                    hasSelectedBeat={hasSelectedBeat()}
                    currentDynamics={currentSelectedBeatDynamics()}
                    currentDuration={currentSelectedBeatDuration()}
                    currentBend={currentSelectedBend()}
                    currentAvailableChords={currentAvailableChords()}
                    exportGuitarPro={exportGuitarPro}
                    exportMidi={exportMidi}
                    print={print}
                    hasSelectedNote={hasSelectedNote()}
                    isPalmMute={isCurrentSelectedNotePalmMute()}
                    currentText={currentSelectedBeatText()}
                    canRedo={editorActions.canRedo()}
                    canUndo={editorActions.canUndo()}
                  />
                </div>
                <AlphaTabViewport
                  apiReady={setupWithApi}
                  renderFinished={onAlphatabRenderFinished}
                  playerStateChanged={() => forceUpdate()}
                >
                  <EditorCursor
                    hasDialogOpen={hasDialog}
                    fret={currentFret()}
                    setFret={editorActionDispatcher.setFret}
                    bounds={selectedNoteController?.getNoteBounds()}
                  />
                </AlphaTabViewport>
              </div>
              <EditorPlayerControls
                onSpeedChange={setSpeed}
                onVolumeChange={setVolume}
                playPause={playPause}
                onCountInChange={setCountIn}
                onMetronomeChange={setMetronome}
                isCountIn={api?.countInVolume !== 0}
                isMetronome={api?.metronomeVolume !== 0}
                isPlaying={api?.playerState === 1}
              />
            </div>
          </Body>
        </ThemeProvider>
      </DialogContext.Provider>
    </ColorModeContext.Provider>
  );
}
