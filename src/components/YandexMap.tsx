import { useEffect, useRef, useState } from "react";

const API_CONFIG = "https://functions.poehali.dev/3ccf1bc8-7608-4e95-aaad-fd29c4520b34";

type YMaps = Record<string, unknown>;
declare global {
  interface Window { ymaps: YMaps; }
}

interface Master {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  avatar: string;
  verified: boolean;
  distance: string;
  coords: [number, number];
}

interface Props {
  masters: Master[];
  center: [number, number];
  onMasterClick?: (master: Master) => void;
}

let ymapsLoadPromise: Promise<void> | null = null;

function loadYmaps(apiKey: string): Promise<void> {
  if (ymapsLoadPromise) return ymapsLoadPromise;
  ymapsLoadPromise = new Promise((resolve, reject) => {
    if (window.ymaps && typeof (window.ymaps as { ready?: unknown }).ready === "function") {
      (window.ymaps as { ready: (fn: () => void) => void }).ready(resolve);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      (window.ymaps as { ready: (fn: () => void) => void }).ready(resolve);
    };
    script.onerror = () => { ymapsLoadPromise = null; reject(); };
    document.head.appendChild(script);
  });
  return ymapsLoadPromise;
}

export default function YandexMap({ masters, center, onMasterClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<YMaps | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(API_CONFIG)
      .then(r => r.text())
      .then(text => {
        const data = JSON.parse(typeof JSON.parse(text) === "string" ? JSON.parse(text) : text);
        const key = data.yandex_maps_key;
        if (!key) { setError(true); return null; }
        return loadYmaps(key);
      })
      .then((result) => { if (result !== null) setReady(true); })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const ymaps = window.ymaps as Record<string, unknown> & {
      Map: new (el: HTMLDivElement, opts: object) => YMaps;
      Placemark: new (coords: number[], props: object, opts: object) => YMaps;
      templateLayoutFactory: { createClass: (tmpl: string) => unknown };
    };

    if (mapInstance.current) {
      (mapInstance.current as { destroy: () => void }).destroy();
      mapInstance.current = null;
    }

    const map = new ymaps.Map(mapRef.current, { center, zoom: 14, controls: ["zoomControl"] });
    (map as { behaviors: { disable: (s: string) => void } }).behaviors.disable("scrollZoom");
    mapInstance.current = map as YMaps;

    const geoObjects = (map as { geoObjects: { add: (o: unknown) => void } }).geoObjects;

    geoObjects.add(new ymaps.Placemark(center, { hintContent: "Вы здесь" }, { preset: "islands#redDotIcon" }));

    masters.forEach((master) => {
      const color = master.verified ? "#4A7F48" : "#F07820";
      const mark = new ymaps.Placemark(
        master.coords,
        {
          balloonContentHeader: `${master.avatar} ${master.name}`,
          balloonContentBody: `
            <div style="font-family:sans-serif;padding:4px 0">
              <div style="color:#888;font-size:12px">${master.specialty}</div>
              <div style="margin-top:6px;font-size:13px">⭐ <b>${master.rating}</b> &nbsp;•&nbsp; 📍 ${master.distance}</div>
              ${master.verified ? '<div style="margin-top:4px;color:#4A7F48;font-size:12px">✓ Проверен</div>' : ""}
            </div>`,
          hintContent: `${master.avatar} ${master.name}`,
        },
        {
          iconLayout: "default#imageWithContent",
          iconImage: "",
          iconImageSize: [44, 44],
          iconImageOffset: [-22, -22],
          iconContentLayout: ymaps.templateLayoutFactory.createClass(
            `<div style="width:44px;height:44px;border-radius:50%;background:white;border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.18);cursor:pointer">${master.avatar}</div>`
          ),
        }
      );
      (mark as { events: { add: (e: string, fn: () => void) => void } }).events.add("click", () => {
        onMasterClick?.(master);
      });
      geoObjects.add(mark);
    });

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { destroy: () => void }).destroy();
        mapInstance.current = null;
      }
    };
  }, [ready, center, masters]);

  if (error) {
    return (
      <div className="mx-4 rounded-3xl bg-warm-50 border border-warm-200 flex items-center justify-center" style={{ width: "calc(100% - 2rem)", height: "56vw", maxHeight: "260px" }}>
        <p className="text-muted-foreground text-sm">Не удалось загрузить карту</p>
      </div>
    );
  }

  return (
    <div className="relative mx-4 rounded-3xl overflow-hidden" style={{ width: "calc(100% - 2rem)", height: "56vw", maxHeight: "260px" }}>
      {!ready && (
        <div className="absolute inset-0 bg-sage-100 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-warm-400 border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">Загрузка карты...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}