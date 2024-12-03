export class DTOCFFolder {
	Code: number
	FolderName: string
	PathFolder: string
	SubFolders?: Array<DTOCFFolder>
	ListFiles?: Array<DTOCFFile>
	Loaded: boolean = false
}

export class DTOCFFile {
	Code: number
	FileName: string
	PathFile: string
	Width: number
	Height: number
}