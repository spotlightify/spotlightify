package utils

import (
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"runtime"
)

const appName = "Spotlightify"

type Environment interface {
	CurrentUser() (*user.User, error)
	GetOS() string
	GetEnv(string) string
}

type RealEnvironment struct{}

func (RealEnvironment) CurrentUser() (*user.User, error) {
	return user.Current()
}

func (RealEnvironment) GetOS() string {
	return runtime.GOOS
}

func (RealEnvironment) GetEnv(s string) string {
	return os.Getenv(s)
}

func GetAppDataDir(env Environment) (string, error) {
	usr, err := env.CurrentUser()
	if err != nil {
		return "", err
	}

	var appDataDir string

	switch env.GetOS() {
	case "windows":
		localAppData := env.GetEnv("LOCALAPPDATA")
		if localAppData == "" {
			localAppData = filepath.Join(usr.HomeDir, "AppData", "Local")
		}
		appDataDir = filepath.Join(localAppData, appName)

	case "darwin":
		appDataDir = filepath.Join(usr.HomeDir, "Library", "Application Support", appName)

	case "linux":
		appDataDir = filepath.Join(usr.HomeDir, ".local", "share", appName)

	default:
		return "", fmt.Errorf("unsupported OS: %s", env.GetOS())
	}

	return appDataDir, nil
}

func GetLogDir(env Environment) (string, error) {
	appDataDir, err := GetAppDataDir(env)
	if err != nil {
		return "", err
	}

	logDir := filepath.Join(appDataDir, "logs")
	return logDir, nil
}

func GetCacheDir(env Environment) (string, error) {
	appDataDir, err := GetAppDataDir(env)
	if err != nil {
		return "", err
	}

	cacheDir := filepath.Join(appDataDir, "cache")
	return cacheDir, nil
}

func GetDatabaseDir(env Environment) (string, error) {
  appDataDir, err := GetAppDataDir(env)
  if err != nil {
    return "", err
  }

  dbDir := filepath.Join(appDataDir, "db")
  return dbDir, nil
}

func GetDatabaseFile(env Environment) (string, error) {
  dbDir, err := GetDatabaseDir(env)
  if err != nil {
    return "", err
  }

  dbFile := filepath.Join(dbDir, "spotlightify.db")
  return dbFile, nil
}

func GetIconsDir(env Environment) (string, error) {
  appDataDir, err := GetAppDataDir(env)
  if err != nil {
    return "", err
  }

  iconsDir := filepath.Join(appDataDir, "icons")
  return iconsDir, nil
}

func GetArtDir(env Environment) (string, error) {
  appDataDir, err := GetAppDataDir(env)
  if err != nil {
    return "", err
  }

  artDir := filepath.Join(appDataDir, "art")
  return artDir, nil
}

func GetConfigFileDir(env Environment) (string, error) {
	appDataDir, err := GetAppDataDir(env)
	if err != nil {
		return "", err
	}

	configFile := filepath.Join(appDataDir, "config")
	return configFile, nil
}
