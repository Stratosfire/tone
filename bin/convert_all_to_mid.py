import tone2midi as t2m
from pathlib import Path
import json
from os import mkdir

if __name__ == '__main__':
    trackDataDict = json.loads(Path("../res/tracks.js").read_text().replace("var tracks = ", ""))

    mkdir("converted_midi")
    
    successCount = 0
    failedArray = []

    for trackName, trackData in trackDataDict.items():
        try:
            t2m.trackToMidi(trackData).save(f"converted_midi/{trackName}.mid")
            print(f"Successfully converted {trackName}")
            successCount += 1
        except Exception as e:
            print(f"Skipping {trackName}")
            print(e)
            failedArray.append(trackName)
            
    print(f"Successfully converted {successCount} of {len(trackDataDict.items())} tracks")
    print(f"Failed tracks:\n\t{'\n\t'.join(failedArray)}")