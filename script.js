function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function injectHTML(list) {
  console.log('fired injectHTML')
  const target = document.querySelector('#market_name');
  target.innerHTML = '';
  list.forEach((item) => {
    const str = `<li>${item.market_name}</li>`;
    target.innerHTML += str
  })
}

function filterList(list, query) {

  return list.filter((item) => {
    const lowerCaseName = item.market_name.toLowerCase();
    const lowerCaseQuery = query.toLowerCase();
    return lowerCaseName.includes(lowerCaseQuery)
  })
}

function cutMarketList(list) {
  console.log('fired cut list');
  const range = [...Array(15).keys()];
  return (newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length - 1);
    return list[index]
  }))
}

function initMap() {
  const carto = L.map('map').setView([38.98, -76.93], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(carto);
  return carto;
}

function markerPlace(array, map) {
  console.log('array for markers', array);

  map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

  array.forEach((item) => {
      console.log('markerPlace', item);
      const {latitude, longitude} = item.location;
      L.marker([latitude, longitude]).addTo(map);
  });
}


async function mainEvent() {  // the async keyword means we can make API requests
  const mainForm = document.querySelector('.main_form'); // This class name needs to be set on your form before you can listen for an event on it
  // const filterDataButton = document.querySelector('#filter')
  const loadDataButton = document.querySelector('#data_load')
  const clearDataButton = document.querySelector('#data_clear')
  const generateListButton = document.querySelector('#generate')
  const textField = document.querySelector('#resto')

  const loadAnimation = document.querySelector('#data_load_animation');
  loadAnimation.style.display = 'none';
  generateListButton.classList.add('hidden');

  const carto = initMap();

  const storedData = localStorage.getItem('storedData');
  let parsedData = JSON.parse(storedData);
  if (parsedData?.length > 0) {
    generateListButton.classList.remove('hidden');
  }

  // let storedList = [];
  let currentList = []; // this is "scoped" to the main event function

  /* We need to listen to an "event" to have something happen in our page - here we're listening for a "submit" */
  loadDataButton.addEventListener('click', async (submitEvent) => { 
    console.log('Loading Data..'); 
    loadAnimation.style.display = 'inline-block';

    const results = await fetch('https://data.princegeorgescountymd.gov/resource/sphi-rwax.json');

    const storedList = await results.json();
    localStorage.setItem('storedData', JSON.stringify(storedList));
    parsedData = storedList;

    
    if (parsedData?.length > 0) {
      generateListButton.classList.remove('hidden');
    }

    loadAnimation.style.display = 'none';
  });

  generateListButton.addEventListener('click', (event) => {
    console.log('generate new list');
    currentList = cutMarketList(parsedData);
    console.log(currentList);
    injectHTML(currentList);
    markerPlace(currentList, carto);
  })

  textField.addEventListener('input', (event) => {
      console.log('input', event.target.value);
      const newList = filterList(currentList, event.target.value);
      console.log(newList);
      injectHTML(newList);
      markerPlace(newList, carto);
  })

  clearDataButton.addEventListener("click", (event) => {
      console.log('clear browser data')
      localStorage.clear();
      console.log('localStorage Check', localStorage.getItem("storedData"))
  })
}
document.addEventListener('DOMContentLoaded', async () => mainEvent()); 