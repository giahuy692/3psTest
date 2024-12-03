export class DTOEmbedVideo {
	Code: string = ''
	URL: string = ''
	Width: number
	Height: number
	ID: number

	constructor(
		Code?: string,
		URL?: string,
		Width?: number,
		Height?: number,
		ID?: number
	) {
		this.Code = Code
		this.URL = URL
		this.Width = Width
		this.Height = Height
		this.ID = ID
	}
}

export class DTOEmbedImg {
	ID: number
	URL: string = ''
	Width: number
	Height: number
	Code: string = ''

	constructor(
		Code?: string,
		URL?: string,
		Width?: number,
		Height?: number,
		ID?: number,
	) {
		this.URL = URL
		this.ID = ID
		this.Width = Width
		this.Height = Height
		this.Code = Code
	}
}