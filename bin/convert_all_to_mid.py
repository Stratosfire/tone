import tone2midi as t2m
from pathlib import Path
import json
from os import mkdir

if __name__ == '__main__':
    trackDataDict = json.loads(Path("../res/tracks.js").read_text().replace("var tracks = ", ""))

    mkdir("converted_midi")

    for trackName, trackData in trackDataDict.items():
        t2m.trackToMidi(trackData).save(f"converted_midi/{trackName}.mid")