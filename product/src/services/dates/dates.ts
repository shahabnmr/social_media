export const dates = {
	convert: function (d: string | number | { year: number; month: number; date: number }) {
		return d.constructor === Date
			? d
			: d.constructor === Array
			? new Date(d[0], d[1], d[2])
			: d.constructor === Number
			? new Date(d)
			: d.constructor === String
			? new Date(d)
			: typeof d === 'object'
			? new Date(d.year, d.month, d.date)
			: NaN;
	},
	compare: function (a: string | number, b: string | number) {
		return isFinite((a = this.convert(a).valueOf())) && isFinite((b = this.convert(b).valueOf()))
			? +(a > b) - +(a < b)
			: NaN;
	},
	inRange: function (d: number, start: number, end: number) {
		return isFinite((d = this.convert(d).valueOf())) &&
			isFinite((start = this.convert(start).valueOf())) &&
			isFinite((end = this.convert(end).valueOf()))
			? start <= d && d <= end
			: NaN;
	},
};
