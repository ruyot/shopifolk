// Globe initialization and management
import Globe from 'globe.gl';
import { state } from './config.js';

export function initGlobe() {
    setTimeout(() => {
        const container = document.getElementById('globe-container');

        state.globeInstance = new Globe(container)
            .backgroundColor('rgba(0,0,0,0)')
            .showGlobe(false)
            .showAtmosphere(false)
            .width(900)
            .height(900);

        state.globeInstance.controls().autoRotate = false;
        state.globeInstance.controls().autoRotateSpeed = 1.5;
        state.globeInstance.controls().enableZoom = false;
        state.globeInstance.controls().enablePan = false;
        state.globeInstance.controls().enableRotate = false;

        fetch('/landPoints.json')
            .then(res => res.json())
            .then(landPoints => {
                state.globePoints = landPoints;
                state.globeInstance
                    .pointsData([])
                    .pointLat('lat')
                    .pointLng('lng')
                    .pointColor(() => '#95BF47')
                    .pointAltitude(0.001)
                    .pointRadius(0.25);
            });
    }, 100);
}
