package game

import (
	"encoding/xml"
	"fmt"
	"io"
	"os"
	"pets/game/types"
	"strings"

	rl "github.com/gen2brain/raylib-go/raylib"
)

var testScene types.TileMap

const basePath = "assets"

func InitAsset() {
	sceneFile, _ := os.Open(basePath + "/Tilemaps/test-map.tmx")
	defer sceneFile.Close()

	b, _ := io.ReadAll(sceneFile)
	xml.Unmarshal(b, &testScene)

	for idx, tileSet := range testScene.TileSets {
		tileSetfile, _ := os.Open(basePath + "/Tilemaps/" + tileSet.Source)
		defer tileSetfile.Close()

		var tmpTileSet types.TileSet
		tmpTileSetData, _ := io.ReadAll(tileSetfile)
		xml.Unmarshal(tmpTileSetData, &tmpTileSet)

		testScene.TileSets[idx].Columns = tmpTileSet.Columns
		testScene.TileSets[idx].Name = tmpTileSet.Name
		testScene.TileSets[idx].TileCount = tmpTileSet.TileCount
		testScene.TileSets[idx].TileHeight = tmpTileSet.TileHeight
		testScene.TileSets[idx].TileWidth = tmpTileSet.TileWidth

		testScene.TileSets[idx].Image = tmpTileSet.Image
		testScene.TileSets[idx].Image.Source = strings.ReplaceAll(tmpTileSet.Image.Source, "../", "")
		testScene.TileSets[idx].Image.Texture = rl.LoadTexture(basePath + "/" + testScene.TileSets[idx].Image.Source)
	}

	fmt.Print(testScene)

}

func Update() {

}

func Draw() {

}
