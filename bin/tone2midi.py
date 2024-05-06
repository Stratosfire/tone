#!/usr/bin/env python3
from mido import *
import json
from pathlib import Path
import pandas as pd
import argparse
import math

pd.options.mode.copy_on_write = True

def noteToMidiNumber(inputNote):
    octave = int(inputNote[-1:])
    note = inputNote[0]
    isSharp = int("♯" in inputNote.replace("#", "♯"))
    chromaticScale = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
    
    return (12 * octave) + chromaticScale.index(note) + 3 + 9 + isSharp

def parseNoteDataToDataFrame(inputNoteData):
    return (pd.DataFrame(inputNoteData)
    .rename({0: "note", 1: "time", 2: "pattern"}, axis=1)
    .sort_values("time")
    .reset_index(drop=True))
    
def parseTrackData(inputTrackData):
    """
    Takes in track data which looks like this:
        {'notes': [['C6', 32],
            ['C6', 96],
            ['C6', 160],
            ['D2', 768],
            ['D2', 776]],
            'doublenotes': [],
            'halfnotes': [],
            'steps': 800,
            'duration': 0.08,
            'waveform': 'sawtooth',
            'octaves': 5,
            'startOctave': 2
        }
    
    Returns a dataframe with the following columns:
        note, time, noteLength, absolute_on, absolute_off
    
    """
    note_dataframes_array = []

    ## whole notes
    whole_df = parseNoteDataToDataFrame(inputTrackData["notes"])

    whole_df["noteLength"] = 2
    whole_df["absolute_on"] = whole_df["time"]
    whole_df["absolute_off"] = whole_df["time"] + 1

    note_dataframes_array.append(whole_df)

    ## double notes
    if len(inputTrackData.get("doublenotes", [])):
        double_df = parseNoteDataToDataFrame(inputTrackData["doublenotes"])

        double_df["noteLength"] = 4
        double_df["absolute_on"] = double_df["time"]
        double_df["absolute_off"] = double_df["time"] + 2

        note_dataframes_array.append(double_df)

    ## half notes
    if len(inputTrackData.get("halfnotes", [])):
        half_df = parseNoteDataToDataFrame(inputTrackData["halfnotes"])

        half_df["noteLength"] = 1

        half_df.loc[half_df["pattern"] == "01", "time"] = half_df["time"] + 0.5

        double_half_df = half_df[half_df["pattern"] == "11"]
        double_half_df["time"] = double_half_df["time"] + 0.5

        half_df = (
            pd.concat([half_df, double_half_df], ignore_index=True)
            .sort_values("time")
            .reset_index(drop=True)
        )
        
        half_df["absolute_on"] = half_df["time"]
        half_df["absolute_off"] = half_df["time"] + 0.5

        note_dataframes_array.append(half_df)

    all_notes_df = pd.concat(
        note_dataframes_array,
        ignore_index=True,
    ).sort_values(["time", "noteLength"])

    return all_notes_df

def generateMessagesDataframe(inputTrackData):
    """
    Takes in track data which looks like this:
        {'notes': [['C6', 32],
            ['C6', 96],
            ['C6', 160],
            ['D2', 768],
            ['D2', 776]],
            'doublenotes': [],
            'halfnotes': [],
            'steps': 800,
            'duration': 0.08,
            'waveform': 'sawtooth',
            'octaves': 5,
            'startOctave': 2
        }
    
    Returns a dataframe with the following columns:
        note, absolute_time, state, relative_time, message
    """
    all_notes_df = parseTrackData(inputTrackData)
    
    on_df = all_notes_df[["note", "absolute_on"]].rename({"absolute_on": "absolute_time"}, axis=1)
    on_df["state"] = "note_on"

    off_df = all_notes_df[["note", "absolute_off"]].rename({"absolute_off": "absolute_time"}, axis=1)
    off_df["state"] = "note_off"

    messages_df = pd.concat([
        on_df,
        off_df
    ], ignore_index=True).sort_values("absolute_time")

    messages_df["absolute_time"] = (messages_df["absolute_time"] * 1000).astype(int)
    messages_df["relative_time"] = messages_df["absolute_time"].diff()
    messages_df = messages_df.fillna(0)

    messages_df["message"] = messages_df.apply(lambda x: Message(
            x.state,
            note=noteToMidiNumber(x.note)+12, ## there's an off-by-twelve bug in here somewhere that this fixes
            velocity=127,
            time=int(x.relative_time)
        ),
        axis=1,
    )

    return messages_df.reset_index(drop=True)

def trackToMidi(inputTrackData):
    ## init midi object
    newMidi = MidiFile()
    track = MidiTrack()
    newMidi.tracks.append(track)

    ## set tempo
    track.append(MetaMessage('set_tempo', tempo=math.ceil(500000 * inputTrackData["duration"]), time=0))
    
    ## generate note on/off messages
    messages_df = generateMessagesDataframe(inputTrackData)

    for message in messages_df["message"]:
        track.append(message)
        
    track.append(MetaMessage("end_of_track", time=0))
    
    ## log some stats
    print(f"Created new track of length {newMidi.length}s")
    
    ## done
    return newMidi

if __name__ == '__main__':
    ## set up argparse stuff
    parser = argparse.ArgumentParser(
        prog="tone2midi",
        description="Takes in JSON in ashe.org.uk/tone format, returns a midi file"
    )
    
    parser.add_argument("input_json")
    args = parser.parse_args()
    
    ## do thing
    if Path(args.input_json).is_file():
        tone_data = json.loads(Path(args.input_json).read_text())
        outfilename = Path(args.input_json).stem + ".mid"
        if not Path(outfilename).is_file():
            trackToMidi(tone_data).save(outfilename)
            print(f"Writing to file {outfilename}")
        else:
            print(f"Output file {outfilename} already exists. Cowardly refusing to overwrite.")
            exit()
    else:
        print(f"Input file {args.input_json} not found, exiting")
        exit()