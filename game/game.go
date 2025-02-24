package game

import (
	"encoding/xml"
	"io"
	"os"
	"pets/game/types"
	"strconv"
	"strings"

	rl "github.com/gen2brain/raylib-go/raylib"
)

var testScene types.TileMap

const basePath = "assets"

func InitAsset() {
	var fileName = basePath + "/Tilemaps/test-map.tmx"

	loadSceneData(fileName)

}

func getTileSet(tile int32) types.TileSet {
	var tileSet types.TileSet
	for _, curTileSet := range testScene.TileSets {
		min := curTileSet.FirstGId
		max := curTileSet.FirstGId + curTileSet.TileCount
		if tile >= min && tile < max {
			tileSet = curTileSet
			break
		}
	}

	return tileSet
}

func loadSceneData(fileName string) {
	sceneFile, _ := os.Open(fileName)
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

}

func Update() {

}

func Draw() {
	for _, layer := range testScene.Layers {
		tilesData := strings.Split(strings.ReplaceAll(layer.Data, "\n", ""), ",")

		for y := range testScene.Height {
			for x := range testScene.Width {
				pos := rl.Vector2{
					X: float32(x * testScene.TileWidth),
					Y: float32(y * testScene.TileHeight),
				}

				idx := (y * testScene.Width) + x

				tile, _ := strconv.Atoi(tilesData[idx])
				if tile < 1 {
					continue
				}

				tileSet := getTileSet(int32(tile))

				u := int32(int32(tile)-tileSet.FirstGId) % tileSet.Columns
				v := int32(int32(tile)-tileSet.FirstGId) / tileSet.Columns

				slice := rl.Rectangle{
					X:      float32(u * tileSet.TileWidth),
					Y:      float32(v * tileSet.TileHeight),
					Width:  float32(tileSet.TileWidth),
					Height: float32(tileSet.TileHeight),
				}

				rl.DrawTextureRec(tileSet.Image.Texture, slice, pos, rl.White)
			}
		}
	}
}
