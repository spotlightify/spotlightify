package utils

import (
	"encoding/json"
	"net/http"
)

func SetHeaderToJsonApp(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
}

func EncodeJson(w http.ResponseWriter, objectToWrite any) error {
	return json.NewEncoder(w).Encode(objectToWrite)
}

func SingleValueQuery(params map[string][]string) map[string]string {
	singleValueParams := make(map[string]string)
	for key, values := range params {
		if len(values) > 0 {
			singleValueParams[key] = values[0]
		}
	}
	return singleValueParams
}
