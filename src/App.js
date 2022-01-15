import './index.css';
import 'react-dropdown/style.css';
import Navbar from './Components/Navbar';
import React from 'react';
import useSWR from 'swr';
import useRightClickMenu from './Hooks/useRightClickMenu';
import Contextmenu from './Components/Contextmenu';
import Dropdownmenu from './Components/Dropdownmenu';
import Searchmenu from './Components/Searchmenu';
import Infomenu from './Components/Infomenu';
import { Portal } from 'react-portal';
import Popupmenu from './Components/Popupmenu';
import Loading from './Components/Loading';

const fetcher = (url) => fetch(url).then((r) => r.json());

function importAll(r) {
  let images = {};
  r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

function App() {

  const { x, y, showMenu } = useRightClickMenu();

  const gridRef = React.useRef();

  const [selected, setSelected] = React.useState(0);
  const [sortBy, setSortBy] = React.useState("playtime_forever");
  const [query, setQuery] = React.useState("");
  const [width, setWidth] = React.useState(0.0);
  const [settingsMenu, setSettingsMenu] = React.useState(false);

  const sort = ( a, b ) => {
    if (sortBy.includes("playtime")) {
      if ( a[sortBy] > b[sortBy] ){
        return -1;
      }
      if ( a[sortBy] < b[sortBy] ){
        return 1;
      }
    } else {
      if ( a[sortBy] < b[sortBy] ){
        return -1;
      }
      if ( a[sortBy] > b[sortBy] ){
        return 1;
      }
    }
    return 0;
  }

  const filter = (filter) => {
    return filter.name.toLowerCase().includes(query.toLowerCase())
  };

  function getDropdownSelected(selected) {
    setSortBy(selected)
  };

  function getSearchQuery(query) {
    setQuery(query);
  };

  function getOnClick() {
    if (settingsMenu) {
      setSettingsMenu(false)
    } else {
      setSettingsMenu(true)
    }
  };

  function setInfomenu(active) {
    if (selected.toString() === "" ) {
      setSelected(active)
    } else if (selected.toString() === active.toString()) {
      setSelected("")
    } else {
      setSelected(active)
    }
  };

  function requireImages(files) {
    const images = {
      Banners: [],
      Headers: [],
      Icons: []
    };
    var path = "";
    if (config.isPackaged) {
      path = '../../..'
    } else {  
      path = '.'
    }
    try {
      files.Banners.forEach((data) => {
        images.Banners.push(require(`${path}/Assets/Banners/${data}`));
      });
      files.Headers.forEach((data) => {
        images.Headers.push(require(`${path}/Assets/Headers/${data}`));
      });
      files.Icons.forEach((data) => {
        images.Icons.push(require(`${path}/Assets/Icons/${data}`));
      });
    } catch (err) {console.error(err)}
    console.log(images)
    return images;
  }

  React.useEffect(() => {
    try {
      setWidth(gridRef.current.offsetWidth)
    } catch {}
  }, [gridRef.current])
  
  const { data: config, error: errconfig } = useSWR('http://localhost:666/app/config/get', fetcher);   //Config Library
  const { data: steam, error: errsteam } = useSWR('http://localhost:666/steam/games', fetcher);   //Steam Library
  const { data: epic, error: errepic } = useSWR('http://localhost:666/epic/games', fetcher);   //Epic Library
  const { data: files, error: errfiles } = useSWR('http://localhost:666/app/files', fetcher);   //Images
  if ( errconfig ) {
    console.error(errconfig)
    return (<div><h1 className='text-gray-200'>An error has occured while loading Config</h1></div>)
  } else if (!config) {
    return (<Loading />)
  }

  if ( errsteam ) {
    console.error(errsteam)
    return (<div><h1 className='text-gray-200'>An error has occured while loading Steam Library</h1></div>)
  } else if (!steam) {
    return (<Loading />)
  }

  if ( errepic ) {
    console.error(errepic)
    return (<div><h1 className='text-gray-200'>An error has occured while loading Epic Library</h1></div>)
  } else if (!epic) {
    return (<Loading />)
  }

  if ( errfiles ) {
    console.error(errfiles)
    return (<div><h1 className='text-gray-200'>An error has occured while loading Config</h1></div>)
  } else if (!files) {
    return (<Loading />)
  }

  var cacheLoaded = fetch('http://localhost:666/cache/load', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ steamgames: steam.response.games})})
  if(!cacheLoaded) {
      return (<Loading />)
  }

  const images = requireImages(files);

  function _reloadCache() {
    fetch('http://localhost:666/cache/reload', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ steamgames: steam.response.games})})
  };

  var gamesOri = steam.response.games
  epic[0].forEach((data) => {
    if (!gamesOri.includes(data)) {
      gamesOri.push(data)
    }
  })

  var games = [];
  var gamesSort = gamesOri.filter(filter)
  gamesSort.sort(sort)
  gamesSort.forEach((data) => {
    if (sortBy === "epic"|| sortBy === "steam") {
      if (data.launcher === sortBy) {
        games.push(data)
      }
    } else {
      games = gamesSort;
    }
  })

  const SettingsMenuJSX = (props) => {
    if (props.selected) {
      return (
        <Portal>
        <Popupmenu getOnClick={getOnClick} options={[
        {
          title: "Darkmode",
          type: "select",
          options: [{title: "Enabled", value: "enabled"}, {title: "Disabled", value: "disabled"}]
        },
        {
          title: "Reload Cache",
          type: "button",
          options: [{title: "Reload", onClick: _reloadCache}]
        },
        {
          title: "SteamID",
          type: "input",
          options: [{type: "text", placeholder: "ex. 76561198446051555"}]
        },
        {
          title: "height",
          type: "input",
          options: [{type: "number", placeholder: "1080"}]
        },
        {
          title: "width",
          type: "input",
          options: [{type: "number", placeholder: "1920"}]
        }
      ]} />
    </Portal>
      )
    } else {
      return (<></>)
    }
  }

  return (
    <div className='w-screen h-screen overflow-x-hidden customscroll'>
    <Contextmenu x={x} y={y} showMenu={showMenu} />
      <table>
        <tbody>
          <tr>
            <td className='w-16 bg-gray-900 align-text-top fixed'>
              <Navbar games={games} getOnClick={getOnClick}/>
            </td>
            <td>
              <div className='overflow-hidden w-[98%] ml-16'>
              <div className='flex gap-4 w-[90%] p-16'>
                <Dropdownmenu getDropdownSelected={getDropdownSelected} />
                <Searchmenu getSearchQuery={getSearchQuery} />
              </div>
                <div ref={gridRef} className='grid grid-cols-8 grid-flow-row gap-4 p-4 ml-4 mr-4 my-5'>
                  {games.map((data, i) => {
                    var bannerIndex, headerIndex = 0
                    images.Banners.forEach((dataB, index) => {
                      if (dataB.includes(`Banner_${data.appid}_600x900`)) {
                        bannerIndex = index;
                      };
                    });
                    images.Headers.forEach((dataH, index) => {
                      if (dataH.includes(`Header_${data.appid}_1920x620`)) {
                        headerIndex = index;
                      };
                    });
						      	return (
                      <div key={i}>
                        <div className='hover:cursor-pointer banner-container' onClick={() => {setInfomenu(data.appid)}}>
                          <img className='rounded-xl pointer-events-none block' src={`http://localhost:666/cache/banner/${data.appid}`} alt={data.appid}/>
                          <div className='hover-banner'>{data.name}</div>
                        </div>
                        <Infomenu active={selected} appid={data.appid} games={games} vhwidth={width} headers={`http://localhost:666/cache/header/${data.appid}`} banners={`http://localhost:666/cache/banner/${data.appid}`} />
                      </div>
						      	);
						      })}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <SettingsMenuJSX selected={settingsMenu} />
    </div>
  );
}

export default App;
