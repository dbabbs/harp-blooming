import flyTo from "./flyTo.js";

const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

const { MapView, MapControls, GeoCoordinates, OmvDataSource, 
   APIFormat, MapViewEventNames, MapViewUtils } = harp;
const config = {
   token: 'ASCBZnCcvEMa-vbk9JXixN8',
   space: 'ls1DGmar',
}



const map = new MapView({
   canvas: $("#map"),
   theme: "theme/style.json",
});

const controls = new MapControls(map);
map.renderLabels = false;
window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

const cameraOptions = { 
   tilt: 52, 
   distance: 5000, 
   coordinates: new GeoCoordinates(37.781347, -122.391730),
   azimuth: 90 - 180
}

map.lookAt(cameraOptions.coordinates, cameraOptions.distance, cameraOptions.tilt, cameraOptions.azimuth);
// controls.maxPitchAngle = 90;

const omvDataSource = new OmvDataSource({
   name: "basemap",
   baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
   apiFormat: APIFormat.XYZOMV,
   styleSetName: "tilezen",
   authenticationCode: config.token,
   gatherFeatureIds: true
});
map.addDataSource(omvDataSource);

const traffic = new OmvDataSource({
   name: "traffic",
   baseUrl: "https://xyz.api.here.com/hub/spaces/" + config.space + "/tile/web",
   apiFormat: APIFormat.XYZSpace,
   authenticationCode: config.token,
   gatherFeatureIds: true
});

function style(val) {
   traffic.setStyleSet([
      {
         "when": `$geometryType ^= 'line'`,
         "renderOrder": 1000,
         "technique": "solid-line",
         "attr": {
            "color": [
               "concat", "hsl(", 
               [
						// "floor", ["+", ["*", ["to-number", ["get", `properties.flows.${val}`]], 60], 200]
						"floor", ["+", ["*", ["to-number", ["get", `properties.speeds.${18}`]], 6], 150]
						// "floor", ["+", ["*", ["to-number", ["get", `properties.speeds.${val}`]], 10], 150]
						// "floor", ["+", ["*", ["to-number", ["get", `properties.speeds.${val}`]], 8], 30]
               ],
               ", 100%, 44%)"
            ],
            "metricUnit": "Pixel",
            "lineWidth": 3
         }
      }
   ])
   map.update();
}
map.addDataSource(traffic).then(() => style(0))



const bloomOptions = {
	enabled: true,
	strength: 1.2,
	threshold: 0.4,
	radius: 1
}
map.toneMappingExposure = 1.0;
map.mapRenderingManager.bloom = bloomOptions;
map.update();


const centers = {
	start: new GeoCoordinates(37.781347, -122.391730),
	end: new GeoCoordinates(37.774037, -122.437201)
}
let towards = 'end';
const duration = 30000

function go() {
	towards = towards === 'end' ? 'start' : 'end';
	flyTo({
		coordinates: centers[towards],
		azimuth: 90 - 180,
		tilt: 55,
		distance: 4000,
		duration,
		heightAtMid: 1500
	})
}
setInterval(() => {
	go();
}, duration)

go();
	
export { map }