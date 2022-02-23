import React from 'react';
import Dropdown from 'react-dropdown';

const options = [
	{
		label: 'Name',
		value: 'name',
	},
	{
		label: 'ID',
		value: 'appid',
	},
	{
		label: 'Total Playtime',
		value: 'playtime_forever',
	},
	{
		label: 'Playtime Windows',
		value: 'playtime_windows_forever',
	},
	{
		label: 'Playtime MacOS',
		value: 'playtime_mac_forever',
	},
	{
		label: 'Playtime Linux',
		value: 'playtime_linux_forever',
	},
	{
		label: 'Steam',
		value: 'steam',
	},
	{
		label: 'Epic Games',
		value: 'epic',
	},
];

const Dropdownmenu = (props) => {
	const [selected, setSelected] = React.useState('playtime_forever');

	function _onSelect(option) {
		setSelected(option.value);
		props.getDropdownSelected(option.value);
	}

	return (
		<Dropdown
			className="w-[50%]"
			options={options}
			onChange={_onSelect}
			value={selected}
			placeholder="Select an option"
		/>
	);
};

export default Dropdownmenu;
