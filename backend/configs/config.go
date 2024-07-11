package configs

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"

	"spotlightify-wails/backend/internal/utils"

	"github.com/spf13/afero"
	"github.com/spf13/viper"
	"golang.org/x/oauth2"
)

const (
	DefaultPort                  = ":5000"
	ConfigRefreshTokenKey        = "spotifyRefreshToken"
	ConfigRequiresSpotifyAuthKey = "requiresSpotifyAuth"
	ConfigServerUrlKey           = "serverUrl"
	ConfigClientIDKey            = "clientID"
	ConfigClientSecretKey        = "clientSecret"
	ConfigSpotifyTokenKey        = "spotifyToken"
)

const (
	ReadConfigError  = "failed to read config file at location=%s"
	WriteConfigError = "failed to write config file to location=%s"
)

type SpotlightifyConfig struct {
	mu       sync.RWMutex
	config   *viper.Viper
	fs       afero.Fs
	fileName string
	dirPath  string
}

func (s *SpotlightifyConfig) setConfigValue(key string, value any) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.config.Set(key, value)
	s.config.WriteConfig()
}

func (s *SpotlightifyConfig) getConfigValue(key string) any {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.config.Get(key)
}

func (s *SpotlightifyConfig) GetRefreshTokenKey() string {
	return s.getConfigValue(ConfigRefreshTokenKey).(string)
}

func (s *SpotlightifyConfig) GetRequiresSpotifyAuthKey() bool {
	return s.getConfigValue(ConfigRequiresSpotifyAuthKey).(bool)
}

func (s *SpotlightifyConfig) SetRefreshTokenKey(value string) {
	s.setConfigValue(ConfigRefreshTokenKey, value)
}

func (s *SpotlightifyConfig) SetRequiresSpotifyAuthKey(value bool) {
	s.setConfigValue(ConfigRequiresSpotifyAuthKey, value)
}

func (s *SpotlightifyConfig) GetClientID() string {
	return s.getConfigValue(ConfigClientIDKey).(string)
}

func (s *SpotlightifyConfig) GetClientSecret() string {
	return s.getConfigValue(ConfigClientSecretKey).(string)
}

func (s *SpotlightifyConfig) SetSpotifyToken(token oauth2.Token) error {
	tokenBytes, err := json.Marshal(token)
	if err != nil {
		return err
	}
	s.setConfigValue(ConfigSpotifyTokenKey, string(tokenBytes))
	return nil
}

// When getting the token
func (s *SpotlightifyConfig) GetSpotifyToken() (*oauth2.Token, error) {
	tokenStr, ok := s.getConfigValue(ConfigSpotifyTokenKey).(string)
	if !ok {
		return nil, fmt.Errorf("failed to get token from config")
	}
	var token oauth2.Token
	err := json.Unmarshal([]byte(tokenStr), &token)
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func (s *SpotlightifyConfig) SetClientID(value string) {
	s.setConfigValue(ConfigClientIDKey, value)
}

func (s *SpotlightifyConfig) SetClientSecret(value string) {
	s.setConfigValue(ConfigClientSecretKey, value)
}

func (s *SpotlightifyConfig) setDefaultConfigValues() {
	s.config.SetDefault(ConfigRequiresSpotifyAuthKey, true)
	s.config.SetDefault(ConfigRefreshTokenKey, "")
	s.config.SetDefault(ConfigServerUrlKey, "")
	s.config.SetDefault(ConfigClientIDKey, "")
	s.config.SetDefault(ConfigClientSecretKey, "")
	s.config.SetDefault(ConfigSpotifyTokenKey, nil)
}

func (s *SpotlightifyConfig) createConfigFile() error {
	filePath := filepath.Join(s.dirPath, s.fileName)
	if _, err := s.fs.Stat(filePath); os.IsNotExist(err) {
		log.Printf("config file path does not exist: %v", s.dirPath)
		err := s.fs.MkdirAll(s.dirPath, os.ModePerm)
		if err != nil {
			panic(fmt.Sprintf("failed to create config file path at location= %v", err))
		}

		_, err = s.fs.Create(filePath)
		if err != nil {
			log.Fatalf(WriteConfigError, s.dirPath)
		}
		log.Printf("created config file at location= %v", filePath)
	}

	err := s.config.WriteConfig()
	if err != nil {
		log.Fatalf(WriteConfigError, s.dirPath)
	}
	return err
}

func InitialiseConfig(fs afero.Fs) *SpotlightifyConfig {
	config := viper.New()
	fileName := "config.json"
	config.SetConfigName(fileName)
	config.SetConfigType("json")
	config.SetFs(fs)

	configFileDir, err := utils.GetConfigFileDir(utils.RealEnvironment{})
	if err != nil {
		panic(fmt.Sprintf("failed to get config file path: %v", err))
	}
	config.AddConfigPath(configFileDir) // TODO ensure correct path

	spotlightifyConfig := &SpotlightifyConfig{config: config, fileName: fileName, dirPath: configFileDir, mu: sync.RWMutex{}, fs: fs}

	spotlightifyConfig.setDefaultConfigValues()

	err = config.ReadInConfig()
	if err != nil {
		log.Printf(ReadConfigError, configFileDir)
		err = spotlightifyConfig.createConfigFile()
		if err != nil {
			log.Fatalf("failed to write config file: %v", err)
		}
	}
	log.Printf("successfully read config file at location=%s", configFileDir)

	return spotlightifyConfig
}
