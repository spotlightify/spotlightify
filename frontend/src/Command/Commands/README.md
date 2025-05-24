# Playback Commands

This directory contains various commands for controlling Spotify playback.

## Common Patterns

### executePlaybackAction Utility

The `executePlaybackAction` utility function in `utils.ts` encapsulates the common pattern used across playback commands. It handles:

1. Hiding the application window
2. Executing the playback action
3. Resetting the prompt on success
4. Handling errors with optional device error retry logic
5. Showing the window again on error

### Usage

#### For Simple Playback Commands

Commands like pause, resume, next, previous, etc. that don't need device error retry:

```typescript
action: async (actions) => {
  await executePlaybackAction({
    playbackAction: () => Pause(),
    opName: "Pause",
    actions,
    enableDeviceErrorRetry: false, // Default is false
  });
  return Promise.resolve();
};
```

#### For Complex Playback Commands

Commands like play, queue, playlist that need device error retry logic:

```typescript
action: async (actions) => {
  await executePlaybackAction({
    playbackAction: () => PlayTrack(track.uri),
    opName: "Play Track",
    actions,
    enableDeviceErrorRetry: true, // Enables device error retry
  });
  return Promise.resolve();
};
```

### Before/After Comparison

#### Before (Complex Error Handling)

```typescript
action: async (actions) => {
  HideWindow();
  try {
    await PlayTrack(track.uri);
    actions.resetPrompt();
  } catch (e) {
    HandleGenericError({
      opName: "Play Track",
      error: e,
      actions: actions,
      specificErrorCallback: {
        DEVICE_ERROR: async () => {
          try {
            await PlayTrack(track.uri);
            HideWindow();
            actions.resetPrompt();
          } catch (e) {
            HandleGenericError({
              opName: "Play Track",
              error: e,
              actions: actions,
            });
          }
        },
      },
    });
    ShowWindow();
  }
  return Promise.resolve();
};
```

#### After (Using executePlaybackAction)

```typescript
action: async (actions) => {
  await executePlaybackAction({
    playbackAction: () => PlayTrack(track.uri),
    opName: "Play Track",
    actions,
    enableDeviceErrorRetry: true,
  });
  return Promise.resolve();
};
```

### Parameters

- `playbackAction`: Function that executes the actual playback command
- `opName`: Human-readable operation name for error messages
- `actions`: SpotlightifyActions object for UI control
- `enableDeviceErrorRetry`: Boolean flag to enable automatic retry on device errors

### Benefits

1. **Reduced code duplication**: No need to repeat error handling logic
2. **Consistent behavior**: All playback commands behave the same way
3. **Easier maintenance**: Error handling logic is centralized
4. **Fewer bugs**: Less room for mistakes in implementing the pattern
5. **Better readability**: Actions focus on their core functionality
