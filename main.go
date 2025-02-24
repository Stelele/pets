package main

import (
	g "pets/game"

	rl "github.com/gen2brain/raylib-go/raylib"
)

const worldWidth = 30 * 16
const worldHeight = 20 * 16

func main() {
	rl.InitWindow(worldWidth, worldHeight, "raylib [core] example - basic window")
	defer rl.CloseWindow()

	rl.SetTargetFPS(60)

	rl.SetWindowState(rl.FlagWindowResizable)

	g.InitAsset()

	for !rl.WindowShouldClose() {
		g.Update()

		rl.BeginDrawing()
		rl.ClearBackground(rl.Black)
		g.Draw()
		rl.EndDrawing()
	}
}
