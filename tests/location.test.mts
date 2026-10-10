import test from "node:test";
import assert from "node:assert/strict";
import { locate } from "../src/lib/location.ts";

test("desktop returns an approximate position without requiring GPS", async () => {
  let options: PositionOptions | undefined;
  const point = await locate({
    secure: true,
    geolocation: {
      getCurrentPosition(success, _error, input) {
        options = input;
        success({
          coords: { latitude: -12.1, longitude: -77.04, accuracy: 800 },
        } as GeolocationPosition);
      },
    },
  });
  assert.equal(point.accuracy, 800);
  assert.equal(point.latitude, -12.1);
  assert.equal(options?.enableHighAccuracy, false);
  assert.ok(options!.timeout! < 30000);
});

test("permission, provider and timeout failures give different recovery instructions", async () => {
  for (const [code, expected] of [
    [1, /permisos/],
    [2, /equipo/],
    [3, /demasiado/],
  ] as const) {
    await assert.rejects(
      locate({
        secure: true,
        geolocation: {
          getCurrentPosition(_success, error) {
            error?.({ code } as GeolocationPositionError);
          },
        },
      }),
      expected,
    );
  }
});

test("an unsupported or insecure browser never attempts location", async () => {
  await assert.rejects(locate({ secure: true }), /mapa/);
  let attempts = 0;
  await assert.rejects(
    locate({
      secure: false,
      geolocation: {
        getCurrentPosition() {
          attempts++;
        },
      },
    }),
    /HTTPS/,
  );
  assert.equal(attempts, 0);
});

test("invalid provider coordinates cannot become a query zone", async () => {
  for (const latitude of [NaN, Infinity, 91]) {
    await assert.rejects(
      locate({
        secure: true,
        geolocation: {
          getCurrentPosition(success) {
            success({
              coords: { latitude, longitude: -77, accuracy: 50 },
            } as GeolocationPosition);
          },
        },
      }),
      /equipo/,
    );
  }
});


test("the full request is bounded even when the permission prompt never resolves", async () => {
 await assert.rejects(locate({secure:true, geolocation:{getCurrentPosition(){}}}, {timeoutMs:20}), /demasiado/);
});
test("cancellation rejects and ignores a provider callback that arrives later", async () => {
 const controller = new AbortController();
 let callback: PositionCallback | undefined;
 const promise = locate({secure:true, geolocation:{getCurrentPosition(success){callback=success;}}}, {signal:controller.signal});
 controller.abort();
 await assert.rejects(promise, {name:"AbortError"});
 callback!({coords:{latitude:-12,longitude:-77,accuracy:10}} as GeolocationPosition);
});
test("invalid accuracy cannot silently replace the query zone", async () => {
 for (const accuracy of [NaN,Infinity,-1]) {
 await assert.rejects(locate({secure:true, geolocation:{getCurrentPosition(success){success({coords:{latitude:-12,longitude:-77,accuracy}} as GeolocationPosition)}}}), /equipo/);
 }
});
