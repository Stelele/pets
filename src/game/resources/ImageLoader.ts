export class ImageLoader {
    private static images: Record<string, ImageBitmap> = {}

    public static async getImage(url: string) {
        if (url in this.images) return this.images[url]
        await this.loadImage(url)
        return this.images[url]
    }

    public static async loadImage(url: string) {
        const response = await fetch(url)
        const blob = await response.blob()
        this.images[url] = await createImageBitmap(blob, { colorSpaceConversion: "none" })
    }

    public static unloadImage(url: string) {
        if (url in this.images) {
            delete this.images[url]
        }
    }
}