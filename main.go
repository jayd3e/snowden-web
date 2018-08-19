package main

import (
	"io"
	"net/http"
	"os"
	"text/template"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
	t := &Template{
		templates: template.Must(template.ParseGlob("*.html")),
	}

	// Echo instance
	e := echo.New()
	e.Renderer = t

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root: "static",
	}))

	// Route => handler
	e.GET("/", func(context echo.Context) error {
		param := context.Request().URL.Query().Get("show_expose")
		showExpose := false
		if param != "" {
			showExpose = true
		}

		return context.Render(http.StatusOK, "index.html", map[string]interface{}{
			"showExpose": showExpose,
		})
	})

	// Start server
	e.Logger.Fatal(e.Start(":" + os.Getenv("PORT")))
}
