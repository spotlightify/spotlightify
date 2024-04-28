package store

var IconStore iconStore

type IconName string

type iconStore struct {
  icons map[IconName]string
}

func GetIcon(name string) string {
  return "icon" // TODO implement
}

