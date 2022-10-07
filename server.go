package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

type mytype []map[string]string

func root(w http.ResponseWriter, r *http.Request) {

	// save config then redirect to /
	if r.Method == "POST" {
		f, _ := os.Create("config.json")
		f.WriteString(r.FormValue("config_editor"))
		f.Sync()
		f.Close()
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}

	// load files
	data, _ := ioutil.ReadFile("index.html")
	config, _ := ioutil.ReadFile("config.json")

	// add config into the html and enable the editor
	var html string
	html = strings.Replace(string(data), "const config = null", "const config = "+string(config), 1)
	html = strings.Replace(html, "edit-invisible", "edit-visible", 1)
	fmt.Fprintf(w, html)
}

func main() {

	server, _ := ioutil.ReadFile("server.json")
	var data map[string]interface{}
	json.Unmarshal(server, &data)

	// hanble static files
	fs := http.FileServer(http.Dir("."))
	http.Handle("/css/", fs)
	http.Handle("/images/", fs)
	http.Handle("/js/", fs)
	http.Handle("/plugin/", fs)
	http.Handle("/config.json", fs)

	// handle the root
	http.HandleFunc("/", root)

	// HTTP server
	http_server, ok := data["http"]
	if ok {
		http_info := http_server.(map[string]interface{})
		server := http_info["server"].(string) + ":" + fmt.Sprintf("%.0f", http_info["port"].(float64))

		fmt.Printf("Listenting on HTTP:  %s\n", server)
		go func() {
			http.ListenAndServe(server, nil)
		}()
	}

	// HTTPS server
	https_server, ok := data["https"]
	if ok {
		https_info := https_server.(map[string]interface{})
		server := https_info["server"].(string) + ":" + fmt.Sprintf("%.0f", https_info["port"].(float64))

		fmt.Printf("Listenting on HTTPS: %s\n", server)
		go func() {
			log.Fatal(http.ListenAndServeTLS(":8443", https_info["cert"].(string), https_info["key"].(string), nil))
		}()
	}

	// wait forever
	select {}
}
