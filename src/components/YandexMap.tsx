import { useEffect, useRef, useState } from "react";

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

export default function YandexMap({ masters, center, onMasterClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<YMaps | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = () => {
      if (window.ymaps && typeof (window.ymaps as Record<string, unknown>).ready === "function") {
        (window.ymaps as { ready: (fn: () => void) => void }).ready(() => setReady(true));
      } else {
        setTimeout(check, 200);
      }
    };
    check();
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

    const map = new ymaps.Map(mapRef.current, {
      center,
      zoom: 14,
      controls: ["zoomControl"],
    });

    (map as { behaviors: { disable: (s: string) => void } }).behaviors.disable("scrollZoom");
    mapInstance.current = map as YMaps;

    // Метка "Вы"
    const userMark = new ymaps.Placemark(center, { hintContent: "Вы здесь" }, { preset: "islands#redDotIcon" });
    (map as { geoObjects: { add: (o: unknown) => void } }).geoObjects.add(userMark);

    // Метки мастеров
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

      (map as { geoObjects: { add: (o: unknown) => void } }).geoObjects.add(mark);
    });

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { destroy: () => void }).destroy();
        mapInstance.current = null;
      }
    };
  }, [ready, center, masters]);

  return (
    <div className="relative w-full h-72 rounded-3xl overflow-hidden mx-4" style={{ width: "calc(100% - 2rem)" }}>
      {!ready && (
        <div className="absolute inset-0 bg-sage-100 flex items-center justify-center z-10 rounded-3xl">
          <p className="text-muted-foreground text-sm">Загрузка карты...</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
