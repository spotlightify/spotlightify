package device

import (
	"context"
	"fmt"
	"reflect"
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/model"
	"spotlightify-wails/backend/internal/templates"
	"spotlightify-wails/backend/internal/utils"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/zmb3/spotify/v2"
)

type mockSpotifyPlayer struct {
	devicesToReturn             []spotify.PlayerDevice
	playDevicesErrToReturn      error
	transferPlaybackErrToReturn error
	expectedDeviceID            string
}

func (m *mockSpotifyPlayer) PlayerDevices(ctx context.Context) ([]spotify.PlayerDevice, error) {
	return m.devicesToReturn, m.playDevicesErrToReturn
}

func (m *mockSpotifyPlayer) TransferPlayback(ctx context.Context, deviceID string) error {
	if deviceID != m.expectedDeviceID {
		return fmt.Errorf("expected device ID %s, got %s", m.expectedDeviceID, deviceID)
	}

	return m.transferPlaybackErrToReturn
}

type mockDeviceSetter struct {
	actualDeviceID string
}

func (m *mockDeviceSetter) SetDefaultDevice(deviceID string) {
	m.actualDeviceID = deviceID
}

func TestDeviceCommand_Execute(t *testing.T) {
	t.Run("Transfer playback to device", func(t *testing.T) {
		deviceID := "device_id"
		mockSpotifyPlayer := &mockSpotifyPlayer{
			expectedDeviceID: deviceID,
		}

		mockDeviceSetter := &mockDeviceSetter{}

		deviceCommand := &deviceCommand{
			spotifyPlayer: mockSpotifyPlayer,
			deviceSetter:  mockDeviceSetter,
		}

		parameters := map[string]string{"device_id": deviceID}

		output := deviceCommand.Execute(parameters, context.Background())
		assert.Equal(t, deviceID, mockDeviceSetter.actualDeviceID)
		expectedAction := builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{ClearCommandStack: true}).Build()
		assert.True(t, reflect.DeepEqual(output, model.ExecuteActionOutput{Action: expectedAction}))
	})

	t.Run("Transfer playback to device fails with no device id parameter", func(t *testing.T) {
		deviceID := "device_id"
		mockSpotifyPlayer := &mockSpotifyPlayer{
			expectedDeviceID: deviceID,
		}

		deviceCommand := &deviceCommand{
			spotifyPlayer: mockSpotifyPlayer,
		}

		parameters := map[string]string{}
		expectedOutput := model.ExecuteActionOutput{Suggestions: builders.NewSuggestionListBuilder().AddSuggestion(
			templates.ErrorSuggestion("There was an internal problem transferring playback", "No device ID was provided"),
		).Build()}
		output := deviceCommand.Execute(parameters, context.Background())

		assert.True(t, reflect.DeepEqual(output, expectedOutput))
	})

	t.Run("Transfer playback to device fails", func(t *testing.T) {
		deviceID := "device_id"
		err := fmt.Errorf("transfer playback error")
		mockSpotifyPlayer := &mockSpotifyPlayer{
			expectedDeviceID:            deviceID,
			transferPlaybackErrToReturn: err,
		}

		deviceCommand := &deviceCommand{
			spotifyPlayer: mockSpotifyPlayer,
		}

		parameters := map[string]string{"device_id": deviceID}
		expectedOutput := model.ExecuteActionOutput{Suggestions: builders.NewSuggestionListBuilder().AddSuggestion(
			templates.ErrorSuggestion("An error occurred transferring playback", "Please try again"),
		).Build()}
		output := deviceCommand.Execute(parameters, context.Background())

		assert.True(t, reflect.DeepEqual(output, expectedOutput))
	})
}

func TestDeviceCommand_GetSuggestions(t *testing.T) {
	sampleDevices := []spotify.PlayerDevice{
		{ID: "1", Name: "Test Device", Type: "Computer"},
		{ID: "2", Name: "Another Device", Type: "Smartphone"},
		{ID: "3", Name: "Speaker", Type: "Speaker"},
	}

	t.Run("Get device suggestions successfully", func(t *testing.T) {
		spotifyPlayer := mockSpotifyPlayer{
			devicesToReturn: sampleDevices,
		}

		deviceCommand := &deviceCommand{
			spotifyPlayer: &spotifyPlayer,
		}

		expectedTitles := []string{sampleDevices[0].Name, sampleDevices[1].Name, sampleDevices[2].Name}
		expectedDescriptions := []string{sampleDevices[0].Type, sampleDevices[1].Type, sampleDevices[2].Type}

		suggestions := deviceCommand.GetSuggestions("", make(map[string]string), context.Background())
		utils.AssertSuggestionTitlesAndDescriptions(t, suggestions, expectedTitles, expectedDescriptions)
	})

	t.Run("Get device suggestions with correct icons", func(t *testing.T) {
		spotifyPlayer := mockSpotifyPlayer{
			devicesToReturn: sampleDevices,
		}

		deviceCommand := &deviceCommand{
			spotifyPlayer: &spotifyPlayer,
		}

		suggestions := deviceCommand.GetSuggestions("", make(map[string]string), context.Background())
		for i, suggestion := range suggestions.Items {
			assert.Equal(t, suggestion.Icon, getIconByDeviceType(sampleDevices[i].Type))
		}
	})
}
