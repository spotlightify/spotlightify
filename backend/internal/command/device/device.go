package device

import (
	"context"
	"fmt"
	"log/slog"
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	"spotlightify-wails/backend/internal/templates"

	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"
)

var commandModel = model.Command{
	ID:          "device",
	Name:        "Device",
	Description: "Select default device for active playback",
	Icon:        constants.GetIconAddress(constants.IconDevice),
	TriggerWord: "device",
	Properties: model.CommandProperties{
		DebounceMS:      0,
		Title:           "Device",
		ShorthandTitle:  "📱",
		PlaceholderText: "Filter for device",
	},
}

type defaultDeviceSetter interface {
	SetDefaultDevice(deviceID string)
}

type spotifyPlayer interface {
	PlayerDevices(ctx context.Context) ([]spotify.PlayerDevice, error)
	TransferPlayback(ctx context.Context, deviceID string) error
}

type deviceCommand struct {
	command       model.Command
	spotifyPlayer spotifyPlayer
	deviceSetter  defaultDeviceSetter
}

// Possible device types: "Computer", "Smartphone" or "Speaker"
func getIconByDeviceType(deviceType string) string {
	switch deviceType {
	case "Computer":
		return constants.GetIconAddress(constants.IconComputer)
	case "Speaker":
		return constants.GetIconAddress(constants.IconSpeaker)
	default:
		return constants.GetIconAddress(constants.IconSmartphone)
	}
}

func (d *deviceCommand) GetSuggestions(input string, parameters map[string]string, ctx context.Context) model.SuggestionList {
	slb := builders.NewSuggestionListBuilder()
	devices, err := d.spotifyPlayer.PlayerDevices(ctx)
	if err != nil {
		slog.Error(err.Error())
		return *slb.AddSuggestion(
			templates.ErrorSuggestion("Could not retrieve devices", err.Error()),
		).Build()
	}

	if len(devices) == 0 {
		return *slb.AddSuggestion(
			templates.ErrorSuggestion("No devices found", "Please start a spotify session on a device and click here to refresh search"),
		).Build()
	}

	for _, device := range devices {
		slb.AddSuggestion(model.Suggestion{
			Title:       device.Name,
			Description: device.Type,
			Icon:        getIconByDeviceType(device.Type),
			ID:          device.ID.String(),
			Action: builders.NewActionBuilder().WithExecuteAction(
				&model.ExecuteAction{
					CommandId: commandModel.ID,
					ExecutionParameters: map[string]string{
						"device_id": device.ID.String(),
					},
				},
			).Build(),
		})
	}

	return *slb.WithFilter().Build()
}

func (d *deviceCommand) GetPlaceholderSuggestion() model.Suggestion {
	return model.Suggestion{
		Title:       "Device",
		Description: "Select default device for active playback",
		Icon:        constants.GetIconAddress(constants.IconDevice),
		ID:          "device-command",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCommand: &model.Command{
				ID:         commandModel.ID,
				Properties: commandModel.Properties,
			},
		}).Build(),
	}
}

func (d *deviceCommand) Execute(parameters map[string]string, ctx context.Context) model.ExecuteActionOutput {
	deviceID, ok := parameters["device_id"]
	if !ok {
		return model.ExecuteActionOutput{Suggestions: builders.NewSuggestionListBuilder().AddSuggestion(
			templates.ErrorSuggestion("There was an internal problem transferring playback", "No device ID was provided"),
		).Build()}
	}
	err := d.spotifyPlayer.TransferPlayback(ctx, deviceID)
	if err != nil {
		slog.Error(fmt.Sprintf("Error transferring playback: %v", err))
		return model.ExecuteActionOutput{Suggestions: builders.NewSuggestionListBuilder().AddSuggestion(
			templates.ErrorSuggestion("An error occurred transferring playback", "Please try again"),
		).Build()}
	}

	d.deviceSetter.SetDefaultDevice(deviceID)

	return model.ExecuteActionOutput{
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{ClearCommandStack: true}).Build(),
	}
}

type spotifyDeviceBridge struct {
	holder *spot.SpotifyClientHolder
}

func (s *spotifyDeviceBridge) PlayerDevices(ctx context.Context) ([]spotify.PlayerDevice, error) {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return []spotify.PlayerDevice{}, fmt.Errorf("spotify device error: %v", err)
	}

	return client.PlayerDevices(ctx)
}

func (s *spotifyDeviceBridge) TransferPlayback(ctx context.Context, deviceID string) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return err
	}

	id := spotify.ID(deviceID)
	err = client.TransferPlayback(ctx, id, false)
	if err != nil {
		return err
	}

	return nil
}

func RegisterDeviceCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder, deviceIdSetter defaultDeviceSetter) {
	player := &spotifyDeviceBridge{holder: spotifyHolder}

	deviceCommand := &deviceCommand{command: commandModel, spotifyPlayer: player, deviceSetter: deviceIdSetter}
	commandRegistry.Register(commandModel.ID, "device", deviceCommand)
}
