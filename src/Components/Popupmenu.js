function renderSwitch(data) {
	switch (data.type) {
		case 'select':
			return (
				<select className="bg-gray-900 hover:bg-gray-700">
					{data.options.map((data2) => {
						return (
							<option className="hover:bg-gray-700" value={data2.value}>
								{data2.title}
							</option>
						);
					})}
				</select>
			);
		case 'input':
			return (
				<div>
					{data.options.map((data2) => {
						return (
							<input
								placeholder={data2.placeholder}
								className="bg-gray-900 hover:bg-gray-700"
							/>
						);
					})}
				</div>
			);
		case 'textarea':
			return <textarea className="bg-gray-900 hover:bg-gray-700" />;
		case 'button':
			return (
				<div>
					{data.options.map((data2) => {
						return (
							<button
								className="bg-gray-900 px-5 rounded-sm border-none text-gray-200 font-bold hover:bg-gray-700"
								onClick={() => {
									data2.onClick();
								}}
							>
								{data2.title}
							</button>
						);
					})}
				</div>
			);
		default:
			return <h1>Not Found!</h1>;
	}
}

const Popupmenu = (props) => {
	function _onSelect() {
		props.getOnClick();
	}

	return (
		<div className="popupmenu">
			<div className="flex absolute left-[30vw] top-[10vh] w-[40vw] h-[80vh] bg-gray-800 rounded-3xl z-50 text-gray-200">
				<table className="w-full mt-7 text-center">
					<tbody className="py-5">
						{props.options.map((data, index) => {
							return (
								<tr key={index}>
									<td>
										<h1>{data.title}</h1>
									</td>
									<td>{renderSwitch(data)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<div>
					<button className="closeButton" onClick={() => _onSelect()}>
						X
					</button>
				</div>
			</div>
		</div>
	);
};

export default Popupmenu;
