package configs

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"

	"github.com/spf13/afero"
	"github.com/spf13/viper"
	"github.com/spotlightify/spotlightify/internal/utils"
)

const (
	ConfigRefreshTokenKey        = "spotifyRefreshToken"
	ConfigRequiresSpotifyAuthKey = "requiresSpotifyAuth"
	ConfigServerUrlKey           = "serverUrl"
)

const (
	ReadConfigError  = "failed to read config file at location=%s"
	WriteConfigError = "failed to write config file to location=%s"
)

var (
	mu       sync.Mutex
	instance *viper.Viper
	once     sync.Once
)

type configDefaultSetter interface {
	SetDefault(key string, value any)
}

func setDefaultConfigValues(config configDefaultSetter) {
	config.SetDefault(ConfigRequiresSpotifyAuthKey, true)
	config.SetDefault(ConfigRefreshTokenKey, "")
	config.SetDefault(ConfigServerUrlKey, "")
}

type configWriter interface {
	WriteConfig() error
}

type writeConfigFileOptions struct {
	fileName     string
	dirPath      string
	configWriter configWriter
	fs           afero.Fs
}

func writeConfigFile(opts writeConfigFileOptions) error {
	filePath := filepath.Join(opts.dirPath, opts.fileName)
	if _, err := opts.fs.Stat(filePath); os.IsNotExist(err) {
		log.Printf("config file path does not exist: %v", opts.dirPath)
		err := opts.fs.MkdirAll(opts.dirPath, os.ModePerm)
		if err != nil {
			panic(fmt.Sprintf("failed to create config file path at location= %v", err))
		}

		_, err = opts.fs.Create(filePath)
		if err != nil {
			log.Fatalf(WriteConfigError, opts.dirPath)
		}
		log.Printf("created config file at location= %v", filePath)
	}

	err := opts.configWriter.WriteConfig()
	if err != nil {
		log.Fatalf(WriteConfigError, opts.dirPath)
	}
	return err
}

func InitialiseViper(fs afero.Fs) {
	once.Do(func() {
		instance = viper.New()
		fileName := "config.json"
		instance.SetConfigName(fileName)
		instance.SetConfigType("json")
		instance.SetFs(fs)

		setDefaultConfigValues(instance)

		configFileDir, err := utils.GetConfigFileDir(utils.RealEnvironment{})
		if err != nil {
			panic(fmt.Sprintf("failed to get config file path: %v", err))
		}
		instance.AddConfigPath(configFileDir) // TODO ensure correct path

		err = instance.ReadInConfig()
		if err != nil {
			log.Printf(ReadConfigError, configFileDir)
			err = writeConfigFile(writeConfigFileOptions{fileName: fileName, dirPath: configFileDir, configWriter: instance, fs: fs})
			if err != nil {
				log.Fatalf("failed to write config file: %v", err)
			}
		}
		log.Printf("successfully read config file at location=%s", configFileDir)
	})
}

func getViperInstance() *viper.Viper {
	if instance == nil {
		InitialiseViper(afero.NewOsFs())
	}
	return instance
}

func GetConfigValue(key string) any {
	return getViperInstance().Get(key)
}

func SetConfigValue(key string, value any) {
	mu.Lock()
	defer mu.Unlock()
	getViperInstance().Set(key, value)
	instance.WriteConfig()
}
