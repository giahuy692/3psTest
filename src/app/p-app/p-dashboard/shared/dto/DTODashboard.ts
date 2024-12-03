export class DTODashboard {
	Code: number = 0
	ChartType: number
	ChartTypeName: string = ""
	ChartValue: number = 0
	Percentage: number = 0
	ChartTitle: string = ""
	ListData: DTODashboard[] = []

	constructor(ChartType: number) {
		this.ChartType = ChartType
	}
}