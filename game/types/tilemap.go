package types

import rl "github.com/gen2brain/raylib-go/raylib"

type TileMap struct {
	Width       int32     `xml:"width,attr"`
	Height      int32     `xml:"height,attr"`
	TileWidth   int32     `xml:"tilewidth,attr"`
	TileHeight  int32     `xml:"tileheight,attr"`
	Infinite    bool      `xml:"infinite,attr"`
	NextLayerId int32     `xml:"nextlayerid,attr"`
	TileSets    []TileSet `xml:"tileset"`
	Layers      []Layer   `xml:"layer"`
}

type TileSet struct {
	FirstGId   int32  `xml:"firstgid,attr"`
	Source     string `xml:"source,attr"`
	Name       string `xml:"name,attr"`
	TileWidth  int32  `xml:"tilewidth,attr"`
	TileHeight int32  `xml:"tileheight,attr"`
	TileCount  int32  `xml:"tilecount,attr"`
	Columns    int32  `xml:"columns,attr"`
	Image      Image  `xml:"image"`
}

type Image struct {
	Source  string `xml:"source,attr"`
	Width   int32  `xml:"width,attr"`
	Height  int32  `xml:"height,attr"`
	Texture rl.Texture2D
}

type Layer struct {
	Id     int32  `xml:"id,attr"`
	Name   string `xml:"name,attr"`
	Width  int32  `xml:"width,attr"`
	Height int32  `xml:"height,attr"`
	Data   string `xml:"data"`
}
