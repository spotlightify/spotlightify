package utils

import "strings"

func NameLineBuilder(sb *strings.Builder, names []string) {
	sb.WriteString("By ")
	for i, name := range names {
		sb.WriteString(name)

		if i == len(names)-2 {
			sb.WriteString(" & ")
		} else if i != len(names)-1 {
			sb.WriteString(", ")
		}
	}
}
