// Gym/Marker related types
export interface Marker {
  coords: number[] | { lat: number; lng: number };
  title: string;
  layout: string[];
  angle: string[];
  website?: string | null;
  instagram?: string | null;
  gmapsUrl?: string;
  author?: string;
  city?: string;
  country?: string;
  id?: string;
}

export interface ProposedMarker {
  url?: string;
  title: string;
  coords: { lat: number; lng: number } | number[];
  layout: string[];
  angle: number[];
  website?: string;
  instagram?: string;
  status?: string;
  submittedAt?: number;
  submittedBy?: string;
  author?: string;
  city?: string;
  country?: string;
  id?: string;
}

