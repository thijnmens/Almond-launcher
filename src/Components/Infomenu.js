import ProgressBar from '@ramonak/react-progress-bar';
import { round } from 'lodash';
import fetch from 'node-fetch';
import { useEffect, useState } from 'react';
import { Portal } from 'react-portal';
import Popupmenu from './Popupmenu';

function getIndex(arr, appid, width) {
	var dex = 0.0;
	arr.forEach((data, index) => {
		if (data.appid === appid) {
			dex = ((width - 144) / 8) * (index % 8) + (index % 8) * 16;
		}
	});
	return dex;
}

const Infomenu = (props) => {
	const [modStatus, setModStatus] = useState({
		title: 'Loading...',
		clicked: () => {},
		verified: false,
	});
	const [showModsMenu, setShowModsMenu] = useState(false);
	const [showSettingsMenu, setShowSettingsMenu] = useState(false);
	const [achievements, setAchievements] = useState({ called: false, calls: 0, data: {} });
	const [completion, setCompletion] = useState({
		achieved: 0,
		notAchieved: 0,
		precentage: 100,
	});

	useEffect(() => {
		const controller = new AbortController();
		fetch(`http://localhost:666/steam/achievements/${props.appid}`, {
			'content-type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		})
			.then((res) => res.json())
			.then((json) =>
				setAchievements({ called: true, calls: achievements.calls + 1, data: json })
			)
			.catch();
		return () => {
			controller.abort();
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	if (props.appid.toString() === props.active.toString()) {
		if (achievements.called === true && achievements.calls === 1) {
			let _;
			try {
				_ = {
					achieved: 0,
					total: achievements.data.playerstats.achievements.length,
					precentage: 100,
				};
				achievements.data.playerstats.achievements.forEach((data) => {
					if (data.achieved === 1) {
						_ = {
							achieved: _.achieved + data.achieved,
							total: _.total,
							precentage: round(((_.achieved + data.achieved) / _.total) * 100, 0),
						};
					}
				});
			} catch {
				_ = {
					achieved: 0,
					total: 0,
					precentage: 100,
				};
			}
			setCompletion(_);
			setAchievements({
				called: achievements.called,
				calls: achievements.calls + 1,
				data: achievements.data,
			});
		}

		var index = getIndex(props.games, props.appid, props.vhwidth);

		const modsMenuHandler = () => {
			if (showModsMenu) {
				setShowModsMenu(false);
			} else {
				setShowModsMenu(true);
			}
		};

		const settingsMenuHandler = () => {
			if (showSettingsMenu) {
				setShowSettingsMenu(false);
			} else {
				setShowSettingsMenu(true);
			}
		};

		const launchManager = () => {
			fetch(`http://localhost:666/mods/launch/${props.appid}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		};

		const downloadManager = () => {
			fetch(`http://localhost:666/mods/download/${props.appid}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}).then(() => {
				setModStatus({
					title: 'Launch',
					clicked: launchManager,
					verified: false,
				});
			});
		};

		const fetchVerify = () => {
			fetch(`http://localhost:666/steam/verify/${props.appid}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		};

		const fetchUninstall = () => {
			fetch(`http://localhost:666/steam/uninstall/${props.appid}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		};

		const ModsMenuJSX = () => {
			console.log(modStatus.verified);
			if (!modStatus.verified) {
				fetch(`http://localhost:666/mods/exists/${props.appid}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' },
				})
					.then((res) => {
						if (res.ok) {
							setModStatus({
								title: 'Launch',
								clicked: launchManager,
								verified: true,
							});
						} else {
							setModStatus({
								title: 'Download',
								clicked: downloadManager,
								verified: true,
							});
						}
					})
					.catch();
			}
			if (showModsMenu) {
				return (
					<Portal>
						<Popupmenu
							getOnClick={modsMenuHandler}
							options={[
								{
									title: 'Uninstall all mods',
									type: 'button',
									options: [{ title: 'Uninstall', clicked: fetchVerify }],
								},
								{
									title: 'Open mod manager',
									type: 'button',
									options: [
										{ title: modStatus.title, clicked: modStatus.clicked },
									],
								},
							]}
						/>
					</Portal>
				);
			} else {
				return <></>;
			}
		};

		const SettingsMenuJSX = () => {
			if (showSettingsMenu) {
				return (
					<Portal>
						<Popupmenu
							getOnClick={settingsMenuHandler}
							options={[
								{
									title: 'Uninstall game',
									type: 'button',
									options: [
										{
											title: 'Uninstall',
											clicked: fetchUninstall,
										},
									],
								},
								{
									title: 'Verify Game Integrity',
									type: 'button',
									options: [
										{
											title: 'Verify',
											clicked: fetchVerify,
										},
									],
								},
							]}
						/>
					</Portal>
				);
			} else {
				return <></>;
			}
		};

		const Mods = () => {
			if (props.config.Mods.Supported[props.appid]) {
				return (
					<div className="m-0 absolute top-[35%] left-[70%]">
						<button
							onClick={() => {
								modsMenuHandler();
							}}
							className="bg-gray-900 px-7 py-2 rounded-sm font-bold hover:bg-gray-700"
						>
							Mods
						</button>
					</div>
				);
			} else {
				return <></>;
			}
		};

		return (
			<div className="infomenu" style={{ marginLeft: `-${index}px` }}>
				<div className="left-40 top-16 shadow-xl">
					<img
						alt="Banner"
						width="340"
						height="510"
						className="rounded-lg z-10"
						src={props.banners}
					/>
				</div>
				<img
					alt="Header"
					className="rounded-lg absolute top-0 left-0 object-cover h-[40rem] w-[93vw]"
					src={props.headers}
				/>
				<div className="rounded-lg w-[93vw] bottom-0 left-0 infomenubar z-10">
					<div className="m-0 absolute top-[35%] left-[32%]">
						<button
							onClick={() => {
								fetch(`http://localhost:666/steam/launch/${props.appid}`, {
									method: 'GET',
									headers: { 'Content-Type': 'application/json' },
								});
							}}
							className="bg-gray-900 px-7 py-2 rounded-sm font-bold hover:bg-gray-700"
						>
							Launch
						</button>
					</div>
					<Mods />
					<ModsMenuJSX />
					<div className="m-0 absolute top-[35%] left-[80%]">
						<button
							onClick={() => {
								settingsMenuHandler();
							}}
							className="bg-gray-900 px-7 py-2 rounded-sm font-bold hover:bg-gray-700"
						>
							Settings
						</button>
					</div>
					<SettingsMenuJSX />
					<div className="m-0 absolute w-[20%] top-[40%] left-[45%]">
						<ProgressBar
							completed={completion.precentage}
							barContainerClassName="bg-gray-800 rounded-lg"
							bgColor="#2563eb"
						/>
					</div>
				</div>
			</div>
		);
	} else {
		return <></>;
	}
};

export default Infomenu;
