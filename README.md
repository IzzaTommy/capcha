# CapCha

**CapCha** is an Electron-based screen recorder for Windows, built on OBS Studio and WebSocket.

## Contents

1. [Premise](#premise)
2. [Features](#features)
3. [Issues](#issues)
4. [Thanks](#thanks)

## Premise

There are a lot of great screen recording programs out there, many of which I have used in the past. However, I was unable to achieve the desired recording fidelity and feature set with these programs. This is my personal project designed to tackle these issues and gain experience working with new web technologies, APIs, and LLMs for development.

In particular, I needed a program that could:

- [Record screens](#record-screens) with customizable video parameters (FPS, bitrate, resolution, etc.).
- [Playback videos](#playback-videos) intuitively and precisely.
- [Create clips](#create-clips) with downscaled video parameters and other size-saving measures.
- [Update](#update) in the future for bug fixes and new features.

## Features

### Record Screens

- Can select which display to record.
- Can change the recording format, encoder, resolution, framerate, and bitrate.
- Can automatically begin recording when certain programs are running.

### Playback Videos

- Has a familiar and intuitive UI for video media controls.
- Has a video timeline for precise seeking.
- Can adjust the video playback rate for slower / faster playback.

### Create Clips

- Can change the clip format and resolution.
- Can create video clips with reduced bitrate, framerate, and audio channels for smaller video files for sharing.

### Update

- Can be updated in the future for bug fixes and new features as a public project.

## Issues

### Bugs

- The timeline slider may extend beyond the bounds of the document, causing a horizontal scroll bar to appear.
- Cannot use left and right arrows on text inputs to move the caret (The thin vertical line indicating the place in the text).
- Adding multiple videos at once to the captures or clips directory will cause the gallery to desync from the actual contents of the directory.
- If **CapCha** is recording, the computer cannot be suspended (On Windows, it will stay on with a black screen).
- On **CapCha**’s first run, OBS will NOT use the default settings for the capture format (.mp4) and possibly the encoder (NVIDIA NVENC H.264) and bitrate (3000 kbps). Subsequent runs SHOULD use the default settings and allow them to be changed.
- On **CapCha**'s first run, Windows will prompt to allow the program through the firewall. If not accepted in time, CapCha will fail to run (You can accept, then restart to fix this).
- When clipping, the timeline slider may run past the clip bounds when viewing the clip.
- **CapCha** has no installer because an installation location hasn't been decided. The default would be the ProgramFiles folder, but this requires **CapCha** to be run as an administrator to function (Since OBS Studio requires elevated permissions to create / write configuration files). Running web-based applications as administrator is NOT a good idea, so **CapCha** is provided in an extractable ZIP file.

### Future Additions

- Keyboard navigation accessibility.
- Screenshot functionality. (?)
- Setting to record a specific game versus the entire desktop screen.
- Setting for having multiple speaker and microphone inputs.
- Setting for a webcam input. (?)
- Settings for customizing recording / video playback hotkeys.
- Setting for adjusting visual scaling of the program.
- Setting for adjusting the transition speed of animations.
- Dark / Light mode following system preferences.
- Visual loading “placeholders” for loading content, like the video previews and certain labels.
- Hovering video previews to show expanded information, like video metadata and in-game information.
- Checkmark / X icon for the content status label, depending on the program status.
- Functionality to piece multiple clips together into a single video.
- Changing the OBS Studio task bar icon for clarity and preventing it from opening OBS itself.
- Functionality to reorganize / update the auto recording programs list.

(?) - May not be added

## Other Notes

- **CapCha** is not signed (This is just a small project for experience that I plan to use for myself, so use at your own risk).

## Included Works

Thanks to the contributors of OBS Studio and related works for building and supporting a powerful open-source tool.

- OBS Studio ([Website](https://obsproject.com)) ([GitHub Repo](https://github.com/obsproject/obs-studio))
- OBS WebSocket ([GitHub Repo](https://github.com/obsproject/obs-websocket))

Thanks to the contributors of FFmpeg and to GyanD for providing static builds.

- FFmpeg ([Website](https://ffmpeg.org/)) ([GitHub Repo](https://github.com/FFmpeg/FFmpeg))
- Static FFmpeg Builds ([Website](https://gyan.dev/ffmpeg)) ([GitHub Repo](https://github.com/GyanD/codexffmpeg))

Many icons used in **CapCha** were provided by Material Design.

- Material Design ([Website](https://fonts.google.com/icons)) ([GitHub Repo](https://github.com/google/material-design-icons))