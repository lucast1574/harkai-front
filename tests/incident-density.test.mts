import test from 'node:test';
import assert from 'node:assert/strict';
import { densitySpots, incidentColor } from '../src/lib/incident-density.ts';

test('one incident stays small and does not scale to maximum intensity', () => {
 const [spot]=densitySpots([{x:10,y:10,type:'violence'}]);
 assert.equal(spot.count,1);assert.equal(spot.radius,13);assert.equal(spot.opacity,.48);assert.equal(spot.color,incidentColor('violence'));
});
test('nearby incidents of the same type increase radius and intensity', () => {
 const [spot]=densitySpots(Array.from({length:16},(_,i)=>({x:10+i/20,y:10,type:'fire'})));
 assert.equal(spot.count,16);assert.ok(spot.radius>13 && spot.radius<=42);assert.ok(spot.opacity>.48 && spot.opacity<=.85);
});
test('different categories and distant locations retain their own spots and colors', () => {
 const spots=densitySpots([{x:10,y:10,type:'fire'},{x:10,y:10,type:'violence'},{x:300,y:300,type:'fire'}]);
 assert.equal(spots.length,3);assert.notEqual(spots[0].color,spots[1].color);
});
test('changing filtered data removes old spots and invalid coordinates are ignored', () => {
 assert.deepEqual(densitySpots([]),[]);
 assert.deepEqual(densitySpots([{x:NaN,y:1,type:'fire'},{x:1,y:Infinity,type:'fire'}]),[]);
});
