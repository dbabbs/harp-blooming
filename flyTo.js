import { map } from './index.js';

const { MapViewUtils, MapViewEventNames } = harp;

function flyTo({
	coordinates, 
	tilt = 0, 
	azimuth = 0, 
	distance = 12, 
	duration = 3000,
	heightAtMid = 4000
}) {

	const startPosition = map.camera.position.clone();
   const startQuaternion = map.camera.quaternion.clone();
   const targetPosition = MapViewUtils.getCameraPositionFromTargetCoordinates(
      coordinates,
      distance,
      azimuth,
      tilt,
      map.projection
   );

   const targetQuaternion = MapViewUtils.getCameraRotationAtTarget(
      map.projection,
      coordinates,
      azimuth,
      tilt
   );

   const startTime = Date.now();

   const middlePosition = startPosition
      .clone()
      .add(targetPosition)
      .multiplyScalar(0.5);

   middlePosition.setZ(
		heightAtMid
   );

   const curve = new THREE.CatmullRomCurve3([startPosition, middlePosition, targetPosition]);

   const updateListener = () => {
      const time = Date.now();
		let t = (time - startTime) / duration;
		
      if (t >= 1) {
         t = 1;
         map.endAnimation();
			map.removeEventListener(MapViewEventNames.Render, updateListener);
      }
      map.camera.position.copy(curve.getPoint(t));
      const rotation = startQuaternion.clone().slerp(targetQuaternion, t);
      map.camera.quaternion.copy(rotation);
      map.camera.updateMatrixWorld(true);
   };

   map.addEventListener(MapViewEventNames.Render, updateListener);
   map.beginAnimation();
   map.update();
}

export default flyTo;