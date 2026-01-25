// Run this script once to generate proper landPoints.json
// Usage: node generateLandPoints.js

import * as topojson from 'topojson-client';
import * as d3Geo from 'd3-geo';

async function generateLandPoints() {
    console.log('Fetching world atlas data...');
    const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas/land-110m.json');
    const landTopo = await response.json();

    console.log('Processing land features...');
    const land = topojson.feature(landTopo, landTopo.objects.land);
    const landPoints = [];
    const step = 1.5; // High density for solid-looking land

    // Full range including Antarctica
    for (let lat = -90; lat <= 90; lat += step) {
        for (let lng = -180; lng <= 180; lng += step) {
            const point = [lng, lat];
            if (land.features.some(f => d3Geo.geoContains(f, point))) {
                landPoints.push({ lat: Math.round(lat * 10) / 10, lng: Math.round(lng * 10) / 10 });
            }
        }
        console.log(`Processed latitude ${lat}...`);
    }

    console.log(`Generated ${landPoints.length} points`);

    // Output as JSON (compact format to reduce file size)
    const fs = await import('fs');
    fs.writeFileSync('landPoints.json', JSON.stringify(landPoints));
    console.log('Saved to landPoints.json');
}

generateLandPoints();
