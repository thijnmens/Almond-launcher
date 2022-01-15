import React from "react";

const Searchmenu = (props) => {

	const [query, setQuery] = React.useState("")

	function _onChange(input) {
		setQuery(input);
		_onSubmit(input.toLowerCase())
	};

	function _onSubmit(input) {
		props.getSearchQuery(input);
	}

	return (
		<div className="flex w-full">
			<input onChange={(event) => _onChange(event.target.value)} className="flex rounded-sm w-full" size='200' type='text' autoComplete  placeholder="   Search" value={query}/>
		</div>
	);
};

export default Searchmenu;