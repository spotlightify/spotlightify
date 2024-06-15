package configs

import (
	"github.com/spf13/viper"
)

// Config represents the application configuration.
type Config struct {
	SpotifyAccessToken string `mapstructure:"spotify_access_token"`
}

// LoadConfig loads the configuration from a file.
func LoadConfig() (*Config, error) {
	// Set the default values for the configuration
	viper.SetDefault("spotify_access_token", "")

	// Set the name of the config file (e.g., config.yaml)
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")

	// Add the path to the directory where the config file is located
	viper.AddConfigPath("/path/to/config/directory")

	// Read the configuration file
	err := viper.ReadInConfig()
	if err != nil {
		return nil, err
	}

	// Unmarshal the configuration into a struct
	var config Config
	err = viper.Unmarshal(&config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}
