// 카카오맵 타입 정의
export interface KakaoMaps {
    maps: {
        Map: new (container: HTMLElement, options: MapOptions) => MapInstance;
        LatLng: new (lat: number, lng: number) => LatLngInstance;
        Size: new (width: number, height: number) => SizeInstance;
        Marker: new (options: MarkerOptions) => MarkerInstance;
        MarkerImage: new (src: string, size: SizeInstance, options?: MarkerImageOptions) => MarkerImageInstance;
        CustomOverlay: new (options: CustomOverlayOptions) => CustomOverlayInstance;
        Point: new (x: number, y: number) => PointInstance;
        event: {
            addListener: (target: MarkerInstance, event: string, callback: () => void) => void;
            removeListener: (target: MarkerInstance, event: string, callback: () => void) => void;
        };
        load: (callback: () => void) => void;
    };
}

export interface MapOptions {
    center: LatLngInstance;
    level: number;
}

export interface MapInstance {
    setCenter: (latlng: LatLngInstance) => void;
    setLevel: (level: number) => void;
    getCenter: () => LatLngInstance;
    getLevel: () => number;
}

export interface LatLngInstance {
    getLat: () => number;
    getLng: () => number;
}

export interface SizeInstance {
    width: number;
    height: number;
}

export interface MarkerOptions {
    position: LatLngInstance;
    map: MapInstance;
    clickable?: boolean;
    image?: MarkerImageInstance;
}

export interface MarkerImageOptions {
    offset?: SizeInstance;
    alt?: string;
}

export interface MarkerImageInstance {
    // MarkerImage 인스턴스
}

export interface MarkerInstance {
    setMap: (map: MapInstance | null) => void;
    setImage: (image: MarkerImageInstance) => void;
    getMap: () => MapInstance | null;
}

export interface CustomOverlayOptions {
    position: LatLngInstance;
    content: string;
    yAnchor?: number;
    xAnchor?: number;
    zIndex?: number;
}

export interface CustomOverlayInstance {
    setMap: (map: MapInstance | null) => void;
    setPosition: (position: LatLngInstance) => void;
    setContent: (content: string) => void;
}

export interface PointInstance {
    x: number;
    y: number;
}

declare global {
    interface Window {
        kakao: KakaoMaps;
    }
}

