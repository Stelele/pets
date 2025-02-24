package main

import (
	"math"
	g "pets/game"

	rl "github.com/gen2brain/raylib-go/raylib"
)

const worldWidth = 30 * 16
const worldHeight = 20 * 16

var screenWidth int32 = 30 * 16
var screenHeight int32 = 20 * 16

func main() {
	rl.InitWindow(screenWidth, screenHeight, "raylib [core] example - basic window")
	defer rl.CloseWindow()

	rl.SetTargetFPS(60)

	rl.SetWindowState(rl.FlagWindowResizable)

	g.InitAsset()

	for !rl.WindowShouldClose() {
		g.Update()

		rl.BeginDrawing()
		camera := scaleContentsToWindow()
		rl.BeginMode2D(camera)

		rl.ClearBackground(rl.Black)
		g.Draw()

		rl.EndMode2D()
		rl.EndDrawing()
	}
}

func scaleContentsToWindow() rl.Camera2D {
	scaleX := float64(rl.GetScreenWidth()) / float64(worldWidth)
	scaleY := float64(rl.GetScreenHeight()) / float64(worldHeight)
	scale := math.Min(scaleX, scaleY)

	offsetX := (float64(rl.GetScreenWidth()) - (float64(worldWidth) * scale)) * 0.5
	offsetY := (float64(rl.GetScreenHeight()) - (float64(worldHeight) * scale)) * 0.5

	camera := rl.Camera2D{
		Offset:   rl.Vector2{X: float32(offsetX), Y: float32(offsetY)},
		Target:   rl.Vector2{X: 0, Y: 0},
		Rotation: 0,
		Zoom:     float32(scale),
	}

	return camera
}
