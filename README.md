# Tone

## What is this?

A silly single-serving website for playing about with the WebAudio API in JavaScript and making something approximating music.

## How do I use it?

Go to [ashe.org.uk/tone](https://ashe.org.uk/tone) and figure it out (it's easy I promise!)

## Is there a way to export a track?

Yes! Click the export button then the download button to retrieve the current track as a [JSON](https://www.json.org/json-en.html) file.

## I'm pretty proud of this track, can I add it?

Sure, submit a pull request. Tracks get added to `res/tracks.js`

## When I said export, I meant like an mp3 or a midi file or something

Oh. Well I can't help you with mp3, but midi export is supported!

There's a python script at `bin/tone2midi.py`

To use it, you'll probably need to install the requirements...

```bash
cd bin
pip install -r requirements.txt
```

Then you can run the thing

```bash
python tone2midi.py myAmazingTrack.json
```
